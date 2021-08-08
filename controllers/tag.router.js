const express = require('express');
const categoryModel = require('../models/category.model');
const articleModel = require('../models/article.model');
const tagModel = require('../models/tag.model');
const getTimeModule = require('../utils/get_time.js');
const router = express.Router();

/*
 * API get Articles by tagID
 * Input URL: tag_id
 * Render page view contains list articles based on tag
 */
router.get('/:tag_id', async function(req, res) {
    // get tag_id from param url, default 0
    const tag_id = req.params.tag_id || 0;
    if (isNaN(parseInt(tag_id))) {
        res.status(404);
        return res.render('vwError/viewNotFound');
    }
    // get name tag from tag_id
    const name_tag = await tagModel.get_name_tag_by_tag_id(tag_id);
    if (name_tag === undefined) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }

    // number of articels on 1 page
    const limit = 10;

    // get current page, default 1
    var page = req.query.page || 1;
    if (page < 1) page = 1;

    // get time now (milisecond)
    time_now = getTimeModule.get_time_now();

    // count articles based on tag_id
    premium = (req.session.auth === true && time_now <= getTimeModule.get_time_from_date(req.session.authUser.time_premium)) ? 1 : 0;
    const total = await articleModel.count_by_tag_id(tag_id, premium, time_now / 1000);
    let n_pages = Math.ceil(total[0][0].total / limit);
    
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
        else if (+page >= n_pages - 1 && i >= n_pages - limit_page) {
            page_numbers[i].hide = false;
        }
        else if (+page - 3 <= i && i < +page + 2) {
            page_numbers[i].hide = false;
        }
    }

    // set offset that pass to query in database
    const offset = (page - 1) * limit;

    // list articles by tag_id
    const list = await articleModel.find_by_tag_id(tag_id, offset, premium, time_now/1000);

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
        name_tag: name_tag.tag_name,
        page_numbers,
        n_pages,
        page_first: parseInt(page) === 1,
        page_last: parseInt(page) === parseInt(n_pages),
        empty: list[0].length === 0
    })
});

router.get('/', async function(req, res){
    const tags = await tagModel.get_tags();
    res.json(tags[0]);
});

module.exports = router
