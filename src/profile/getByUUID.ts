import { uuidSchema, profileSchema } from "../schema";
import { eq } from "drizzle-orm";
import { drizzle as drizzle_d1 } from "drizzle-orm/d1";
import { drizzle as drizzle_turso } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import { profile } from "./profileRouter";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { Bindings } from "../Bindings";

const app = new OpenAPIHono<{ Bindings: Bindings }>();

const route = createRoute({
  method: "get",
  path: "/:uuid",
  requestParams: {
    query: z.object({
      uuid: uuidSchema,
    }),
  },
  responses: {
    200: {
      description: "Return profile json",
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
    404: {
      description: "Profile not found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
            uuid: uuidSchema,
          }),
        },
      },
    },
  },
});

app.openapi(route, async (c) => {
  const uuid = await uuidSchema.safeParseAsync(c.req.param("uuid"));
  if (!uuid.success) {
    return c.json(
      {
        error: "Invalid profile ID.",
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

    let db_turso = drizzle_turso(turso);
    let db_d1 = drizzle_d1(c.env.D1);
    const result = await db_turso
      .select()
      .from(profile)
      .where(eq(profile.id, uuid.data))
      .limit(1)
      .execute();

    if (!result || result.length === 0) {
      return c.json(
        {
          error: "Profile not found.",
          uuid: uuid.data,
        },
        404
      );
    }

    const p = await profileSchema.safeParseAsync(result[0]);
    if (!p.success) {
      console.error(p.error.errors);
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
