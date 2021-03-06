const Knex = require('knex');
const { config } = require('../config/config-manager');

const connection = {
    host : config.database.host,
    port : config.database.port,
    user : config.database.user,
    password : config.database.password,
};

class DatabaseWrapper {
    #knex = Knex({
        client: config.database.client,
        connection: {
            ...connection,
            database: config.database.database,
        }
    });

    saveFile(id, fileName, size, userId) {
        return this.#knex("files").insert({
            id: id,
            filename: fileName,
            size: size,
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