const express = require('express');
const searchModel = require('../models/search.model')
const articleModel = require('../models/article.model')
const router = express.Router();

router.get('/', async function(req, res) {
    const keyword = req.query.keyword || '';
    const criteria = req.query.criteria || 0;

    const limit = 10;
    const page = req.query.page || 1;
    if (page < 1) page = 1;

    var type = 'article_title';
    if (criteria === 1) {
        type = 'article_abstract';
    }
    else if (criteria === 2){
        type = "article_content";
    }

    const total = await searchModel.count_result_from_search(keyword, type);
    let n_pages = Math.ceil(total[0][0].total / limit);

    const page_numbers = [];
    for (i = 1; i <= n_pages; i++) {
    page_numbers.push({
      value: i,
      isCurrent: i === +page
    });
    }

    const offset = (page - 1) * limit;
  
    const list_articles = await searchModel.get_articles_from_search(keyword, type, offset);

    var tags = new Array();
    if (list_articles[0].length !== 0) {
        for (let i = 0; i < list_articles[0].length; i++) {
            let tags_article = await articleModel.find_tags_by_article_id(list_articles[0][i].article_id);
            tags[i] = tags_article[0];
        }
    }

    res.render('vwSearch/search', {
        keyword,
        articles: list_articles[0],
        tags,
        page_numbers,
        page_first: parseInt(page) === 1,
        page_last: parseInt(page) === parseInt(n_pages),
        next_page: parseInt(page) + 1 ,
        previous_page: parseInt(page) - 1,
        empty: list_articles[0].length === 0
    })
});

module.exports = router
