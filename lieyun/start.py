from scrapy import cmdline

def start_spiders():
    '''
    启动爬虫
    '''
    cmdline.execute(['scrapy','crawl','lyw'])

def test():
    print('test')

if __name__ == '__main__':
    start_spiders()
