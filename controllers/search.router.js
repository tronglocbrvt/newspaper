const express = require('express');
const searchModel = require('../models/search.model');
const articleModel = require('../models/article.model');
const getTimeModule = require('../utils/get_time.js');
const router = express.Router();

/*
 * API get Articles by Search Keyword
 * Input URL: query: 
    * criteria (0: title; 1: abstract; 2: content)
    * keyword
    * page_number (if needed)
 * Render page view contains list articles based on keyword & criteria (use full-text-search)
 */
router.get('/', async function(req, res) {
    // get keyword and criteria
    const keyword = req.query.keyword || '';
    const criteria = req.query.criteria || 0;

    // number of articles on 1 page
    const limit = 10;
    const page = req.query.page || 1;
    if (page < 1) page = 1;

    var type = 'article_title';

    // criteria search
    if (+criteria === 1) {
        type = 'article_abstract';
    }
    else if (+criteria === 2){
        type = 'article_content';
    }

    // set status of current criteria is TRUE
    cur_criteria = [false, false, false];
    cur_criteria[criteria] = true;

    // count articles based on keyword & criteria
    premium = (req.session.auth === true && getTimeModule.get_time_now() <= getTimeModule.get_time_from_date(req.session.authUser.time_premium)) ? 1 : 0;
    const total = await searchModel.count_result_from_search(keyword, type, premium);
    let n_pages = Math.ceil(total[0][0].total / limit); // total page

    // set status of current page is TRUE
    const page_numbers = [];
    for (i = 1; i <= n_pages; i++) {
    page_numbers.push({
      value: i,
      isCurrent: i === +page,
      hide: true
    });
    }

    // limit number of visible pages
    const limit_page = 5; 
    for (i = 0; i < n_pages; i++) {
        if (+page < limit_page - 2 && i < limit_page) {
            page_numbers[i].hide = false;
        }
        else if (+page - 3 <= i && i < +page + 2) {
            page_numbers[i].hide = false;
        }
    }

    // set offset that pass to query in database
    const offset = (page - 1) * limit;
  
    // get list articles based on keyword and criteria
    const list_articles = await searchModel.get_articles_from_search(keyword, type, offset, premium);

    // get tags each article
    var tags = new Array();
    if (list_articles[0].length !== 0) {
        for (let i = 0; i < list_articles[0].length; i++) {
            let tags_article = await articleModel.find_tags_by_article_id(list_articles[0][i].article_id);
            tags[i] = tags_article[0];
        }
    }

    res.render('vwSearch/search', {
        keyword,
        criteria,
        cur_criteria,
        articles: list_articles[0],
        tags,
        page_numbers,
        page_first: parseInt(page) === 1,
        page_last: parseInt(page) === parseInt(n_pages),
        next_page: parseInt(page) + 1 ,
        previous_page: parseInt(page) - 1,
        n_pages,
        empty: list_articles[0].length === 0
    })
});

module.exports = router
