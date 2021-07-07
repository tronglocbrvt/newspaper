const express = require('express');
const categoryModel = require('../models/category.model')
const articleModel = require('../models/article.model')

const router = express.Router();

router.get('/', async function(req, res){
    const list = await categoryModel.all()
    res.render('vwCategories/about', {
        categories: list
    });
}); 

router.get('/add', function(req, res){
    res.render('vwCategories/add');
});

router.post('/add', async function(req, res){
    const new_obj = {
        category_name: req.body.catName,
        parent_category_id: +req.body.parentCat
    };
    await categoryModel.add(new_obj);
    res.redirect('/categories')
});

router.get('/getsubcats', async function(req, res){
    sub_cats = await categoryModel.get_sub_cats();
    sub_cats = sub_cats[0];
    res.json(sub_cats);
});

/*
 * API get Articles by Parent categoryID
 * Input URL: category_id: category id (only parent category)
 * Render page view contains list articles of parent category 
 */
router.get('/:category_id', async function(req, res) {
    // get category_id from param url, default 0
    const cat_id = req.params.category_id || 0;

    const limit = 10; // number of articles on 1 page

    // get current page, default 1
    const page = req.query.page || 1;
    if (page < 1) page = 1;

    // count articles by cat_id
    const total = await articleModel.count_by_cat_id(cat_id);
    let n_pages = Math.ceil(total[0][0].total / limit); // get total page

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
  
    // get list articles by parent categoryID
    const list = await articleModel.find_by_cat_id(cat_id, offset);

    // get list sub-categories by parent categoryID
    const sub_cats = await categoryModel.get_sub_cats_by_cat_id(cat_id);

    // get list tags of each article
    var tags = new Array();
    if (list[0].length !== 0) {
        for (let i = 0; i < list[0].length; i++) {
            let tags_article = await articleModel.find_tags_by_article_id(list[0][i].article_id);
            tags[i] = tags_article[0];
        }
    }

    res.render('vwCategories/article_category', {
        articles: list[0],
        tags,
        sub_cats: sub_cats[0],
        page_numbers,
        n_pages,
        page_first: parseInt(page) === 1, // check first page 
        page_last: parseInt(page) === parseInt(n_pages), // check last page
        next_page: parseInt(page) + 1 ,
        previous_page: parseInt(page) - 1,
        empty: list[0].length === 0 || sub_cats[0].length === 0 // check empty
    })
});

module.exports = router