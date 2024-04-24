import { uuidSchema, nameSchema } from "../schema";
import { Bindings } from "../Bindings";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

export const app = new OpenAPIHono<{ Bindings: Bindings }>();

const route = createRoute({
  method: "get",
  path: "/:name",
  requestParams: {
    query: z.object({
      name: nameSchema,
    }),
  },
  responses: {
    200: {
      description: "Hello!",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
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
    404: {
      description: "User not found",
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
  let name = null;
  const uuid = await uuidSchema.safeParseAsync(c.req.param("name"));
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
    const nameReq = await nameSchema.safeParseAsync(c.req.param("name"));
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

export default app;
