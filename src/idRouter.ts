import { verifyKey } from "@unkey/api";
import { guidSchema, nameSchema } from "./schema";
import { Bindings } from "./Bindings";
import { Hono } from "hono";

const idRouter = new Hono<{ Bindings: Bindings }>();

idRouter.post("/:name/:uuid", async (c) => {
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

export default idRouter;
