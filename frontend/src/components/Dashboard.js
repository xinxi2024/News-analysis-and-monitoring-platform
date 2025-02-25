import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { WordCloud } from '@ant-design/plots';
import { Card, Row, Col, List, Tag } from 'antd';
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

    useEffect(() => {
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
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // 对趋势数据进行排序
    const sortTrendData = (data) => {
        const pairs = data.dates.map((date, index) => ({
            date,
            count: data.counts[index]
        }));

        // 将数据分为两组：具体日期和"小时前"
        const datePairs = [];
        const hourPairs = [];

        pairs.forEach(pair => {
            if (pair.date.includes('小时前')) {
                hourPairs.push(pair);
            } else {
                datePairs.push(pair);
            }
        });

        // 对具体日期按时间正序排序
        datePairs.sort((a, b) => {
            const [monthA, dayA] = a.date.split('-').map(Number);
            const [monthB, dayB] = b.date.split('-').map(Number);
            const dateA = new Date(2024, monthA - 1, dayA);
            const dateB = new Date(2024, monthB - 1, dayB);
            return dateA - dateB;
        });

        // 对"小时前"按小时数倒序排序
        hourPairs.sort((a, b) => {
            const hoursA = parseInt(a.date.match(/(\d+)小时前/)[1]);
            const hoursB = parseInt(b.date.match(/(\d+)小时前/)[1]);
            return hoursB - hoursA;  // 倒序排列，让更早的时间（小时数大的）排在前面
        });

        // 合并两个数组，具体日期在前，"小时前"在后
        const sortedPairs = [...datePairs, ...hourPairs];

        return {
            dates: sortedPairs.map(p => p.date),
            counts: sortedPairs.map(p => p.count)
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
        data: hotTopics.map(item => ({
            word: item.label,
            weight: item.count,
            color: `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`
        })),
        width: 600,
        height: 400,
        wordField: 'word',
        weightField: 'weight',
        colorField: 'color',
        wordStyle: {
            fontFamily: 'Verdana',
            fontSize: [16, 48],
            rotation: 0,
        },
        random: () => 0.5,
        padding: 8,
        timeInterval: 5000,
        animation: true,
        interactions: [
            {
                type: 'element-active',
            },
        ],
        state: {
            active: {
                style: {
                    lineWidth: 2,
                    shadowColor: '#000',
                    shadowBlur: 10,
                },
            },
        },
    };

    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={[16, 16]}>
                <Col span={16}>
                    <Card title="最新文章">
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
                    <Card title="热门话题">
                        <List
                            dataSource={hotTopics}
                            renderItem={topic => (
                                <List.Item>
                                    <Tag color="red">{topic.label}</Tag>
                                    <span>({topic.count}篇文章)</span>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                <Col span={12}>
                    <Card title="文章趋势">
                        <Line data={trendChartData} options={trendChartOptions} />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card 
                        title="关键词云" 
                        styles={{
                            body: { height: '400px' }
                        }}
                    >
                        <WordCloud {...wordCloudConfig} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard; 