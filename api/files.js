const express = require('express');
const router = express.Router();
const dbWrapper = require('../database/database-wrapper');

const os = require('os');
const path = require('path');
const fs = require('fs');
const busboy = require('busboy');

// TODO: Grab dest directory from config file.
const saveDir = path.join(__dirname, "../uploads");
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
                console.log("Error: ", err);
                res.status(404).end();
            })
});

router.post('/file', (req, res, next) => {
    const bb = busboy({ headers: req.headers });
    const fileId = makeId(10);
    const tempSaveTo = path.join(os.tmpdir(), fileId);
    const saveTo = path.join(saveDir, fileId);
    let fileName;
    bb.on('file', (name, file, info) => {
        fileName = info.filename;
        file.pipe(fs.createWriteStream(tempSaveTo));
    });
    // TODO: Implement used ids using cookies...
    const userId = null;

    bb.on('close', () => {
        fs.renameSync(tempSaveTo, saveTo);
        dbWrapper.saveFile(fileId, fileName, userId);
        res.status(200);
        res.set("Connection", "close");
        res.json({fileId});
        res.end();
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
