/**
 * Created by Henrie on 12/1/2018.
 */

const config = require('./config.js'),
    unirest = require('unirest'),
    Pac = require('node-pac'),
    express = require('express'),
    errorHandler = require('express-error-handler'),
    handler = errorHandler({
        handlers: {
            '404': (err, req, res) => {
                trans(req.body, res, req.url);
            }
        }
    }),
    app = express(),
    fs = require('fs'),
    glob = require('glob'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    accessControlAllowHeaders = config.accessControlAllowHeaders ? ',' + config.accessControlAllowHeaders : '',
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
    }),
    log4js = require('log4js');

log4js.configure({
    appenders: {
        console: { type: 'console' }
    },
    categories: {
        http: { appenders: ['console'], level: 'info' },
        params: { appenders: ['console'], level: 'mark' },
        warner: { appenders: ['console'], level: 'warn' },
        default: { appenders: ['console'], level: 'info' }
    }
});

let connectLogger = log4js.getLogger('http'),
    logger = log4js.getLogger('params'),
    warner = log4js.getLogger('warner');
app.use(log4js.connectLogger(connectLogger, {
    level: 'auto',
    format (req, res, str) {
        // method, 請求接口, 狀態碼, 響應時間
        let arr = [req.method, req.url.split('?')[0], res.statusCode, res.responseTime + 'ms'];
        return arr.join(' ') + '\n';
    }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // 跨域
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT"); // 跨域
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept" + accessControlAllowHeaders);
    next();
});
app.use(errorHandler.httpError(404));
app.use(handler);

let server,
    fsReader = (req, res, filepath) => {
        fs.readFile(__dirname + '/' + filepath, 'utf8', (err, data) => {
            res.send(data);
            res.end();
        });
    },
    passProxy = (data, mockRes, Request) => {
        if (config.proxyUrl) {
            Request.proxy(config.proxyUrl);
            getRequest(data, mockRes, Request);
        } else {
            let pac = new Pac(config.pac);
            pac.FindWhistleProxyForURL(config.transHost, (err, res) => {
                let proxy = 'http://' + res.split('//')[1];
                Request.proxy(proxy);
                getRequest(data, mockRes, Request);
            });
        }
    },
    getRequest = (data, mockRes, Request) => {
        Request.form(data).end((response) => {
            if (response.statusCode === 200) {
                logger.mark(response.body);
                mockRes.send(response.body);
                mockRes.end();
            } else {
                mockRes.send(response.statusCode);
                mockRes.end();
            }
        })
    },
    trans = (data, mockRes, url) => {
        let Request = unirest.post(config.transHost + config.transPath + url);
        warner.warn('mockserver沒有這個接口，轉發到' + config.transHost + config.transPath + url + '中');
        if (config.useProxy) {
            passProxy(data, mockRes, Request);
        } else {
            getRequest(data, mockRes, Request);
        }
    },
    createApi = () => { // 一般接口
        let files = glob.sync('json/**/**.json', {matchBase:true});
        files.forEach((filepath) => {
            let split = filepath.split('/'),
                type = split[1],
                url = filepath.replace('json/', '').replace(type, '').replace('.json', '').replace(/@/g, '/');
            switch (type) {
                case 'post':
                    app.post(url, (req, res) => {
                        logger.mark(req.body);
                        fsReader(req, res, filepath);
                    });
                    break;
                case 'get':
                    app.get(url, (req, res) => {
                        logger.mark(req.query);
                        fsReader(req, res, filepath);
                    });
                    break;
            }
            console.log(url);
        });
    },
    uploadApi = () => { // 上傳接口
        app.post(config.uploadUrl, uploader.single(config.uploadName), (req, res) => {
            logger.info(req.body);
            let buf = fs.readFileSync(__dirname + '/' + req.file.path);
            res.write(JSON.stringify({
                resultCode: "000000",
                resultMsg: '成功',
                data: {
                    base64: buf.toString('base64'),
                    attachementNo: req.file.filename // 一般應為ID，不建數據庫就直接用名字吧
                }
            }));
            res.end();
        });
        console.log(config.uploadUrl);
    },
    downloadApi = () => {
        app.get(config.downloadFileUrl, (req, res) => {
            let params = JSON.parse(req.query.params),
                filepath = '/upload/' + params.attachementNo,
                fReadStream;
            logger.info(req.query);
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
        app.get(config.downloadBase64Url, (req, res) => {
            let params = JSON.parse(req.query.params),
                buf = fs.readFileSync(__dirname + '/upload/' + params.attachementNo);
            logger.info(req.query);
            res.write(JSON.stringify({
                resultCode: "000000",
                resultMsg: '成功',
                data: {
                    base64: buf.toString('base64')
                }
            }));
            res.end();
        });
        console.log(config.downloadFileUrl);
        console.log(config.downloadBase64Url);
    };

console.log('======== 創建以下接口 ========');
createApi();
uploadApi();
downloadApi();
console.log('========== 創建完畢 ==========\n');

server = app.listen(config.port, () => {
    let port = server.address().port;
    console.log('致Root。服務器地址：127.0.0.1:' + port + '\n');
});