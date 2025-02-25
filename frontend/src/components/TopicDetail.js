import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, List, Typography, Tag, Spin } from 'antd';
import axios from 'axios';

const { Title, Paragraph } = Typography;

const TopicDetail = () => {
    const { topic } = useParams();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get(`/api/topic_summary/${encodeURIComponent(topic)}`)
            .then(response => {
                setArticles(response.data.articles);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching topic data:', error);
                setLoading(false);
            });
    }, [topic]);

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>
                <Tag color="blue" style={{ marginRight: '8px' }}>{topic}</Tag>
                相关新闻
            </Title>
            
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <List
                    itemLayout="vertical"
                    dataSource={articles}
                    renderItem={article => (
                        <Card style={{ marginBottom: '16px' }}>
                            <List.Item>
                                <List.Item.Meta
                                    title={
                                        <a 
                                            href={article.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                        >
                                            {article.title}
                                        </a>
                                    }
                                    description={`${article.author} · ${article.pub_time}`}
                                />
                                <Paragraph 
                                    ellipsis={{ rows: 3 }}
                                    style={{ marginTop: '16px' }}
                                >
                                    {article.summary}
                                </Paragraph>
                            </List.Item>
                        </Card>
                    )}
                />
            )}
        </div>
    );
};

export default TopicDetail; 