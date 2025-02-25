import scrapy
from scrapy.linkextractors import LinkExtractor
from scrapy.spiders import CrawlSpider, Rule
from ..items import LieyunItem


class LywSpider(CrawlSpider):
    name = "lyw"
    allowed_domains = ["lieyunpro.com"]
    start_urls = ["https://www.lieyunpro.com/latest/p1.html"]

    rules = (
        # 下一页的规则
        Rule(LinkExtractor(allow=r"/latest/p\d+.html"), follow=True),
        # 详细页的规则，不需要跟进，需要解析
        Rule(LinkExtractor(allow=r"/archives/\d+"),
             follow=False, callback='parse_item'),
    )

    def parse_item(self, response):
        title_lst = response.xpath(
            '//h1[@class="lyw-article-title-inner"]/text()').getall()
        # 标题
        title = ''.join(title_lst).strip()
        # 发表时间
        publish_time = response.xpath(
            '//h1[@class="lyw-article-title-inner"]/span/text()').get()
        # 作者
        author_name = response.xpath(
            '//a[contains(@class,"author-name")]/text()').get()
        # 文章
        content = response.xpath('//div[@class="main-text"]//text()').getall()
        content = ''.join(content).strip()
        # 文章的url
        article_url = response.url
        # 文章标签
        # 使用Scrapy的response对象来选择所有符合条件的li标签下的a标签的text
        a_texts = response.xpath('//*[@id="fixed_container"]/div[1]/div[2]/ul/li//a/text()').getall()
        # 使用空格将所有text值连接起来
        file_tag = ' '.join(a_texts).strip()

        # 创建item对象
        item = LieyunItem()
        item['title'] = title
        item['content'] = content
        item['author'] = author_name
        item['publish_time'] = publish_time
        item['article_url'] = article_url
        item['labels'] = file_tag

        yield item
