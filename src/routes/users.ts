import { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { knex } from "../database";
import { z } from "zod";

export async function UsersRoutes(app: FastifyInstance){
    app.post('/create', async (request, reply) => {
        const createUser = z.object({
            name: z.string(),
            weight: z.number()
        });

        const { name, weight } = createUser.parse(request.body);

        const user_id = crypto.randomUUID();

        await knex('users').insert({
            id: user_id,
            name,
            weight
        })

        const userId = crypto.randomUUID()
        reply.cookie('userId', userId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        })

        reply.code(201).send({user: user_id});
    })
}