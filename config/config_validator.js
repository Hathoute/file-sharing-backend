const config = require("./default.json");

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

module.exports = () => validateConfig();