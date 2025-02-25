import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { WordCloud } from '@ant-design/plots';
import { Card, Row, Col, List, Tag, Button, message, Statistic, Space } from 'antd';
import { SyncOutlined, FileTextOutlined, UserOutlined, TagOutlined, LineChartOutlined, CloudOutlined, PieChartOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/plots';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const [latestArticles, setLatestArticles] = useState([]);
    const [trendData, setTrendData] = useState({ dates: [], counts: [] });
    const [hotTopics, setHotTopics] = useState([]);
    const [keywords, setKeywords] = useState([]);
    const [dailySummary, setDailySummary] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [showVisualization, setShowVisualization] = useState(false);
    const [selectedKey, setSelectedKey] = useState('dashboard');

    const fetchData = async () => {
        try {
            // 获取最新文章
            const articlesRes = await axios.get('/api/latest_articles');
            setLatestArticles(articlesRes.data);

            // 获取趋势数据
            const trendRes = await axios.get('/api/trend_analysis');
            const sortedData = sortTrendData(trendRes.data);
            setTrendData(sortedData);

            // 获取热门话题
            const topicsRes = await axios.get('/api/hot_topics');
            setHotTopics(topicsRes.data.topics);

            // 获取关键词分析
            const keywordsRes = await axios.get('/api/keyword_analysis');
            setKeywords(keywordsRes.data.keywords);

            // 获取今日总结
            const summaryRes = await axios.get('/api/daily_summary');
            setDailySummary(summaryRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            message.error('数据加载失败');
        }
    };

    useEffect(() => {
        fetchData();
        // 设置10分钟定时刷新
        const timer = setInterval(fetchData, 10 * 60 * 1000);
        
        // 组件卸载时清除定时器
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleToggleVisualization = () => {
            setShowVisualization(prev => !prev);
            setSelectedKey('visualization');
        };

        const handleHideVisualization = () => {
            setShowVisualization(false);
            setSelectedKey('dashboard');
        };

        window.addEventListener('toggleVisualization', handleToggleVisualization);
        window.addEventListener('hideVisualization', handleHideVisualization);
        return () => {
            window.removeEventListener('toggleVisualization', handleToggleVisualization);
            window.removeEventListener('hideVisualization', handleHideVisualization);
        };
    }, []);

    const handleUpdate = async () => {
        try {
            setUpdating(true);
            const response = await axios.post('/api/update_articles');
            if (response.data.status === 'success') {
                message.success('文章更新成功');
                fetchData(); // 重新加载数据
            } else {
                message.error(response.data.message || '更新失败');
            }
        } catch (error) {
            console.error('Update error:', error);
            message.error('更新失败：' + (error.response?.data?.message || error.message));
        } finally {
            setUpdating(false);
        }
    };

    // 对趋势数据进行排序
    const sortTrendData = (data) => {
        const pairs = data.dates.map((date, index) => ({
            date,
            count: data.counts[index]
        }));

        // 将所有"小时前"的时间转换为具体日期
        const today = new Date();
        const convertedPairs = pairs.map(pair => {
            if (pair.date.includes('小时前')) {
                const hours = parseInt(pair.date.match(/(\d+)小时前/)[1]);
                const date = new Date(today.getTime() - hours * 60 * 60 * 1000);
                return {
                    date: date.toISOString().split('T')[0], // YYYY-MM-DD格式
                    count: pair.count
                };
            }
            return pair;
        });

        // 按日期排序（从旧到新）
        convertedPairs.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;  // 升序排列，旧的日期在前
        });

        // 合并相同日期的数据
        const mergedData = convertedPairs.reduce((acc, curr) => {
            const existingDate = acc.find(item => item.date === curr.date);
            if (existingDate) {
                existingDate.count += curr.count;
            } else {
                acc.push({ ...curr });
            }
            return acc;
        }, []);

        return {
            dates: mergedData.map(p => p.date),
            counts: mergedData.map(p => p.count)
        };
    };

    const trendChartData = {
        labels: trendData.dates,
        datasets: [
            {
                label: '文章数量',
                data: trendData.counts,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
        ],
    };

    const trendChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    const wordCloudConfig = {
        data: hotTopics,
        wordField: 'label',
        weightField: 'count',
        height: 400,
        colorField: 'label',
        wordStyle: {
            fontFamily: 'Verdana',
            fontSize: [16, 48],
            rotation: 0
        },
        animation: false,
        color: ['#1677ff', '#4ecdc4', '#ff6b6b', '#ffd93d', '#6c5ce7'],
        interactions: [
            {
                type: 'element-active',
            },
        ],
        state: {
            active: {
                style: {
                    shadowColor: '#000',
                    shadowBlur: 10,
                },
            },
        }
    };

    const pieConfig = {
        data: hotTopics,
        angleField: 'count',
        colorField: 'label',
        radius: 0.8,
        innerRadius: 0.6,
        animation: false, // 禁用动画
        label: {
            type: 'inner',
            offset: '-50%',
            content: ({ percent }) => `${(percent * 100).toFixed(1)}%`,
            style: {
                textAlign: 'center',
                fontSize: 14,
                fill: '#fff'
            },
        },
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
        statistic: {
            title: false,
            content: {
                style: {
                    whiteSpace: 'pre-wrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '16px',
                    fontWeight: 500,
                },
                content: '热门标签',
            },
        },
        tooltip: {
            formatter: (datum) => {
                const total = hotTopics.reduce((sum, topic) => sum + topic.count, 0);
                const percent = ((datum.count / total) * 100).toFixed(1);
                return {
                    name: datum.label,
                    value: `${percent}% (${datum.count}篇)`
                };
            }
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            {!showVisualization ? (
                <>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card className="summary-card">
                                <Row gutter={[24, 24]} align="middle">
                                    <Col flex="auto">
                                        <div className="summary-header">
                                            <FileTextOutlined className="summary-icon" />
                                            <span>今日文章总结</span>
                                        </div>
                                        {dailySummary && (
                                            <>
                                                <div className="summary-content">
                                                    {dailySummary.summary}
                                                </div>
                                                <Row gutter={32} className="summary-stats">
                                                    <Col>
                                                        <Statistic 
                                                            className="summary-statistic"
                                                            title={<div className="stat-title"><FileTextOutlined /> 今日文章数</div>}
                                                            value={dailySummary.total_count} 
                                                        />
                                                    </Col>
                                                    {dailySummary.top_authors[0] && (
                                                        <Col>
                                                            <Statistic 
                                                                className="summary-statistic"
                                                                title={<div className="stat-title"><UserOutlined /> 最活跃作者</div>}
                                                                value={dailySummary.top_authors[0][0]}
                                                            />
                                                        </Col>
                                                    )}
                                                    {dailySummary.top_labels[0] && (
                                                        <Col>
                                                            <Statistic 
                                                                className="summary-statistic"
                                                                title={<div className="stat-title"><TagOutlined /> 最热门话题</div>}
                                                                value={dailySummary.top_labels[0][0]}
                                                            />
                                                        </Col>
                                                    )}
                                                </Row>
                                            </>
                                        )}
                                    </Col>
                                    <Col>
                                        <Button
                                            type="primary"
                                            icon={<SyncOutlined spin={updating} />}
                                            loading={updating}
                                            onClick={handleUpdate}
                                            className="update-button"
                                        >
                                            更新文章
                                        </Button>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                        <Col span={16}>
                            <Card 
                                title={
                                    <div className="card-title-with-icon">
                                        <FileTextOutlined className="card-title-icon" />
                                        最新文章
                                    </div>
                                } 
                                className="card-with-shadow"
                            >
                                <List
                                    itemLayout="vertical"
                                    dataSource={latestArticles}
                                    renderItem={article => (
                                        <List.Item
                                            extra={article.pub_time}
                                            actions={[
                                                <div key="labels">
                                                    {article.labels && article.labels.split(' ').map(label => (
                                                        <Tag key={label} color="blue">{label}</Tag>
                                                    ))}
                                                </div>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                title={<a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a>}
                                                description={`作者：${article.author}`}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card 
                                title={
                                    <div className="card-title-with-icon">
                                        <TagOutlined className="card-title-icon" />
                                        近期热门话题 TOP10
                                    </div>
                                }
                                className="card-with-shadow"
                            >
                                <div style={{ color: '#666', fontSize: '12px', marginBottom: '16px' }}>
                                    *基于最近100篇文章的标签统计
                                </div>
                                <List
                                    dataSource={hotTopics}
                                    renderItem={(topic, index) => (
                                        <List.Item className="hot-topic-item">
                                            <div className="topic-rank">
                                                <span className={`rank-number rank-${index + 1}`}>
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <div className="topic-content">
                                                <Tag color={index < 3 ? "volcano" : "blue"} className="topic-tag">
                                                    {topic.label}
                                                </Tag>
                                                <span className="topic-count">
                                                    {topic.count} 篇文章
                                                </span>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                    </Row>
                </>
            ) : (
                <div className="visualization-container">
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card 
                                title={
                                    <div className="card-title-with-icon">
                                        <LineChartOutlined className="card-title-icon" />
                                        文章发布趋势
                                    </div>
                                } 
                                className="visual-card"
                            >
                                <div style={{ height: '400px', width: '100%' }}>
                                    <Line data={trendChartData} options={trendChartOptions} />
                                </div>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card 
                                title={
                                    <div className="card-title-with-icon">
                                        <CloudOutlined className="card-title-icon" />
                                        热门话题分布
                                    </div>
                                } 
                                className="visual-card"
                            >
                                <WordCloud {...wordCloudConfig} />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card 
                                title={
                                    <div className="card-title-with-icon">
                                        <PieChartOutlined className="card-title-icon" />
                                        热门标签统计
                                    </div>
                                } 
                                className="visual-card"
                            >
                                <Pie {...pieConfig} />
                            </Card>
                        </Col>
                    </Row>
                </div>
            )}
        </div>
    );
};

export default Dashboard; 