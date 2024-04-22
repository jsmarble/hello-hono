import { verifyKey } from "@unkey/api";
import { guidSchema, profileSchema } from "./schema";
import { Bindings } from "./Bindings";
import { Hono } from "hono";

import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";

const profile = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
});

const profileRouter = new Hono<{ Bindings: Bindings }>();

profileRouter.get("/:uuid", async (c) => {
  //first validate the api key
  const apiKey = c.req.header("Authorization")?.replace("Bearer ", "");
  if (!apiKey) {
    return c.json(
      {
        error: "API key is required via Authorization header",
      },
      400
    );
  }

  const v = await verifyKey(apiKey);
  if (v.error) {
    return c.json(
      {
        error: "Internal server error",
      },
      500
    );
  }

  if (!v.result.valid) {
    return c.json(
      {
        error: "Invalid API key",
      },
      401
    );
  }

  const uuid = guidSchema.safeParse(c.req.param("uuid"));
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

    const db = drizzle(turso);
    const result = await db
      .select()
      .from(profile)
      .where(eq(profile.id, uuid.data))
      .limit(1)
      .execute();

    if (!result || result.length === 0) {
      return c.json(
        {
          error: "Profile not found.",
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

profileRouter.post("/", async (c) => {
  //first validate the api key
  const apiKey = c.req.header("Authorization")?.replace("Bearer ", "");
  if (!apiKey) {
    return c.json(
      {
        error: "API key is required via Authorization header",
      },
      400
    );
  }

  const v = await verifyKey(apiKey);
  if (v.error) {
    return c.json(
      {
        error: "Internal server error",
      },
      500
    );
  }

  if (!v.result.valid) {
    return c.json(
      {
        error: "Invalid API key",
      },
      401
    );
  }

  let profile = profileSchema.safeParse(await c.req.json());
  if (!profile.success) {
    return c.json(
      {
        error: profile.error.errors[0].message,
      },
      400
    );
  }

  //TODO: Save profile to D1 by uuid
  return c.text("Profile saved.");
});

export default profileRouter;
