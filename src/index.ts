import { Hono } from "hono";
import { Bindings } from "./Bindings";

import idRouter from "./idRouter";
import helloRouter from "./helloRouter";
import { guidSchema, nameSchema } from "./schema";

export const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.json({ message: "Hello world!" });
});

app.route("/id", idRouter);
app.route("/hello", helloRouter);

export default app;
