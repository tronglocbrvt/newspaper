const express = require('express');
const categoryModel = require('../models/category.model');

const router = express.Router();

// Category management
router.get('/categories/add', async function(req, res) {
    res.render('vwAdmin/vwCategory/add_category');
});

router.post('/categories', async function(req, res) {
    await categoryModel.add(req.body)
    res.redirect('/admin/categories');
});

router.get('/categories', async function(req, res) {
    const list = await categoryModel.get_main_cats()
    res.render('vwAdmin/vwCategory/view_category', {
        categories: list[0]
    });
});

router.get('/categories/:id', async function(req, res) {
    const cat_id = req.params.id;
    const category = await categoryModel.find_by_cat_id(cat_id);
    if (category[0] === undefined)
    {
        return res.redirect('/admin/categories');
    }
    res.render('vwAdmin/vwCategory/edit_category', {
        category: category[0]
    });
});

router.post('/categories/patch', async function(req, res) {
    await categoryModel.patch(req.body.cat_id, req.body.cat_name);
    res.redirect('/admin/categories');
});

router.post('/categories/del', async function(req, res) {
    await categoryModel.delete(req.body.cat_id);
    res.redirect('/admin/categories');
});

module.exports = router