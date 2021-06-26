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
    const list = await articleModel.find_by_cat_id(cat_id);
    const sub_cats = await categoryModel.get_sub_cats_by_cat_id(cat_id);
    var tags = [0];
    if (list[0].length !== 0) {
        tags = await articleModel.find_tags_by_article_id(list[0][0].article_id);
    }
    res.render('vwCategories/article_category', {
        articles: list[0],
        tags: tags[0],
        sub_cats: sub_cats[0],
        empty: list[0].length === 0 || sub_cats[0].length === 0
    })
});

module.exports = router
