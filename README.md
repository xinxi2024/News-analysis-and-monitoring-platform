# 猎云网文章分析平台

一个基于 Python Flask 和 React 的新闻文章分析平台，提供实时数据可视化和内容分析功能。

## 功能特点

- 实时文章趋势分析
- 热门话题词云展示
- 最新文章列表展示
- 文章标签分类
- 响应式布局设计

## 技术栈

### 后端
- Python 3.8+
- Flask 2.0.1
- Flask-SQLAlchemy 2.5.1
- PyMySQL 1.0.2
- jieba 0.42.1
- pandas 1.3.3

### 前端
- React 18
- Ant Design
- Chart.js
- @ant-design/plots
- Axios

## 快速开始

### 环境要求
- Python 3.8+
- Node.js 14+
- MySQL 5.7+

### 后端设置

1. 创建虚拟环境并激活：
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. 安装依赖：
```bash
pip install -r requirements.txt
```

3. 配置环境变量：
创建 `.env` 文件并设置以下变量：
```
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_NAME=lieyun_test
```

4. 启动后端服务器：
```bash
python run.py
```

### 前端设置

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm start
```

## 项目结构

```
├── app/
│   ├── models.py        # 数据库模型
│   └── routes.py        # API路由
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/  # React组件
│       └── App.js       # 主应用组件
├── .env                 # 环境变量
├── requirements.txt     # Python依赖
├── run.py              # 应用入口
└── README.md           # 项目文档
```

## API 接口

- GET `/api/latest_articles` - 获取最新文章列表
- GET `/api/trend_analysis` - 获取文章趋势数据
- GET `/api/hot_topics` - 获取热门话题
- GET `/api/keyword_analysis` - 获取关键词分析
- GET `/api/topic_summary/<topic>` - 获取特定主题的文章摘要


## 许可证

MIT License
