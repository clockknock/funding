import web3 from "./web3";
import {FactoryAddress, FundingFactoryAbi} from "./abi_backup";

let fundingFactory=new web3.eth.Contract(FundingFactoryAbi,FactoryAddress);

export default fundingFactory;
