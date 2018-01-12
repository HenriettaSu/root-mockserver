# root-mockserver ver 0.0.1

> 致Root。

real簡陋的基於node + express的mockserver

大部分人開發的時候都是習慣將假數據寫在項目文件內，so就根據這個習慣，不做界面，直接以json文件來管理假數據，放到目錄裡自動生成接口。可能會另外做數據庫版

媽媽再也不用擔心我不是被接口卡死，就是被代碼裡大片屏蔽的假數據逼死

僅做最簡單的拿數據，request做解密、response做加密、分頁⋯⋯自行根據項目需求擴展。有數據，真的可以為所欲為www

但是目前沒怎麼做錯誤處理，反正自己看終端機嘛，有空再弄

## 最近更新

ver 0.0.1

1. 支持GET, POST, OPTIONS；
2. 支持跨域；
3. 支持自定義請求頭；
4. 支持嗅探；
5. 支持上傳
6. 支持下載

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

## 目錄結構

```
├── json                       # 接口返回數據
│   └── get
│   └── post
├── upload                     # 上傳下載文件目錄
└── server.js                  # 文件
```

## 使用方法

### 普通接口

接口根據 `json` 目錄下的文件自動生成，以method為分類（目前不支持按功能分類），文件名即為接口名字，內容為返回data

通用返回格式：

```js
{
	resultCode: '000000',
    resultMsg: '成功',
    data: json
}
```

### 上傳接口

接口名： `/attachement/upload`

入參： `myfile` （文件 `name` 屬性）

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

接口名： `/attachement/downloadFile`

入參： `params.attachementNo` （其實就是文件名，帶後綴）

#### base64

接口名： `/attachement/downloadBase64`

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

修改自定義請求頭：

```js
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, userToken");
```

## TODO

1. 接口增加二級分類；
2. 可配置化；
3. 錯誤處理；

## 聯繫與討論

QQ：3088680950

如果發現八阿哥了或者有功能上的建議，推薦通過 `issue` 發起討論。

## License

[MIT license](https://opensource.org/licenses/MIT). 有好的想法歡迎提供。