from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Article(db.Model):
    __tablename__ = 'article'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    author = db.Column(db.String(100))
    pub_time = db.Column(db.String(100))
    content = db.Column(db.Text)
    article_url = db.Column(db.String(512), unique=True)
    labels = db.Column(db.String(255)) 