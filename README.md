# root-mockserver ver 0.0.8

> 致Root。

real簡陋的基於node + express的mockserver，支持跨域，支持轉發，支持代理，無論項目做到哪了，都可以低本轉換，馬上使用

大部分人開發的時候都是習慣將假數據寫在項目文件內，so就根據這個習慣，不做界面，直接以json文件來管理假數據，放到目錄裡自動生成接口

媽媽再也不用擔心我不是被接口卡死，就是被代碼裡大片屏蔽的假數據逼死

還能解決本地連真實環境造成的跨域問題

僅做最簡單的拿數據，request做解密、response做加密、分頁⋯⋯自行根據項目需求擴展。有數據，真的可以為所欲為www

## 最近更新

ver 0.0.8

1. 優化了一下代碼，POST和GET方法合併成一個；
2. 文件流也可以轉發了；

## 安裝

```
npm install
```

## 運行

```
npm start
```

默認地址

```
127.0.0.1:8084
```

## 配置

```js
config = {
    port: 8084,
    accessControlAllowHeaders: 'Authorization, userToken', // 自定義請求頭
    uploadName: 'myfile', // 上傳文件name屬性
    uploadUrl: '/attachement/upload', // 上傳url
    downloadFileUrl: '/attachement/downloadFile', // 下載地址（流）
    downloadBase64Url: '/attachement/downloadBase64' // 下載地址（base64）
    transHost: 'https://www.google.de', // 轉發host
    transPath: '', // 轉發path
    transHeaders: { // 轉發請求頭
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }, // headers
    useProxy: false, // 轉發是否使用代理（若為true，proxyUrl和pac必填一項）
    proxyUrl: '', // 代理地址
    pac: '' // pac處理代理
};
```

## 目錄結構

```
├── json                       # 接口返回數據
│   └── get
│       └── ...                # 父節點
│           └── ...			   # json文件
│       └── ...		  	       # json文件
│   └── post
├── upload                     # 上傳下載文件目錄
└── server.js                  # 文件
```

## 使用方法

### 普通接口

接口根據 `json` 目錄下的文件自動生成，以method為分類，文件名即為接口名字（如127.0.0.1:8084/userInfo），內容為返回data

若地址需要父節點~~，有兩種方法~~（以get請求user/userInfo為例）：

1. ~~在get目錄下創建 `user@userInfo.json` 文件，@將被自動轉換成/；~~
2. 在get目錄下創建user文件夾，並將 `user.json` 文件置於其下；

```
├── json                        # 接口返回數據
│   └── get
│       └── user
│           └── userInfo.json   # ::/user/userInfo
```

### 上傳接口

接口名：默認 `/attachement/upload`

入參：默認 `myfile` （文件 `name` 屬性）

默認出參

```js
{
    resultCode: '000000',
    resultMsg: '成功',
    data: {
        base64: buf.toString('base64'),
        attachementNo: req.file.filename // 一般應為ID，不建數據庫就直接用名字吧
    }
}
```

### 下載接口

#### steam

接口名：默認 `/attachement/downloadFile`

入參： `params.attachementNo` （其實就是文件名，帶後綴）

#### base64

接口名：默認 `/attachement/downloadBase64`

入參： `params.attachementNo` （其實就是文件名，帶後綴）

```js
{
    resultCode: '000000',
    resultMsg: '成功',
    data: {
        base64: buf.toString('base64')
    }
}
```

## 跨域和自定義請求頭

默認支持跨域

修改自定義請求頭在 `config.js` 中

## 轉發

```js
// config.js
config = {
    transHost: 'https://www.google.de', // 轉發host
    transPath: '/whateverOrJustEmpty', // 轉發path
}
```

如果mockserver中沒有請求的接口，就轉發到項目地址中，去取項目中已有的接口數據

### 代理

更坑爹的問題是網絡環境限制，平時訪問接口地址就需要通過代理怎麼辦（。

沒關係，我們一起做紅杏程序員

```js
// config.js
config = {
    useProxy: true, // 轉發是否使用代理（若為true，proxyUrl和pac必填一項）
    proxyUrl: '', // 代理地址（從瀏覽器設置裡找，如：http://127.0.0.1:8888）
    pac: '' // pac處理代理（從瀏覽器設置裡找）
}
```

## TODO

- [x] 接口增加二級分類；
- [x] 可配置化；
- [x] 錯誤處理；
- [x] post請求文件轉發；

## 聯繫與討論

QQ：3088680950

如果發現八阿哥了或者有功能上的建議，推薦通過 `issue` 發起討論。

## License

[MIT license](https://opensource.org/licenses/MIT). 有好的想法歡迎提供。