import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

export const app = new OpenAPIHono();

const route = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      description: "Hello again!",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
              },
            },
          },
        },
      },
    },
  },
});

app.openapi(route, (c) => {
  return c.json({ message: "Hello again!" });
});

export default app;
