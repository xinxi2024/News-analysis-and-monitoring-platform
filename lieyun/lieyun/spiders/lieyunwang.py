import scrapy


class LieyunwangSpider(scrapy.Spider):
    name = "lieyunwang"
    allowed_domains = ["lieyunpro.com"]
    start_urls = ["https://lieyunpro.com"]

    def parse(self, response):
        pass
