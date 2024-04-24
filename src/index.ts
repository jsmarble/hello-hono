import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { Bindings } from "./Bindings";
import { trimTrailingSlash } from "hono/trailing-slash";
import { prettyJSON } from "hono/pretty-json";
import { apiReference } from "@scalar/hono-api-reference";

import idRouter from "./id/idRouter";
import helloRouter from "./hello/helloRouter";
import profileRouter from "./profile/profileRouter";
import authMiddleware from "./authMiddleware";

export const app = new OpenAPIHono<{ Bindings: Bindings }>();

// ### MIDDLEWARE ###
app.use(prettyJSON());
app.use(trimTrailingSlash());

// ### PUBLIC ROUTES ###
app.get("/health", (c) => {
  return c.json({ message: "The server is alive!" });
});

// ### OPENAPI ###
app.doc("/openapi", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "hello-hono",
  },
});

app.get("/ui", swaggerUI({ url: "/openapi" }));
app.get("/explore", apiReference({ spec: { url: "/openapi" } }));

// ### AUTH MIDDLEWARE ###
app.use(authMiddleware());

// ### NON-PUBLIC ROUTES ###
app.get("/", (c) => {
  return c.json({ message: "Hello hono!" });
});

app.route("/id", idRouter);
app.route("/hello", helloRouter);
app.route("/profile", profileRouter);

export default app;
