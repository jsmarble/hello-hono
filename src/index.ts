import { Hono } from "hono";
import { Bindings } from "./Bindings";
import { trimTrailingSlash } from "hono/trailing-slash";
import { prettyJSON } from "hono/pretty-json";

import idRouter from "./idRouter";
import helloRouter from "./helloRouter";
import profileRouter from "./profileRouter";
import authMiddleware from "./authMiddleware";

export const app = new Hono<{ Bindings: Bindings }>();

app.use(prettyJSON());
app.use(trimTrailingSlash());

app.get("/health", (c) => {
  return c.json({ message: "The server is alive!" });
});

app.use(authMiddleware());
app.get("/", (c) => {
  return c.json({ message: "Hello hono!" });
});

app.route("/id", idRouter);
app.route("/hello", helloRouter);
app.route("/profile", profileRouter);

export default app;
