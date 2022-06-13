const Knex = require('knex');
const { validateConfig } = require("../config/config-manager");
validateConfig();

const { config } = require('../config/config-manager');

const connection = {
    host : config.database.host,
    port : config.database.port,
    user : config.database.user,
    password : config.database.password,
};

async function main() {
    let knex = Knex({
        client: config.database.client,
        connection,
    });

// Create database
    console.log(`Recreating database "${config.database.database}"...`);
    await knex.raw("DROP DATABASE IF EXISTS ??", config.database.database);
    await knex.raw("CREATE DATABASE ??", config.database.database);

// Database created, now use knex on it.
    knex = Knex({
        client: config.database.client,
        connection: {
            ...connection,
            database: config.database.database,
        }
    })

// Create tables.
    console.log(`Creating tables...`);
    await knex.schema
        .createTable("files", t => {
            t.string("id").notNullable();
            t.string("filename").notNullable();
            t.bigint("size").notNullable();
            t.string("uploader_uid").nullable();
            t.timestamp("uploaded_at").notNullable().defaultTo(knex.fn.now());
            t.timestamp("downloaded_at").nullable();
            t.boolean("available").notNullable().defaultTo(true);
            t.primary(["id"]);
        });

    console.log("Finished initializing database.");
}

main().then(
    v => console.log("Script finished successfully"),
    e => console.log("Something went wrong: " + e)
);
