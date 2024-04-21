type Bindings = {
  NAMES_KV: KVNamespace;
};

import { Hono } from "hono";
import { z } from "zod";
import type { KVNamespace } from "@cloudflare/workers-types";
import { verifyKey } from "@unkey/api";

const app = new Hono<{ Bindings: Bindings }>();

const guidSchema = z.string().uuid();

const nameSchema = z
  .string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  })
  .max(20, { message: "Name must be 20 or fewer characters long" })
  .min(2, { message: "Name must be 2 or more characters long" });

app.get("/", (c) => {
  return c.json({ message: "Hello world!" });
});

app.get("/hello", (c) => {
  return c.json({ message: "Hello again!" });
});

app.get("/hello/:name", async (c) => {
  let name = null;
  const uuid = guidSchema.safeParse(c.req.param("name"));
  if (uuid.success) {
    const uid = uuid.data;
    const n = await c.env.NAMES_KV.get(uid);
    if (n === null) {
      return c.json(
        {
          error: "User not found.",
          uuid: uid,
        },
        404
      );
    }
    name = n;
  }

  if (name === null) {
    const nameReq = nameSchema.safeParse(c.req.param("name"));
    if (!nameReq.success) {
      return c.json(
        {
          error: nameReq.error.errors[0].message,
        },
        400
      );
    } else {
      name = nameReq.data;
    }
  }

  return c.json({ message: `Hello ${name}!` });
});

app.post("/id/:name/:uuid", async (c) => {
  let uid = null;
  const uuid = guidSchema.safeParse(c.req.param("uuid"));
  if (uuid.success) {
    uid = uuid.data;
  } else {
    uid = crypto.randomUUID();
  }

  const nameReq = nameSchema.safeParse(c.req.param("name"));
  if (!nameReq.success) {
    return c.json(
      {
        error: nameReq.error.errors[0].message,
      },
      400
    );
  }

  await c.env.NAMES_KV.put(uid, nameReq.data);
  return c.json({
    message: "User identifier recorded",
    name: nameReq.data,
    uid: uid,
  });
});

export default app;
