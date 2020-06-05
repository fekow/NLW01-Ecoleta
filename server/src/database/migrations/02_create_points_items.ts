import Knex from 'knex' 
//puxo o type com letra maiuscula e delimito o tipo da variavel eganho acessoao intelissense
export async function up(knex: Knex) {
  return knex.schema.createTable('point_items', table =>{
    table.increments('id').primary();
    table.integer('point_id').notNullable().references('id').inTable('points');
    table.integer('item_id').notNullable().references('id').inTable('items');
  })
}

export async function down(knex: Knex) {
  return knex.schema.dropTable('point_items');
}