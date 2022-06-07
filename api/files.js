const express = require('express');
const router = express.Router();
const dbWrapper = require('../database/database-wrapper');
const config = require("../config/default.json")

const os = require('os');
const path = require('path');
const fs = require('fs');
const busboy = require('busboy');

let saveDir = config.uploads.path;
if(!path.isAbsolute(saveDir)) {
    saveDir = path.join(__dirname, "..", saveDir);
}
if(!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir);
}

// TODO: Remember to remove this testing...
router.get('/file', (req, res, next) => {
    res.render('index');
})


router.get('/file/:fileId', function(req, res, next) {
    dbWrapper.selectById(req.params.fileId)
        .then((file) => {
                if(file === undefined) {
                    // 404: NOTFOUND
                    res.status(404).end();
                    return;
                }
                else if(!file.available) {
                    // 410: GONE
                    res.status(410)
                        .json({downloadedAt: file.downloaded_at})
                        .end();
                    return;
                }

                const filepath = path.join(saveDir, file.id);
                const filename = file.filename;
                const mimetype = "application/octet-stream";
                res.set('Content-disposition', 'attachment; filename=' + filename);
                res.set('Content-type', mimetype);

                dbWrapper.onDownload(file.id)

                let stream = fs.createReadStream(filepath);
                stream.pipe(res);
                stream.on("close", () => {
                    fs.rmSync(filepath);
                });
            },
            (err) => {
                console.log("Error '" + req.route + "':", err);
                res.status(500);
                res.json({
                    errorCode: "ERR_DB_UNKNOWN",
                    errorString: "Unknown database error."
                });
            })
});


router.get('/user/:userId', function(req, res, next) {
    dbWrapper.selectByUserId(req.params.userId)
        .then((files) => {
                // Exploded files to have control over returned data.
                let data = files.map(f => ({
                    id: f.id,
                    filename: f.filename,
                    uploaded_at: f.uploaded_at,
                    downloaded_at: f.downloaded_at,
                    available: f.available,
                }));
                res.status(200);
                res.json(data);
            },
            (err) => {
                console.log("Error '" + req.route + "':", err);
                res.status(500);
                res.json({
                    errorCode: "ERR_DB_UNKNOWN",
                    errorString: "Unknown database error."
                });
            })
});

router.post('/file', (req, res, next) => {
    const bb = busboy({ headers: req.headers, limits: { files: 1, fileSize: config.uploads.max_size } });
    const fileId = makeId(10);
    const tempSaveTo = path.join(os.tmpdir(), fileId);
    const saveTo = path.join(saveDir, fileId);
    let fileName;
    let limit = false;

    bb.on('file', (name, file, info) => {
        file.on('limit', function(data) {
            limit = true;
        });

        fileName = info.filename;
        if(fileName.length > config.uploads.max_name_length) {
            res.status(400);
            res.json({
                errorCode: "ERR_FILENAME_LONG",
                errorString: `The filename is too long (max allowed: ${config.uploads.max_name_length} characters).`
            });
            return;
        }
        file.pipe(fs.createWriteStream(tempSaveTo));
    });

    // TODO: Implement used ids using cookies...
    const userId = null;

    bb.on('close', () => {
        if(limit) {
            res.status(400);
            res.json({
                errorCode: "ERR_FILE_TOO_BIG",
                errorString: `The file is too big (max allowed: ${config.uploads.max_size} bytes).`
            });
            return;
        }

        fs.renameSync(tempSaveTo, saveTo);
        dbWrapper.saveFile(fileId, fileName, userId)
            .then((_) => {
                res.status(200);
                res.set("Connection", "close");
                res.json({fileId});
                res.end();
            }, (err) => {
                console.log("Error '" + req.route + "':", err);
                res.status(500);
                res.json({
                    errorCode: "ERR_DB_UNKNOWN",
                    errorString: "Unknown database error."
                });
            });
    });

    req.pipe(bb);
})

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeId(length) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

module.exports = router;
