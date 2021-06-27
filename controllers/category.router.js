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

router.get('/:category_id', async function(req, res) {
    const cat_id = req.params.category_id || 0;

    const limit = 10;
    const page = req.query.page || 1;
    if (page < 1) page = 1;

    const total = await articleModel.count_by_cat_id(cat_id);
    let n_pages = Math.ceil(total[0][0].total / limit);

    const page_numbers = [];
    for (i = 1; i <= n_pages; i++) {
    page_numbers.push({
      value: i,
      isCurrent: i === +page
    });
    }

    const offset = (page - 1) * limit;
  
    const list = await articleModel.find_by_cat_id(cat_id, offset);
    const sub_cats = await categoryModel.get_sub_cats_by_cat_id(cat_id);
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
        page_first: parseInt(page) === 1,
        page_last: parseInt(page) === parseInt(n_pages),
        next_page: parseInt(page) + 1 ,
        previous_page: parseInt(page) - 1,
        empty: list[0].length === 0 || sub_cats[0].length === 0
    })
});

module.exports = router