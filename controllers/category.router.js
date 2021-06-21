const express = require('express');
const categoryModel = require('../models/category.model')

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
        cat_name: req.body.catName,
        parent_cat: +req.body.parentCat
    };
    await categoryModel.add(new_obj);
    res.redirect('/categories')
});

router.get('/getsubcats', async function(req, res){
    sub_cats = await categoryModel.get_sub_cats();
    sub_cats = sub_cats[0];
    res.json(sub_cats);
});

module.exports = router
