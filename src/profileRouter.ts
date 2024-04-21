import { verifyKey } from "@unkey/api";
import { guidSchema, profileSchema } from "./schema";
import { Bindings } from "./Bindings";
import { Hono } from "hono";

const profileRouter = new Hono<{ Bindings: Bindings }>();

profileRouter.get("/:uuid", async (c) => {
  //first validate the api key
  const apiKey = c.req.header("Authorization")?.replace("Bearer ", "");
  if (!apiKey) {
    return c.json(
      {
        error: "API key is required via Authorization header",
      },
      400
    );
  }

  const v = await verifyKey(apiKey);
  if (v.error) {
    return c.json(
      {
        error: "Internal server error",
      },
      500
    );
  }

  if (!v.result.valid) {
    return c.json(
      {
        error: "Invalid API key",
      },
      401
    );
  }

  const uuid = guidSchema.safeParse(c.req.param("uuid"));
  if (!uuid.success) {
    return c.json(
      {
        error: "Invalid profile ID.",
      },
      400
    );
  }

  //TODO: get profile from D1 by uuid
  let profile = {
    name: "John Doe",
    email: "jdoe@gmail.com",
    id: uuid.data,
  }

  return c.json(profile);
});

profileRouter.post("/", async (c) => {
  //first validate the api key
  const apiKey = c.req.header("Authorization")?.replace("Bearer ", "");
  if (!apiKey) {
    return c.json(
      {
        error: "API key is required via Authorization header",
      },
      400
    );
  }

  const v = await verifyKey(apiKey);
  if (v.error) {
    return c.json(
      {
        error: "Internal server error",
      },
      500
    );
  }

  if (!v.result.valid) {
    return c.json(
      {
        error: "Invalid API key",
      },
      401
    );
  }

  let profile = profileSchema.safeParse(await c.req.json());
  if (!profile.success) {
    return c.json(
      {
        error: profile.error.errors[0].message,
      },
      400
    );
  }

  //TODO: Save profile to D1 by uuid
  return c.text("Profile saved.");
});

export default profileRouter;
