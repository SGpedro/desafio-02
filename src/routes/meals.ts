import { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { knex } from "../database";
import { z } from "zod";

export async function MealsRoutes(app: FastifyInstance){

    app.post('/create', async (request, reply) => {
        const createMeal = z.object({
            name: z.string(),
            description: z.string(),
            in_diet: z.boolean()
        });

        const { name, description, in_diet } = createMeal.parse(request.body);

        let user_id = request.cookies.userId
        if (!user_id) {
            return reply.status(401).send('Unauthorized');
        }

        const meal_id = crypto.randomUUID();

        await knex('meals').insert({
            id: meal_id,
            name,
            description,
            in_diet,
            user_id
        });

        return reply.status(201).send({meal_id})
    })

    app.put('/edit/:id', async (request, reply) => {
        const getMealId = z.object({
            id: z.string().uuid(),
        })
      
        const { id } = getMealId.parse(request.params)

        let user_id = request.cookies.userId
        if (!user_id) {
            return reply.status(401).send('Unauthorized');
        }

        const meal = await knex('meals').select().where({id})

        if(meal.length == 0) return reply.status(404).send("Meal not found")

        const userMeal = meal[0];
        if(userMeal.user_id !== user_id) return reply.status(404).send("This meal doesn't belong to this user");

        const editMeal = z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            in_diet: z.boolean().optional()
        });

        const { name, description, in_diet } = editMeal.parse(request.body);

        await knex('meals').where({id}).update({
            name: name ? name : userMeal.name,
            description: description ? description : userMeal.description,
            in_diet: in_diet ? in_diet : userMeal.in_diet,
        })

        return reply.status(200).send('Meal updated')
    })

    app.delete('/delete/:id', async (request, reply) => {
        const getMealId = z.object({
            id: z.string().uuid(),
        })
      
        const { id } = getMealId.parse(request.params)

        let user_id = request.cookies.userId
        if (!user_id) {
            return reply.status(401).send('Unauthorized');
        }

        const meal = await knex('meals').where({id}).del();

        return reply.status(200).send({meal});
    })

    app.get('/list_all', async (request, reply) => {
        let user_id = request.cookies.userId
        if (!user_id) {
            return reply.status(401).send('Unauthorized');
        }

        const meals = await knex('meals').where({user_id});
        return reply.status(200).send({meals});

    })

    app.get('/get/:id', async (request, reply) => {
        const getMealId = z.object({
            id: z.string().uuid(),
        })
      
        const { id } = getMealId.parse(request.params)

        let user_id = request.cookies.userId
        if (!user_id) {
            return reply.status(401).send('Unauthorized');
        }

        const meal = await knex('meals').where({id});

        return reply.status(200).send({meal});
    })

    app.get('/metrics', async (request, reply) => {
        let user_id = request.cookies.userId
        if (!user_id) {
            return reply.status(401).send('Unauthorized');
        }

        const meals = await knex('meals').where({user_id});

        let inDietMeals = 0;
        let outDietMeals = 0;
        let streakDietMeals = 0;
        let lastBestStreak = 0;
        meals.forEach(meal => {
            if(meal.in_diet){
                inDietMeals++;
                streakDietMeals++;
            } else{
                lastBestStreak = streakDietMeals;
                outDietMeals++;
                streakDietMeals = 0;
            }
        });

        const metric = {
            meals_in_diet: inDietMeals,
            meals_not_in_diet: outDietMeals,
            streak_meals: lastBestStreak,
            total_meals: meals.length
        };

        return reply.status(200).send(metric);
    })
}