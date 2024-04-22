import { Hono } from "hono";
import { Bindings } from "./Bindings";

import idRouter from "./idRouter";
import helloRouter from "./helloRouter";
import profileRouter from "./profileRouter";
import authMiddleware from "./authMiddleware";

export const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.json({ message: "Hello hono!" });
});

app.route("/id", authMiddleware);
app.route("/id", idRouter);

app.route("/hello", helloRouter);

app.route("/profile", authMiddleware);
app.route("/profile", profileRouter);

export default app;
