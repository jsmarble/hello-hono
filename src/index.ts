import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { Bindings } from "./Bindings";
import { trimTrailingSlash } from "hono/trailing-slash";
import { prettyJSON } from "hono/pretty-json";

import idRouter from "./id/idRouter";
import helloRouter from "./helloRouter";
import profileRouter from "./profileRouter";
import authMiddleware from "./authMiddleware";

export const app = new OpenAPIHono<{ Bindings: Bindings }>();

app.use(prettyJSON());
app.use(trimTrailingSlash());

app.get("/health", (c) => {
  return c.json({ message: "The server is alive!" });
});

app.doc("/openapi", {
  openapi: "3.0.0",
    info: {
        version: "1.0.0",
        title: "hello-hono",
    },
});

app.get("/ui", swaggerUI({ url: "/openapi" }));

app.use(authMiddleware());
app.get("/", (c) => {
  return c.json({ message: "Hello hono!" });
});

app.route("/id", idRouter);
app.route("/hello", helloRouter);
app.route("/profile", profileRouter);

export default app;
