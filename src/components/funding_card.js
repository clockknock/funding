import React, {Component} from 'react';
import {Card, Col, Tag, Button, Alert} from 'antd';
import formatSeconds from '../utils/timeUtil';
import ReceiptModal from "./receipt_modal";

class FundingCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            remainSecond: props.funding.remainSecond,
            remainTime: "loading",
            fundingContract: this.props.funding.fundingContract,
            supportMoney: this.props.funding.supportMoney,
            manager: this.props.funding.manager,
            account: this.props.funding.account,
            loading: false,
            msg: "",
            showModal: false,
            errorMsg: "",
            isSupporter: false
        };

       let timer= setInterval(() => {
            let remainSecond = this.state.remainSecond - 1;
            if (remainSecond<0){
                remainSecond=0;
                clearInterval(timer);
            }
            this.setState({
                remainTime: formatSeconds(this.state.remainSecond),
                remainSecond
            });
        }, 1000);
    }

    async componentDidMount() {
        let isSupporter = await this.state.fundingContract.methods.isSupporter(this.state.account).call();
        this.setState({isSupporter: isSupporter});
    }

    support = async () => {
        this.setState({loading: true});
        let value = this.state.supportMoney;
        let receipt = "";
        try {
            receipt = await this.state.fundingContract.methods.support().send({
                from: this.state.account,
                value: value
            });
        } catch (e) {
            this.setState({errorMsg: e.toString(), loading: false});
            return
        }
        this.setState({
            loading: false,
            showModal: true,
            msg: JSON.stringify(receipt)
        });
        this.refs.receiptModal.showModal();
    };

    refund = async () => {
        this.setState({loading: true});
        try {
            let response = await this.state.fundingContract.methods.refundByManager().send({
                from: this.state.account,
            });
            console.log(response);
        } catch (e) {
            this.setState({errorMsg: e.toString(), loading: false});
            return
        }
        this.setState({
            loading: false,
            showModal: true,
            msg: "退款成功"
        });

    };

    render() {
        let {manager, account, isSupporter} = this.state;
        let {fundingAddr, projectName, playersCount, totalBalance, supportMoney, goalMoney} = this.props.funding;
        let rm = <ReceiptModal title={"本次交易信息"} receipt={this.state.receipt} ref="receiptModal"/>;
        let error = <Alert message="交易错误" description={this.state.errorMsg} type="error" closable/>;
        let createRequest = <p><Button>发起用款请求</Button></p>;
        let showSupport = isSupporter ? <Tag color="green">您是支持者!谢谢支持!</Tag> :
            <p><Button onClick={this.support} loading={this.state.loading}>点击支持</Button></p>;

        return (
            <Col span={6}>
                {/*显示小票的确认框*/}
                {this.state.showReceiptModal && rm}
                {this.state.errorMsg && error}
                <Card title={projectName} style={{width: 325, marginTop: 20, height: 440}}>
                    <p>
                        该项目:
                    </p>
                    <Tag color="#2db7f5">{fundingAddr}</Tag>
                    <br/>
                    <p>参与人数:{playersCount}</p>
                    <p>当前获得支持:{totalBalance}Wei</p>
                    <p>剩余时间:{this.state.remainTime}</p>
                    <p>支持项目需要花费:{supportMoney}Wei</p>
                    <p>众筹所需金额:{goalMoney}Wei</p>
                    {showSupport}
                    {manager === account && createRequest}
                    <p><Button onClick={this.refund} loading={this.state.loading}>退款</Button></p>
                </Card>
            </Col>
        );
    }
}

export default FundingCard;
