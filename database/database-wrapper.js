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

class DatabaseWrapper {
    #knex = Knex({
        client,
        connection: {
            ...connection,
            database: databaseName,
        }
    });

    constructor() {
        this.#knex = Knex({
                client,
                connection: {
                    ...connection,
                    database: databaseName,
                }
            });
    }

    saveFile(id, fileName, userId) {
        return this.#knex("files").insert({
            id: id,
            filename: fileName,
            uploader_uid: userId,
        });
    }

    selectById(id) {
        return this.#knex("files").select()
            .where({id: id})
            .first();
    }

    selectByUserId(uid) {
        return this.#knex("files").select()
            .where("uploader_uid", uid);
    }

    onDownload(id) {
        this.#knex("files")
            .where("id", id)
            .update({"downloaded_at": this.#knex.fn.now(), "available": false})
            .then((res) => {
                console.log(res)
            }, (err) => {
                console.log(err)
            })
    }
}

module.exports = new DatabaseWrapper();