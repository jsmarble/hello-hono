import { Hono } from 'hono'
import { z } from 'zod';

const app = new Hono()

const nameSchema = z.string({
  required_error: "Name is required",
  invalid_type_error: "Name must be a string",
})
.max(20, { message: "Name must be 20 or fewer characters long" })
.min(2, { message: "Name must be 2 or more characters long" });

app.get('/', (c) => {
  return c.text('Hello world!')
})
app.get('/hello', (c) => {
  return c.text('Hello again!')
})
app.get('/hello/:name', (c) => {
  var name = nameSchema.safeParse(c.req.param('name'))
  if (!name.success) {
    return c.json({
      error: name.error.errors[0].message
    }, 400)
  }
  return c.text(`Hello ${name.data}!`)
})

export default app
