import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Layout, Menu, Space, Typography } from 'antd';
import { ClockCircleOutlined, SyncOutlined, LineChartOutlined, BarChartOutlined } from '@ant-design/icons';
import Dashboard from './components/Dashboard';
import TopicDetail from './components/TopicDetail';
import axios from 'axios';

const { Header, Content } = Layout;
const { Text } = Typography;

const menuItems = [
    {
        key: 'dashboard',
        label: <Link to="/">
            <LineChartOutlined /> 新闻分析面板
        </Link>
    },
    {
        key: 'visualization',
        label: <span onClick={() => window.dispatchEvent(new Event('toggleVisualization'))}>
            <BarChartOutlined /> 可视化分析
        </span>
    }
];

const App = () => {
    const [currentTime, setCurrentTime] = useState('');
    const [lastUpdate, setLastUpdate] = useState('');
    const [selectedKey, setSelectedKey] = useState('dashboard');

    const fetchSystemInfo = async () => {
        try {
            const response = await axios.get('/api/system_info');
            setCurrentTime(response.data.current_time);
            setLastUpdate(response.data.last_update || '暂无更新');
        } catch (error) {
            console.error('Error fetching system info:', error);
        }
    };

    // 使用本地时间更新当前时间
    const updateLocalTime = () => {
        const now = new Date();
        setCurrentTime(now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }));
    };

    useEffect(() => {
        // 初始获取系统信息
        fetchSystemInfo();
        
        // 每10分钟获取一次系统信息（主要是为了更新最后更新时间）
        const systemInfoTimer = setInterval(fetchSystemInfo, 10 * 60 * 1000);
        
        // 每秒更新本地时间
        const localTimeTimer = setInterval(updateLocalTime, 1000);
        
        // 初始更新本地时间
        updateLocalTime();
        
        return () => {
            clearInterval(systemInfoTimer);
            clearInterval(localTimeTimer);
        };
    }, []);

    const handleMenuClick = (key) => {
        setSelectedKey(key);
        if (key === 'dashboard') {
            window.dispatchEvent(new Event('hideVisualization'));
        }
    };

    return (
        <Router>
            <Layout className="layout">
                <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <LineChartOutlined style={{ fontSize: '28px', color: '#4ecdc4', marginRight: '12px' }} />
                            <h1 className="site-title">猎云网文章分析平台</h1>
                        </div>
                        <Menu
                            theme="dark"
                            mode="horizontal"
                            selectedKeys={[selectedKey]}
                            items={menuItems}
                            onClick={({ key }) => handleMenuClick(key)}
                            style={{ marginLeft: '40px', background: 'transparent' }}
                        />
                    </div>
                    <Space size={24}>
                        <Text style={{ color: 'white' }}>
                            <ClockCircleOutlined style={{ marginRight: 8 }} />
                            {currentTime}
                        </Text>
                        <Text style={{ color: 'white' }}>
                            <SyncOutlined style={{ marginRight: 8 }} />
                            上次更新：{lastUpdate}
                        </Text>
                    </Space>
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