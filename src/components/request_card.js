import React, {Component} from 'react';
import {Card, Col, Button, Input} from 'antd';

const {TextArea} = Input;

class RequestCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSupporter: this.props.isSupporter
        };
    }

    async componentDidMount() {
        console.log(this.props.request);
    }

    support = async () => {

    };


    render() {
        let {isSupporter} = this.state;
        let {description, money, shopAddress, complete, voteCount, isVoted} = this.props.request;
        let isComplete = complete && <p>该花费请求已完成</p>;
        let canVote = !isComplete && isSupporter && <p><Button>点击投票</Button></p>;

        return (
            <Col span={7}>
                <Card title={description}>
                    <p>投票数:{voteCount}</p>
                    <p>所需金额:{money} Wei</p>
                    <p>是否付款:{isVoted}</p>
                    <p>
                        收款人地址:
                    </p>
                    <TextArea disabled={true} value={shopAddress}/>

                    {canVote}
                </Card>
            </Col>
        );
    }
}

export default RequestCard;
