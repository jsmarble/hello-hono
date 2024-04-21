import { verifyKey } from "@unkey/api";
import { guidSchema, nameSchema } from "./schema";
import { Bindings } from "./Bindings";
import { Hono } from "hono";

const helloRouter = new Hono<{ Bindings: Bindings }>();

helloRouter.get("/", (c) => {
  return c.json({ message: "Hello again!" });
});

helloRouter.get("/:name", async (c) => {
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

export default helloRouter;
