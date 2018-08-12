import React, {Component} from 'react';
import {Row, Spin, Pagination} from 'antd';
import FundingCard from "../components/funding_card";
import fundingFactory from '../FundingFactory';
import web3 from "../web3";
import {FundingAbi} from "../abi_backup";

class FundingsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fundings: [],
            spinLoading: false,
            currentPage: 1,
            pageSize: 3,
            fundingsAddr: [],
            showPagination: false
        }
    }

    async componentDidMount() {
        let accounts = await web3.eth.getAccounts();
        let fundingsAddr = await fundingFactory.methods.getFundings().call();

        this.setState({fundingsAddr, account: accounts[0]});
        await this.onChangePage(1);
        this.setState({showPagination: true});
    }

    /** 一次异步请求获取太多以太坊上的数据会加载很久,做分页 or 服务器缓存
     * 0-2 startPosition= 0 (pageSize*(1-1)) length = 0+2
     * 3-5 startPosition= 3 (pageSize*(2-1)) length = 3+2
     * 6-8 startPosition= 6 (pageSize*(3-1)) length = 6+2
     */
    onChangePage = async (currentPage) => {
        this.setState({spinLoading: true});
        currentPage = currentPage - 1;
        let {account, fundingsAddr} = this.state;

        let fundingsSize = fundingsAddr.length;
        let startPosition = this.state.pageSize * (currentPage);
        let range = this.state.pageSize * (currentPage) + (this.state.pageSize - 1);
        if (fundingsSize <= range) {
            range = fundingsSize - 1;
        }
        console.log("range:"+range+",startPosition:"+startPosition);

        let fundings = [];
        // for (range; startPosition >=range; startPosition--) {
        for (startPosition; startPosition <= range; startPosition++) {
            let fundingAddr = fundingsAddr[startPosition];

            let fundingContract = new web3.eth.Contract(FundingAbi, fundingAddr);
            let projectName = await fundingContract.methods.getProjectName().call();
            let playersCount = await fundingContract.methods.getPlayersCount().call();
            let totalBalance = await fundingContract.methods.getTotalBalance().call();
            let remainSecond = await fundingContract.methods.getRemainSecond().call();
            let supportMoney = await fundingContract.methods.getSupportMoney().call();
            let goalMoney = await fundingContract.methods.getGoalMoney().call();
            let manager = await fundingContract.methods.getManager().call();
            let isComplete = await fundingContract.methods.getIsComplete().call();

            let funding = {
                fundingContract,
                fundingAddr,
                projectName,
                playersCount,
                totalBalance,
                remainSecond,
                supportMoney,
                goalMoney,
                isComplete,
                manager,
                account
            };
            fundings.push(funding);
        }

        this.setState({fundingsAddr, fundings: fundings, spinLoading: false, currentPage});
    };


    render() {
        let fundingCards = this.state.fundings.map((funding) => {
            return <FundingCard funding={funding} key={funding.fundingAddr}/>
        });
        let pagination = this.state.showPagination &&
            <Pagination defaultCurrent={this.state.currentPage} total={this.state.fundingsAddr.length}
                        defaultPageSize={this.state.pageSize} onChange={this.onChangePage}/>;
        return (
            <div>
                <Spin spinning={this.state.spinLoading} size={"large"}>
                    <div>
                        <Row gutter={16}>
                            {fundingCards}
                        </Row>
                    </div>
                </Spin>
                {pagination}
            </div>
        );
    }
}


export default FundingsPage;
