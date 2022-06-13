let config = require("./default.json");

const dockerBindings = {
    "server": {
        "host": "SERVER_HOST",
        "port": "SERVER_PORT",
    },
    "api": {
        "base_path": "API_BASE_PATH",
    },
    "database": {
        "host": "DB_HOST",
        "port": "DB_PORT",
        "user": "DB_USER",
        "password": "DB_PASSWORD",
        "database": "DB_NAME",
    },
    "uploads": {
        "path": "UPLOAD_PATH",
        "max_name_length": "MAX_NAME_LEN",
        "max_size": "MAX_FILE_SIZE",
    },
};

function buildConfigFromDocker(config, bindings) {
    // We prioritize environment variables when running on docker
    for (const binding in bindings) {
        let child = bindings[binding];
        if (typeof (child) === "string") {
            if (process.env[child]) {
                config[binding] = process.env[child];
            }
        } else {
            if(config[binding] === undefined) {
                config[binding] = {};
            }
            buildConfigFromDocker(config[binding], child);
        }
    }
}

const hierarchy = {
    "server": {
        "host": "string",
        "port": "number",
    },
    "api": {
        "base_path": "string",
    },
    "database": {
        "host": "string",
        "port": "number",
        "user": "string",
        "password": "string",
        "database": "string",
    },
    "uploads": {
        "path": "string",
        "max_name_length": "number",
        "max_size": "number",
    },
}

function throwValidationError(attr, message) {
    // https://stackoverflow.com/a/1137209
    throw {
        name: "Config Validation Error",
        level: "Config Validation",
        message: `Error when processing attribute '${attr}': ` + message,
        toString: () => this.name + ": " + this.message,
    };
}

function checkHierarchy(scope, obj, tree) {
    for (let attr in tree) {
        const hasChildren = typeof(tree[attr]) !== "string";
        let fullname = scope + attr;

        if (obj[attr] === undefined) {
            // Attribute not present in config file
            throwValidationError(fullname, "Attribute missing from config file");
        }

        if (!hasChildren) {
            if(typeof(obj[attr]) === "string" && tree[attr] === "number"
                && !isNaN(Number(obj[attr]))) {
                obj[attr] = Number(obj[attr]);
            }

            if(typeof(obj[attr]) !== tree[attr]) {
                // Attribute not present in config file
                throwValidationError(fullname, `Attribute type mismatch (expecting ${tree[attr]}, ` +
                    `found ${typeof(obj[attr])})`);
            }
        }
        else {
            checkHierarchy(scope + attr + ".", obj[attr], tree[attr]);
        }
    }
}

function validateConfig() {
    checkHierarchy("", config, hierarchy);
}

if(process.env.IN_DOCKER) {
    buildConfigFromDocker(config, dockerBindings);
}

module.exports = {config, validateConfig};