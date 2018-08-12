import React, {Component} from 'react';

import web3 from '../web3';
import {Input, Row, Col, Button, message} from 'antd';
import fundingFactory from "../FundingFactory";


class CreateFunding extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // projectName: '',
            // supportMoney: 0,
            // goalMoney: 0
            loading: false,
            accounts: []
        };
    }

    async componentDidMount() {
        let accounts = await web3.eth.getAccounts();
        this.setState({accounts: accounts});
    }

    createFunding = async () => {
        this.setState({loading: true});
        let projectName = this.projectNameNode.input.value;
        let supportMoney = this.supportMoneyNode.input.value;
        let goalMoney = this.goalMoneyNode.input.value;

        try {
            await  fundingFactory.methods.deploy(projectName, supportMoney, goalMoney).send({
                from: this.state.accounts[0]
            })
        } catch (e) {
            message.error("众筹项目创建失败,请确认网络或gas重试");
            console.log(e);
            this.setState({loading: false});
            throw e;
        }

        message.success("创建众筹项目成功");
        this.setState({loading: false});
    };

    render() {

        return (
            <div className="example-input">
                <Row>
                    <Col span={6} offset={6}>
                        项目名:
                        <Input size="large" placeholder="项目名"
                               ref={input => this.projectNameNode = input}/>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col span={6} offset={6}>
                        每人捐赠:
                        <Input type="number" size="large" placeholder="每人捐赠"
                               ref={input => this.supportMoneyNode = input}/>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col span={6} offset={6}>
                        目标资金:
                        <Input type="number" size="large" placeholder="目标资金"
                               ref={input => this.goalMoneyNode = input}/>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col span={6} offset={6}>
                        <Button onClick={this.createFunding} loading={this.state.loading}>创建众筹项目</Button>
                    </Col>
                </Row>
                <br/>
            </div>
        );
    }
}


export default CreateFunding;
