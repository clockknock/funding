let {Funding, FundingFactory} = require("./compile");
let Web3 = require("web3");
let config = require("./config");

let HdWalletProvider = require("truffle-hdwallet-provider");
let mnemonic = config.mnemonic;
let provider = new HdWalletProvider(mnemonic, config.provider_url, 0, 10);

let web3 = new Web3(provider);

/**
 * 发布合约,记录合约地址和abi
 * @returns {Promise<void>}
 */
deploy = async (inter, byteKode,args) => {
    let accounts = await web3.eth.getAccounts();

    let contract = await new web3.eth.Contract(JSON.parse(inter))
        .deploy({
                data: byteKode,
                arguments: args
            }
        ).send({
            from: accounts[0],
            gas: "3000000"
        });
    console.log("address:" + contract.options.address);
    console.log("=====================================");
    console.log(FundingFactory.interface);
    console.log("=====================================");
    console.log(Funding.interface);
};

// deploy(Funding.interface, Funding.bytecode);
deploy(FundingFactory.interface, FundingFactory.bytecode,{});
// deploy(Funding.interface, Funding.bytecode,
//     {
//     "_projectName":"小电灯",
//     "_supportMoney":"50000000000000000",
//     "_goalMoney":"5000000000000000000"
// });
