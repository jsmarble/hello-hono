import { profileSchema, nameSchema, uuidSchema } from "../schema";
import { drizzle as drizzle_d1 } from "drizzle-orm/d1";
import { drizzle as drizzle_turso } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import { profile } from "./profileRouter";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { Bindings } from "../Bindings";

const app = new OpenAPIHono<{ Bindings: Bindings }>();

const route = createRoute({
  method: "post",
  path: "/",
  requestParams: {
    body: profileSchema,
  },
  responses: {
    200: {
      description: "User identifier recorded",
      content: {
        "application/json": {
          schema: profileSchema,
        },
      },
    },
    400: {
      description: "An error indicating the issue with the request",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
});

app.openapi(route, async (c) => {
  const p = await profileSchema.safeParseAsync(await c.req.json());
  if (!p.success) {
    return c.json(
      {
        error: p.error.errors[0].message,
      },
      400
    );
  }

  try {
    const TURSO_URL = c.env.TURSO_URL;
    const TURSO_TOKEN = c.env.TURSO_AUTH_TOKEN;

    const turso = createClient({
      url: TURSO_URL,
      authToken: TURSO_TOKEN,
    });

    const db_turso = drizzle_turso(turso);
    const db_d1 = drizzle_d1(c.env.D1);
    const result_d1 = await db_d1.insert(profile).values(p.data).execute();

    const result_turso = await db_turso
      .insert(profile)
      .values(p.data)
      .execute();

    if (!result_d1.success) {
      console.error(result_d1.error);
      return c.json(
        {
          error: "Internal server error.",
        },
        500
      );
    }

    return c.json(p.data);
  } catch (e) {
    console.error(e);
    return c.json(
      {
        error: "Internal server error.",
      },
      500
    );
  }
});

export default app;
