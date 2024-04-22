import { verifyKey } from "@unkey/api";
import { Hono } from "hono";

const authMiddleware = new Hono<{}>();

authMiddleware.use(async (c, next) => {
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

  await next();
});

export default authMiddleware;
