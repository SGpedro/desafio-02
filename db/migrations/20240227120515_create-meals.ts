import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table) =>{
        table.uuid('id').primary(),
        table.string('name').notNullable(),
        table.string('description').notNullable(),
        table.dateTime('date').defaultTo(knex.fn.now()).notNullable(),
        table.boolean('in_diet').notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('meals');
}

