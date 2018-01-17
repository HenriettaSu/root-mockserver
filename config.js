/**
 * Created by Henrie on 16/1/2018.
 */
const config = {
    port: 8084,
    accessControlAllowHeaders: 'Authorization, userToken', // 自定義請求頭
    successCode: '000000',
    uploadName: 'myfile',
    uploadUrl: '/attachement/upload',
    downloadFileUrl: '/attachement/downloadFile',
    downloadBase64Url: '/attachement/downloadBase64'
};

module.exports = config;
