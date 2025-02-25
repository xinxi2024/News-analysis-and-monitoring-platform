import pymysql
from dotenv import load_dotenv
import os

load_dotenv()

MYSQL_HOST = os.getenv('MYSQL_HOST')
MYSQL_PORT = os.getenv('MYSQL_PORT')
MYSQL_USER = os.getenv('MYSQL_USER')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
MYSQL_DATABASE = os.getenv('MYSQL_DATABASE')

def init_sql():
    '''
    初始化数据库
    '''
    # 数据库连接参数
    config = {
        'host': MYSQL_HOST,  # 数据库地址
        'port': MYSQL_PORT,         # 数据库端口
        'user': MYSQL_USER,  # 数据库用户名
        'password': MYSQL_PASSWORD,  # 数据库密码
        'charset': 'utf8mb4'  # 字符集
    }

    # 连接数据库
    connection = pymysql.connect(**config)

    try:
        # 创建游标对象
        with connection.cursor() as cursor:
            # SQL 语句
            sql_commands = """
            DROP DATABASE IF EXISTS lieyun_test;
            CREATE DATABASE lieyun_test;
            USE lieyun_test;
            CREATE TABLE IF NOT EXISTS `article` (
            `id` int NOT NULL AUTO_INCREMENT,
            `title` varchar(255) NOT NULL,
            `author` varchar(100) DEFAULT NULL,
            `pub_time` varchar(100) DEFAULT NULL,
            `content` text,
            `article_url` varchar(512) DEFAULT NULL,
            `labels` varchar(255) DEFAULT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `article_url` (`article_url`)
            ) ENGINE=InnoDB AUTO_INCREMENT=2006 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
            """
            
            # 执行SQL命令
            for command in sql_commands.split(';'):
                if command.strip():
                    cursor.execute(command.strip())
            
            # 提交事务
            connection.commit()
    except pymysql.MySQLError as e:
        print(f"Error: {e}")
    finally:
        # 关闭数据库连接
        connection.close()
