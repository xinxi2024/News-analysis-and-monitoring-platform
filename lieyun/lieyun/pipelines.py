# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
from twisted.enterprise import adbapi

class LieyunPipeline:
    def __init__(self, mysql_config):
        # 创建连接池对象
        self.dbpool = adbapi.ConnectionPool(
            mysql_config['DRIVER'],
            host=mysql_config['HOST'],
            user=mysql_config['USER'],
            password=mysql_config['PASSWORD'],
            database=mysql_config['DATABASE'],
            auth_plugin=mysql_config['auth_plugin'],
            charset='utf8'
        )
        pass
    
    # 重写类方法
    @classmethod
    def from_crawler(cls, crawler):     
        # 只要重写了该方法，那么以后创建对象时，就会调用该方法获取pielines对象
        mysql_config = crawler.settings['MYSQL_DB_CONFIG']
        return cls(mysql_config)
        
    def process_item(self, item, spider):
        result = self.dbpool.runInteraction(self.insert_item, item)
        result.addErrback(self.insert_error)
        return item

    # 执行sql语句的方法 
    def insert_item(self, cursor, item):
        sql = 'insert into article(id,title,author,pub_time,content,article_url, labels) values(null,%s,%s,%s,%s,%s,%s)'
        args = (item['title'], item['author'], item['publish_time'], item['content'], item['article_url'], item['labels'])        
        cursor.execute(sql,args)        
        
    def insert_error(self, failure):
        print("=================================================================================")
        print(failure)
        print("=================================================================================")