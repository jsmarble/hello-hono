import { verifyKey } from "@unkey/api";
import { Hono, MiddlewareHandler } from "hono";

export const authMiddleware = (): MiddlewareHandler => async (c, next) => {
  //first validate the api key
  const apiKey = c.req.header("Authorization")?.replace("Bearer ", "");
  if (!apiKey) {
    return c.json(
      {
        error: "API key is required via Authorization header",
      },
      401
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
};

export default authMiddleware;
