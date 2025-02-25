from flask import Blueprint, jsonify
from datetime import datetime, timedelta
from collections import Counter
import jieba
from .models import db, Article
from sqlalchemy import func
import pandas as pd

api = Blueprint('api', __name__)

@api.route('/latest_articles', methods=['GET'])
def get_latest_articles():
    articles = Article.query.order_by(Article.pub_time.desc()).limit(10).all()
    return jsonify([{
        'id': article.id,
        'title': article.title,
        'author': article.author,
        'pub_time': article.pub_time,
        'labels': article.labels,
        'url': article.article_url
    } for article in articles])

@api.route('/trend_analysis', methods=['GET'])
def get_trend_analysis():
    # 获取最近7天的文章数量趋势
    seven_days_ago = datetime.now() - timedelta(days=7)
    articles = Article.query.filter(Article.pub_time >= seven_days_ago).all()
    
    # 按日期分组统计
    daily_counts = {}
    for article in articles:
        date = article.pub_time.split(' ')[0]  # 假设pub_time格式为"YYYY-MM-DD HH:MM:SS"
        daily_counts[date] = daily_counts.get(date, 0) + 1
    
    return jsonify({
        'dates': list(daily_counts.keys()),
        'counts': list(daily_counts.values())
    })

@api.route('/hot_topics', methods=['GET'])
def get_hot_topics():
    # 获取最近24小时的文章
    recent_articles = Article.query.order_by(Article.pub_time.desc()).limit(100).all()
    
    # 提取所有标签
    all_labels = []
    for article in recent_articles:
        if article.labels:
            all_labels.extend(article.labels.split())
    
    # 统计标签频率
    label_counter = Counter(all_labels)
    hot_topics = label_counter.most_common(10)
    
    return jsonify({
        'topics': [{'label': topic[0], 'count': topic[1]} for topic in hot_topics]
    })

@api.route('/keyword_analysis', methods=['GET'])
def get_keyword_analysis():
    # 获取最近的文章内容
    recent_articles = Article.query.order_by(Article.pub_time.desc()).limit(50).all()
    
    # 分词并统计词频
    words = []
    for article in recent_articles:
        if article.content:
            words.extend(jieba.cut(article.content))
    
    # 过滤停用词（这里需要添加停用词列表）
    word_counter = Counter(words)
    keywords = word_counter.most_common(100)
    
    return jsonify({
        'keywords': [{'word': word[0], 'count': word[1]} for word in keywords]
    })

@api.route('/topic_summary/<topic>', methods=['GET'])
def get_topic_summary(topic):
    # 获取特定主题的文章
    articles = Article.query.filter(Article.labels.like(f'%{topic}%')).order_by(Article.pub_time.desc()).limit(10).all()
    
    return jsonify({
        'topic': topic,
        'articles': [{
            'title': article.title,
            'author': article.author,
            'pub_time': article.pub_time,
            'summary': article.content[:200] if article.content else '',  # 简单的摘要
            'url': article.article_url
        } for article in articles]
    }) 