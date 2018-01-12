/**
 * Created by Henrie on 12/1/2018.
 */
const express = require('express'),
    app = express(),
    fs = require('fs'),
    glob = require('glob'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    storage = multer.diskStorage({
        destination (req, file, cb) {
            // 文件目錄
            cb(null, './upload')
        },
        filename (req, file, cb) {
            // 文件名稱
            let fileFormat = (file.originalname).split(".");
            cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
        }
    }),
    uploader = multer({
        storage: storage
    });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // 跨域
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT"); // 跨域
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, userToken"); // 自定義請求頭
    next();
});

let server,
    fsReader = (req, res, filepath) => {
        fs.readFile(__dirname + '/' + filepath, 'utf8', (err, data) => {
            let ret = {
                resultCode: '000000',
                resultMsg: '成功',
                data: JSON.parse(data)
            }
            res.send(ret);
            res.end();
        });
    },
    createApi = (globPath) => { // 一般接口
        let files = glob.sync(globPath);
        files.forEach((filepath) => {
            let split = filepath.split('/'),
                type = split[1],
                name = split[2].split('.')[0];
            switch (type) {
                case 'post':
                    app.post('/' + name, (req, res) => {
                        fsReader(req, res, filepath);
                    });
                    break;
                case 'get':
                    app.get('/' + name, (req, res) => {
                        fsReader(req, res, filepath);
                    });
                    break;
            }
        });
    },
    uploadApi = () => { // 上傳接口
        app.post('/attachement/upload', uploader.single('myfile'), (req, res) => {
            let buf = fs.readFileSync(__dirname + '/' + req.file.path);
            res.write(JSON.stringify({
                resultCode: '000000',
                resultMsg: '成功',
                data: {
                    base64: buf.toString('base64'),
                    attachementNo: req.file.filename // 一般應為ID，不建數據庫就直接用名字吧
                }
            }));
            res.end();
        });
    },
    downloadApi = () => {
        app.get('/attachement/downloadFile', (req, res) => {
            let params = JSON.parse(req.query.params),
                filepath = '/upload/' + params.attachementNo,
                fReadStream;
            fs.readFile(__dirname + filepath, 'utf8', (err, data) => {
                res.set({
                    "Content-type":"application/octet-stream",
                    "Content-Disposition":"attachment;filename=" + encodeURI(params.attachementNo)
                });
                fReadStream = fs.createReadStream(__dirname + filepath);
                fReadStream.on('data', (chunk) => {
                    res.write(chunk, 'binary');
                });
                fReadStream.on('end', () => {
                    res.end();
                });
            });
        });
        app.get('/attachement/downloadBase64', (req, res) => {
            let params = JSON.parse(req.query.params),
                buf = fs.readFileSync(__dirname + '/upload/' + params.attachementNo);
            res.write(JSON.stringify({
                resultCode: '000000',
                resultMsg: '成功',
                data: {
                    base64: buf.toString('base64')
                }
            }));
            res.end();
        });
    };

createApi('json/**/**.json');
uploadApi();
downloadApi();

server = app.listen(8084, () => {
    var host = server.address().address,
        port = server.address().port;
    console.log('致Root。127.0.0.1:' + port);
});