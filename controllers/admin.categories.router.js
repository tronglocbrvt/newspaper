const express = require('express');
const categoryModel = require('../models/category.model');

const router = express.Router();

// Category management
router.get('/add', async function(req, res) {
    res.render('vwAdmin/vwCategory/add_category');
});

router.post('/', async function(req, res) {
    await categoryModel.add(req.body)
    res.redirect('/admin/categories');
});

router.get('/', async function(req, res) {
    const limit = 10; // number of rows on 1 page

    // get current page, default 1
    const page = req.query.page || 1;
    if (page < 1) page = 1;

    // count articles by cat_id
    const total = await categoryModel.count_main_cat();
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

    const list = await categoryModel.list_main_cat(offset);

    res.render('vwAdmin/vwCategory/view_category', {
        categories: list[0],
        page_numbers,
        n_pages,
        page_first: parseInt(page) === 1, // check first page 
        page_last: parseInt(page) === parseInt(n_pages), // check last page
        next_page: parseInt(page) + 1 ,
        previous_page: parseInt(page) - 1,
    });
});

router.get('/:id', async function(req, res) {
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

router.post('/:id/patch', async function(req, res) {
    await categoryModel.patch(req.params.id, req.body.cat_name);
    res.redirect('/admin/categories');
});

router.post('/:id/del', async function(req, res) {
    await categoryModel.delete(req.params.id);
    res.redirect('/admin/categories');
});

module.exports = router