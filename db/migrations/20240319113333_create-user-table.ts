import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('users', (table)=>{
        table.uuid('id').primary(),
        table.string('name').notNullable(),
        table.string('weight').notNullable(),
        table.dateTime('date').defaultTo(knex.fn.now()).notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropSchemaIfExists('users');
}

