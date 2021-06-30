const express = require('express');
const categoryModel = require('../models/category.model')
const articleModel = require('../models/article.model')
const router = express.Router();

/*
 * API get Articles by tagID
 * Input URL: tag_id
 * Render page view contains list articles based on tag
 */
router.get('/:tag_id', async function(req, res) {
    // get tag_id from param url, default 0

    const tag_id = req.params.tag_id || 0;
    // number of articels on 1 page
    const limit = 10;

    // get current page, default 1
    const page = req.query.page || 1;
    if (page < 1) page = 1;

    // count articles based on tag_id
    const total = await articleModel.count_by_tag_id(tag_id);
    let n_pages = Math.ceil(total / limit);
    
    // get current page, default 1
    const page_numbers = [];
    for (i = 1; i <= n_pages; i++) {
    page_numbers.push({
      value: i,
      isCurrent: i === +page
    });
    }

    // set offset that pass to query in database
    const offset = (page - 1) * limit;
  
    // list articles by tag_id
    const list = await articleModel.find_by_tag_id(tag_id, offset);

    // get tags each article
    var tags = new Array();
    if (list[0].length !== 0) {
        for (let i = 0; i < list[0].length; i++) {
            let tags_article = await articleModel.find_tags_by_article_id(list[0][i].article_id);
            tags[i] = tags_article[0];
        }
    }
    res.render('vwTags/article_tags', {
        articles: list[0],
        tags,
        page_numbers,
        page_first: parseInt(page) === 1,
        page_last: parseInt(page) === parseInt(n_pages),
        next_page: parseInt(page) + 1 ,
        previous_page: parseInt(page) - 1,
        empty: list[0].length === 0
    })
});

module.exports = router
