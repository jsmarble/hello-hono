import { Bindings } from "../Bindings";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import getByUUID from "./getByUUID";
import post from "./post";

export const profile = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
});

const app = new OpenAPIHono<{ Bindings: Bindings }>();

app.route("/", getByUUID);
app.route("/", post);

export default app;
