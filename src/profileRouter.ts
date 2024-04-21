import { guidSchema } from "./schema";
import { Bindings } from "./Bindings";
import { Hono } from "hono";

const helloRouter = new Hono<{ Bindings: Bindings }>();

helloRouter.get("/:uuid", async (c) => {
  let name = null;
  const uuid = guidSchema.safeParse(c.req.param("uuid"));
  if (!uuid.success) {
    return c.json(
      {
        error: "Invalid profile ID.",
      },
      400
    );
  }

  

  return c.json({ message: `Hello ${name}!` });
});

export default helloRouter;
