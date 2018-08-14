import React from 'react';
import {Form, Input, Button, Row} from 'antd';

const TextArea = Input.TextArea;
const FormItem = Form.Item;

class Request_form extends React.Component {

    componentDidMount() {

    }

    createRequest = async (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let {requestDesc, money, shopAddress} = values;
                console.log(requestDesc);
                console.log(money);
                console.log(shopAddress);
            }
        });
    };

    render() {
        const {getFieldDecorator} = this.props.form;
        return (
            <Form onSubmit={this.createRequest}>
                <Row>
                    <FormItem>
                        用款请求描述:
                        {getFieldDecorator('requestDesc', {
                            rules: [{required: true, message: '请输入用款请求描述!'}],
                        })(
                            <TextArea placeholder="用款请求描述"/>
                        )}

                    </FormItem>
                </Row>
                <Row>
                    <FormItem>
                        所需金额:
                        {getFieldDecorator('money', {
                            rules: [{required: true, message: '请输入所需金额!'}],
                        })(
                            <Input placeholder="所需金额" type="number" style={{width: "80%"}}/>
                        )}Wei
                    </FormItem>
                </Row>
                <Row>
                    <FormItem>
                        收款人地址:
                        所需金额:
                        {getFieldDecorator('shopAddress', {
                            rules: [{required: true, message: '请输入收款人地址!'}],
                        })(
                            <TextArea/>
                        )}

                    </FormItem>
                </Row>
                <Row>
                    <br/>
                    <Button type="primary" htmlType="submit">发起花款请求</Button>
                </Row>
            </Form>
        );
    }
}

const WrappedRequestForm = Form.create()(Request_form);

export default WrappedRequestForm