/**
 * Created by Henrie on 16/1/2018.
 */
const config = {
    port: 8084,
    accessControlAllowHeaders: 'Authorization, userToken', // 自定義請求頭
    uploadName: 'myfile', // 上傳文件name屬性
    uploadUrl: '/attachement/upload', // 上傳url
    downloadFileUrl: '/attachement/downloadFile', // 下載地址（流）
    downloadBase64Url: '/attachement/downloadBase64', // 下載地址（base64）
    transHost: 'https://www.google.de', // 轉發host
    transPath: '', // 轉發path
    useProxy: false, // 轉發是否使用代理（若為true，proxyUrl和pac必填一項）
    proxyUrl: '', // 代理地址
    pac: '' // pac處理代理
};

module.exports = config;
