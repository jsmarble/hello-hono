import { verifyKey } from "@unkey/api";
import { guidSchema, nameSchema } from "../schema";
import { Bindings } from "../Bindings";
import { Hono } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

const app = new OpenAPIHono<{ Bindings: Bindings }>();

const route = createRoute({
  method: "post",
  path: "/:name/:uuid",
  request: {
    query: z.object({
      name: nameSchema,
      uuid: guidSchema,
    }),
  },
  responses: {
    200: {
      description: "User identifier recorded",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            name: nameSchema,
            uid: guidSchema,
          }),
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
  let uid = null;
  const uuid = await guidSchema.safeParseAsync(c.req.param("uuid"));
  if (uuid.success) {
    uid = uuid.data;
  } else {
    uid = crypto.randomUUID();
  }

  const nameReq = await nameSchema.safeParseAsync(c.req.param("name"));
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
