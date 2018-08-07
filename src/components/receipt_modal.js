import React, {Component} from 'react';
import {Modal} from 'antd';

class ReceiptModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true,
            title:props.title,
            receipt:props.receipt
        };
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleOk = (e) => {
        this.setState({
            visible: false,
        });
        window.location.reload();
    };

    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };

    render() {
        return (
            <div>
                <Modal
                    title={this.state.title}
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <p>{this.state.receipt}</p>

                </Modal>
            </div>
        );
    }
}

export default ReceiptModal;
