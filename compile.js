let solc=require("solc");
let path = require("path");
let fs = require("fs");

let src = path.resolve(__dirname,"contracts","Funding.sol");
let lotterySrc=fs.readFileSync(src,"utf-8");
let result=solc.compile(lotterySrc,1);
let Funding= result.contracts[":Funding"];
let FundingFactory= result.contracts[":FundingFactory"];

module.exports={
    Funding,FundingFactory
};