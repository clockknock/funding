import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import {Layout, Menu, Icon} from 'antd';
import FundingsPage from "./pages/fundings_page";
import CreateFunding from "./pages/create_funding";

const {Header, Sider, Content} = Layout;


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fundings: []
        }
    }

    render() {
        return (
            <Router>
                <Layout style={{height: window.innerHeight}}>
                    <Sider
                        breakpoint="lg"
                        collapsedWidth="0"
                        onBreakpoint={(broken) => {
                            console.log(broken);
                        }}
                        onCollapse={(collapsed, type) => {
                            console.log(collapsed, type);
                        }}
                        style={{paddingTop:"5%"}}
                    >
                        <div className="logo"/>
                        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                            <Menu.Item key="1">
                                <Link to="/">
                                    <Icon type="user"/>
                                    <span className="nav-text">众筹首页</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="2">
                                <Link to="/create_funding">
                                    <Icon type="video-camera"/>
                                    <span className="nav-text">开始众筹</span>
                                </Link>
                            </Menu.Item>

                        </Menu>
                    </Sider>
                    <Layout>
                        <Header style={{background: '#fff', padding: 0}}>
                            <div style={{textAlign:"center",fontSize:34}}>
                                众筹众筹
                            </div>
                        </Header>
                        <Content style={{margin: '24px 16px 0'}}>
                            <Route path="/"  exact={true} component={FundingsPage}/>
                            <Route path="/create_funding" component={CreateFunding}/>
                        </Content>

                    </Layout>
                </Layout>
            </Router>
        );
    }
}

export default App;
