import { verifyKey } from "@unkey/api";
import { uuidSchema, nameSchema } from "../schema";
import { Bindings } from "../Bindings";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

const app = new OpenAPIHono<{ Bindings: Bindings }>();

const route = createRoute({
  method: "post",
  path: "/:name/:uuid",
  requestParams: {
    query: z.object({
      name: nameSchema,
      uuid: uuidSchema,
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
            uuid: uuidSchema,
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
  let uuid = null;
  const uuidParam = c.req.param("uuid");
  console.debug(`UUID param: ${uuidParam}`);
  const zuuid = await uuidSchema.safeParseAsync(uuidParam);
  if (zuuid.success) {
    uuid = zuuid.data;
  } else {
    uuid = crypto.randomUUID();
    console.info(`No valid UUID was passed so generated new UUID '${uuid}'`);
  }

  const nameParam = c.req.param("name");
  console.debug(`Name param: ${nameParam}`);
  const zname = await nameSchema.safeParseAsync(nameParam);
  if (!zname.success) {
    return c.json(
      {
        error: zname.error.errors[0].message,
      },
      400
    );
  }

  await c.env.NAMES_KV.put(uuid, zname.data);
  return c.json({
    message: "User identifier recorded",
    name: zname.data,
    uuid: uuid,
  });
});

export default app;
