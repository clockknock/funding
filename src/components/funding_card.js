import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {Card, Col, Tag, Button, Alert} from 'antd';
import formatSeconds from '../utils/timeUtil';
import ReceiptModal from "./receipt_modal";

class FundingCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            remainSecond: props.funding.remainSecond,
            fundingContract: this.props.funding.fundingContract,
            supportMoney: this.props.funding.supportMoney,
            manager: this.props.funding.manager,
            account: this.props.funding.account,
            fundingAddr: this.props.funding.fundingAddr,
            isComplete: this.props.funding.isComplete,
            loading: false,
            remainTime: "loading",
            msg: "",
            showModal: false,
            errorMsg: "",
            isSupporter: false,
            isManager: false
        };

        let timer = setInterval(() => {
            let remainSecond = this.state.remainSecond - 1;
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
                remainTime: formatSeconds(this.state.remainSecond),
                remainSecond
            });
        }, 1000);
    }

    async componentDidMount() {
        let isSupporter = await this.state.fundingContract.methods.isSupporter(this.state.account).call();

        this.setState({isSupporter: isSupporter, isManager: this.state.manager === this.state.account});
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

    render() {
        let {isComplete, isSupporter} = this.state;
        let {projectName, playersCount, totalBalance, supportMoney, goalMoney} = this.props.funding;

        let rm = <ReceiptModal title={"本次交易信息"} receipt={this.state.receipt} ref="receiptModal"/>;
        let error = <Alert message="交易错误" description={this.state.errorMsg} type="error" closable/>;

        let showSupport = this.showSupport(isComplete, isSupporter);
        return (
            <Col span={7}>
                {/*显示信息确认框*/}
                {this.state.showModal && rm}
                {this.state.errorMsg && error}
                <Card title={projectName} style={{width: 280, marginTop: 20, height: 356}}>
                    <p>参与人数:{playersCount}</p>
                    <p>当前获得支持:{totalBalance}Wei</p>
                    <p>剩余时间:{this.state.remainTime}</p>
                    <p>支持项目需要花费:{supportMoney}Wei</p>
                    <p>众筹所需金额:{goalMoney}Wei</p>
                    {showSupport}
                    <Link to={`/detail/${this.state.fundingAddr}`}>
                        <Button>查看详情</Button>
                    </Link>
                </Card>
            </Col>
        );
    }
}

export default FundingCard;
