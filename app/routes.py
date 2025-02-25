from flask import Blueprint, jsonify
from datetime import datetime, timedelta
from collections import Counter
import jieba
from .models import db, Article
from sqlalchemy import func
import pandas as pd
import subprocess
import os
import json

api = Blueprint('api', __name__)

# 用于存储最后更新时间的文件路径
LAST_UPDATE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'last_update.json')

def get_last_update_time():
    try:
        if os.path.exists(LAST_UPDATE_FILE):
            with open(LAST_UPDATE_FILE, 'r') as f:
                data = json.load(f)
                return data.get('last_update')
    except Exception:
        pass
    return None

def save_last_update_time():
    try:
        with open(LAST_UPDATE_FILE, 'w') as f:
            json.dump({'last_update': datetime.now().strftime('%Y-%m-%d %H:%M:%S')}, f)
    except Exception as e:
        print(f"Error saving last update time: {e}")

@api.route('/system_info', methods=['GET'])
def get_system_info():
    return jsonify({
        'current_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'last_update': get_last_update_time()
    })

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

@api.route('/daily_summary', methods=['GET'])
def get_daily_summary():
    # 获取今日开始时间
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # 查询今日文章
    today_articles = Article.query.filter(
        Article.pub_time >= today.strftime('%Y-%m-%d %H:%M:%S')
    ).all()
    
    if not today_articles:
        return jsonify({
            'total_count': 0,
            'summary': '今日暂无新文章。',
            'top_authors': [],
            'top_labels': []
        })

    # 统计今日作者数据
    authors = Counter([article.author for article in today_articles if article.author])
    
    # 获取所有文章的标签统计
    all_articles = Article.query.all()
    all_labels = []
    for article in all_articles:
        if article.labels:
            all_labels.extend(article.labels.split())
    labels = Counter(all_labels)

    # 生成摘要
    summary = f"今日共发布{len(today_articles)}篇文章。"
    if authors:
        top_author = authors.most_common(1)[0]
        summary += f"其中{top_author[0]}最为活跃，发布了{top_author[1]}篇文章。"
    if labels:
        top_label = labels.most_common(1)[0]
        summary += f"平台最热门的话题是'{top_label[0]}'，累计相关文章{top_label[1]}篇。"

    return jsonify({
        'total_count': len(today_articles),
        'summary': summary,
        'top_authors': authors.most_common(5),
        'top_labels': labels.most_common(5)
    })

@api.route('/update_articles', methods=['POST'])
def update_articles():
    try:
        # 获取项目根目录
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        lieyun_dir = os.path.join(root_dir, 'lieyun')
        
        # 执行爬虫脚本
        result = subprocess.run(
            ['python', '-c', 'from start import start_spiders; start_spiders()'],
            cwd=lieyun_dir,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            # 更新成功后保存更新时间
            save_last_update_time()
            return jsonify({
                'status': 'success',
                'message': '文章更新成功',
                'last_update': get_last_update_time()
            })
        else:
            return jsonify({
                'status': 'error',
                'message': '更新失败：' + result.stderr
            }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500 