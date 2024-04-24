import { verifyKey } from "@unkey/api";
import { uuidSchema, nameSchema } from "../schema";
import { Bindings } from "../Bindings";
import { OpenAPIHono } from "@hono/zod-openapi";

import getNewId from "./getNewId";

const app = new OpenAPIHono();
app.route("/", getNewId);

export default app;
