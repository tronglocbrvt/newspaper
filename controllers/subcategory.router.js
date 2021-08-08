const express = require('express');
const categoryModel = require('../models/category.model');
const articleModel = require('../models/article.model');
const getTimeModule = require('../utils/get_time.js');
const router = express.Router();

/*
 * API get Articles by subcategoryID
 * Input URL: 
    * id: subcategory id (only subcategory)
    * cat_id: get from routers middleware
 * Render page view contains list articles of subcategory 
 */
router.get('/subs/:id', async function(req, res) {
    // get param cat_id (from router middleware) and sub_id
    const cat_id = req.cat_id || 0;
    const sub_id = req.params.id || 0;

    if (isNaN(parseInt(cat_id)) || isNaN(parseInt(sub_id))) {
        res.status(404);
        return res.render('vwError/viewNotFound');
    }

    // number of articels on 1 page
    const limit = 10;

    // get current page, default 1
    var page = req.query.page || 1;
    if (page < 1) page = 1;

    // get time now (milisecond)
    time_now = getTimeModule.get_time_now();

    // get total articles by subcat_id
    premium = (req.session.auth === true && time_now <= getTimeModule.get_time_from_date(req.session.authUser.time_premium)) ? 1 : 0;
    const total = await articleModel.count_by_subcat_id(sub_id, premium, time_now/1000);
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
  
    // get name and id parent category by cat id
    const name_cat = await categoryModel.get_name_by_cat_id(sub_id);

    if (name_cat[0].length === 0 || +name_cat[0][0].id !== +cat_id) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }

    // list articles by subcat_id
    const list = await articleModel.find_by_subcat_id(sub_id, offset, premium, time_now/1000);

    // get sub_cats to display
    const sub_cats = await categoryModel.get_sub_cats_by_cat_id(cat_id);

    // set status of current sub-cat is TRUE
    for (i = 0; i < sub_cats[0].length; i++) {
        if (sub_cats[0][i].category_id === +sub_id) {
            sub_cats[0][i].is_active = true;
        }
        else {
            sub_cats[0][i].is_active = false;
        }
    }

    // get tags of each article
    var tags = new Array();
    if (list[0].length !== 0) {
        for (let i = 0; i < list[0].length; i++) {
            let tags_article = await articleModel.find_tags_by_article_id(list[0][i].article_id);
            tags[i] = tags_article[0];
        }
    }

    res.render('vwCategories/article_subcategory', {
        articles: list[0],
        tags,
        name_cat: name_cat[0],
        sub_cats: sub_cats[0],
        page_numbers,
        n_pages,
        page_first: parseInt(page) === 1,
        page_last: parseInt(page) === parseInt(n_pages),
        empty: list[0].length === 0
    })
});

module.exports = router
