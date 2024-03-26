import Fastify from "fastify";
import { UsersRoutes } from "./routes/users";
import cookie from '@fastify/cookie'
import { MealsRoutes } from "./routes/meals";

const app = Fastify({logger: true})

app.register(cookie)
app.register(UsersRoutes, {prefix: '/users'})
app.register(MealsRoutes, {prefix: '/meals'})

app.listen({port: 3333})