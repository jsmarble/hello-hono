import { verifyKey } from "@unkey/api";
import { guidSchema, nameSchema } from "../schema";
import { Bindings } from "../Bindings";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

import getNewId from "./getNewId";

const app = new OpenAPIHono();
app.route("/", getNewId);

export default app;
