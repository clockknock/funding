

Solidity+Web3js+Reactjs+Antd实现的一个简单众筹项目



### Quick Start



1.在项目根目录创建`config.js` 并输入以下内容

```js
let config = {
    mnemonic: "你的助记词",
    provider_url: "你infura里的app key"
};

module.exports = config;
```



2.打开cmd在项目根目录执行`node deploy.js` , 在项目根目录创建一个名为`abi_backup.js`的文件,将编译出来的三个内容复制粘贴到下面文本中再放到`abi_backup.js`中

```js
let FactoryAddress = "你的合约工厂地址";
let FundingFactoryAbi = "你的合约工厂ABI";
let FundingAbi ="你的合约ABI";

module.exports = {FactoryAddress, FundingFactoryAbi, FundingAbi};

```





