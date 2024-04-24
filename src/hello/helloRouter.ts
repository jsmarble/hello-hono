import { Bindings } from "../Bindings";
import get from "./get";
import getByName from "./getByName";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

export const app = new OpenAPIHono<{ Bindings: Bindings }>();

app.route("/", get);
app.route("/", getByName);

export default app;
