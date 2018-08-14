import React, {Component} from 'react';
import {Card, Col, Button, Input} from 'antd';
const {TextArea} = Input;

class RequestCard extends Component {
    constructor(props) {
        super(props);
        this.state = {};


    }

    async componentDidMount() {
    }

    support = async () => {

    };


    render() {

        return (
            <Col span={7}>
                <Card title={"第一条需求"}>
                    <p>投票数:5</p>
                    <p>所需金额:4000 Wei</p>
                    <p>是否付款:false</p>
                    <p>isVotedAt(address):一个地址</p>
                    <p>
                        收款人地址:
                    </p>
                    <TextArea disabled={true} value={"0x45b08216E4A28d73922b5fE7F78a2fEF5a1Badbe"}/>
                    <Button>点击投票(根据isSupporter来判断是否显示)</Button>
                </Card>
            </Col>
        );
    }
}

export default RequestCard;
