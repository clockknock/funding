import React, {Component} from 'react';
import {Card, Tag, Button, Alert, Spin, Row} from 'antd';
import {FundingAbi} from "../abi_backup";
import web3 from "../web3";
import formatSeconds from "../utils/timeUtil";
import RequestCard from "../components/request_card";
import WrappedRequestForm from "../components/request_form";


class FundingDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fundingAddr: props.match.params.fundingAddr,
            funding: {},//默认给一个remainSecond,避免NAN错误
            spinLoading: true,
            remainTime: "loading",
            isComplete: false,
            remainSecond: 3600
        };
    }

    async componentDidMount() {
        let fundingAddr = this.state.fundingAddr;
        let accounts = await web3.eth.getAccounts();
        let account = accounts[0];
        let fundingContract = new web3.eth.Contract(FundingAbi, fundingAddr);
        let projectName = await fundingContract.methods.getProjectName().call();
        let playersCount = await fundingContract.methods.getPlayersCount().call();
        let totalBalance = await fundingContract.methods.getTotalBalance().call();
        let remainSecond = await fundingContract.methods.getRemainSecond().call();
        let supportMoney = await fundingContract.methods.getSupportMoney().call();
        let goalMoney = await fundingContract.methods.getGoalMoney().call();
        let manager = await fundingContract.methods.getManager().call();
        let isComplete = await fundingContract.methods.getIsComplete().call();
        let isFundingSuccess = await fundingContract.methods.getIsFundingSuccess().call();
        let isSupporter = await fundingContract.methods.isSupporter(account).call();


        let isManager = manager === account;
        let funding = {
            fundingContract,
            fundingAddr,
            projectName,
            playersCount,
            totalBalance,
            supportMoney,
            goalMoney,
            manager,
            account,
            isComplete,
            isManager,
            isSupporter,
            isFundingSuccess
        };

        this.setState({funding, spinLoading: false, remainSecond});

        //众筹完成的倒计时
        let timer = setInterval(() => {
            let remainSecond = this.state.remainSecond - 1;
            console.log(remainSecond);
            if (remainSecond < 0 || remainSecond > 5184000) {
                remainSecond = 0;
                clearInterval(timer);
                this.setState({
                    remainTime: "众筹时间结束",
                    isComplete: true
                });
                return;
            }
            this.setState({
                remainTime: formatSeconds(remainSecond),
                remainSecond
            });
        }, 1000);
    }

    support = async () => {
        this.setState({loading: true});
        let {fundingContract, account, supportMoney} = this.state.funding;
        let receipt = "";
        try {
            receipt = await fundingContract.methods.support().send({
                from: account,
                value: supportMoney
            });
        } catch (e) {
            this.setState({errorMsg: e.toString(), loading: false});
            return
        }
        this.setState({
            loading: false,
            // showModal: true,
            msg: JSON.stringify(receipt)
        });
        // this.refs.receiptModal.showModal();
        alert("转账成功!信息为:" + JSON.stringify(receipt));
    };

    refundByManager = async () => {
        this.setState({loading: true});
        try {
            await this.state.funding.fundingContract.methods.refundByManager().send({
                from: this.state.funding.account,
            });
        } catch (e) {
            this.setState({errorMsg: e.toString(), loading: false});
            return
        }
        this.setState({
            loading: false,
            // showModal: true,
            msg: "退款成功"
        });
        // this.refs.receiptModal.showModal();
        alert("退款成功");
    };

    showSupport = (isComplete, isSupporter) => {
        if (isComplete) {
            return <Tag color="red">该项目众筹已结束!</Tag>
        }
        if (isSupporter) {
            return <Tag color="green">您是支持者!谢谢支持!</Tag>;
        } else {
            return <p><Button onClick={this.support} loading={this.state.loading}>点击支持</Button></p>;
        }
    };

    refundByAnyone = async () => {
        let receipt = await this.state.funding.fundingContract.methods.refundByAnyone().send({
            from: this.state.funding.account
        });
        alert(JSON.stringify(receipt));
    };


    render() {
        let {fundingAddr} = this.state;
        let {isComplete, isSupporter, isFundingSuccess} = this.state.funding;
        let {manager, isManager, projectName, playersCount, totalBalance, supportMoney, goalMoney} = this.state.funding;

        // let rm = <ReceiptModal title={"本次交易信息"} receipt={this.state.receipt} ref="receiptModal"/>;
        let error = <Alert message="交易错误" description={this.state.errorMsg} type="error" closable/>;
        let managerContent =
            <div style={{border: "1px solid", textAlign: "center", paddingTop: "10px"}}>
                <Tag color="#2db7f5">您是众筹发起者</Tag>
                <p>
                    <Button style={{marginTop: "4px"}} onClick={this.refundByManager}
                            loading={this.state.loading}>主动退款</Button>
                </p>
                <p>
                    {isComplete ? <Button onClick={this.createRequest}>发起用款请求</Button> : <span></span>}
                </p>
            </div>
        ;
        let showSupport = this.showSupport(isComplete, isSupporter);

        return (
            <Spin spinning={this.state.spinLoading} size={"large"}>
                <div>
                    <div style={{float: "left", width: "30%"}}>
                        {/*显示信息确认框*/}
                        {/*{this.state.showModal && rm}*/}
                        {this.state.errorMsg && error}
                        <Card title={projectName} style={{width: 330, marginTop: 20}}>
                            <p>
                                该合约地址:
                            </p>
                            <Tag color="#2db7f5">{fundingAddr}</Tag>
                            <br/>
                            <p>
                                合约创建人地址:
                            </p>
                            <Tag color="#2db7f5">{manager}</Tag>
                            <br/>
                            <p>参与人数:{playersCount}</p>
                            <p>当前获得支持:{totalBalance}Wei</p>
                            <p>剩余时间:{this.state.remainTime}</p>
                            <p>支持项目需要花费:{supportMoney}Wei</p>
                            <p>众筹所需金额:{goalMoney}Wei</p>
                            {/*众筹结束了,并且没有成功才能随便来人发起退款*/}
                            {isComplete && !isFundingSuccess &&
                            <p><Button onClick={this.refundByAnyone}>发起退款请求</Button></p>}
                            {showSupport}
                            {isManager && managerContent}
                        </Card>

                        <Card title={"发起请求"} style={{width: 330, marginTop: 20}}>
                            <WrappedRequestForm/>
                        </Card>
                    </div>
                    <div style={{float: "left", width: "65%", marginLeft: "3%", textAlign: "center"}}>
                        <h1>筹款人用款请求列表</h1>
                        <Row gutter={16}>
                            <RequestCard/>
                        </Row>
                    </div>
                </div>
            </Spin>
        );
    }
}


export default FundingDetail;
