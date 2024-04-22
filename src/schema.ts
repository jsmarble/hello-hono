import { z } from "zod";

export const guidSchema = z.string().uuid();

export const nameSchema = z
  .string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  })
  .max(20, { message: "Name must be 20 or fewer characters long" })
  .min(2, { message: "Name must be 2 or more characters long" });

export const profileSchema = z.object({
  name: nameSchema,
  email: z.string().email(),
  id: guidSchema,
});
