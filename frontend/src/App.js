import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import Dashboard from './components/Dashboard';
import TopicDetail from './components/TopicDetail';

const { Header, Content } = Layout;

const menuItems = [
    {
        key: '1',
        label: <Link to="/">新闻分析面板</Link>
    }
];

const App = () => {
    return (
        <Router>
            <Layout className="layout" style={{ minHeight: '100vh' }}>
                <Header>
                    <div className="logo" />
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        defaultSelectedKeys={['1']}
                        items={menuItems}
                    />
                </Header>
                <Content style={{ padding: '0 50px', marginTop: 64 }}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/topic/:topic" element={<TopicDetail />} />
                    </Routes>
                </Content>
            </Layout>
        </Router>
    );
};

export default App; 