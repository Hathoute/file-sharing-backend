const Knex = require('knex');

// TODO: use data from config file
const databaseName = "simple_file_sharing";
const client = 'mysql';
const connection = {
    host : '127.0.0.1',
    port : 3306,
    user : 'root',
    password : '',
};

async function main() {
    let knex = Knex({
        client,
        connection,
    });

// Create database
    console.log(`Recreating database "${databaseName}"...`);
    await knex.raw("DROP DATABASE IF EXISTS ??", databaseName);
    await knex.raw("CREATE DATABASE ??", databaseName);

// Database created, now use knex on it.
    knex = Knex({
        client,
        connection: {
            ...connection,
            database: databaseName,
        }
    })

// Create tables.
    console.log(`Creating tables...`);
    await knex.schema
        .createTable("files", t => {
            t.string("id").notNullable();
            t.string("filename").notNullable();
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
