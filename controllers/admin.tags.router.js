const express = require('express');
const tag_model = require('../models/tag.model');

const router = express.Router();

// Tags management
router.get('/add', async function(req, res) {
    res.render('vwAdmin/vwTag/add_tag');
});

router.post('/', async function(req, res) {
    await tag_model.add(req.body)
    res.redirect('/admin/tags');
});

router.get('/', async function(req, res) {
    const limit = 10; // number of rows on 1 page

    // get current page, default 1
    const page = req.query.page || 1;
    if (page < 1) page = 1;

    // count articles by cat_id
    const total = await tag_model.count_tag();
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

    const list = await tag_model.get_list_tags(offset);
    res.render('vwAdmin/vwTag/view_tag', {
        tags: list[0],
        page_numbers,
        n_pages,
        page_first: parseInt(page) === 1, // check first page 
        page_last: parseInt(page) === parseInt(n_pages), // check last page
        next_page: parseInt(page) + 1 ,
        previous_page: parseInt(page) - 1,
    });
});

router.get('/:id', async function(req, res) {
    const tag_id = req.params.id;
    const tag_name = await tag_model.get_name_tag_by_tag_id(tag_id);
    if (tag_name === undefined)
    {
        return res.redirect('/admin/tags');
    }
    res.render('vwAdmin/vwTag/edit_tag', {
        tag_name: tag_name.tag_name,
        tag_id: tag_id,
    });
});

router.post('/:id/patch', async function(req, res) {
    await tag_model.patch(req.params.id, req.body.tag_name);
    res.redirect('/admin/tags');
});

router.post('/:id/del', async function(req, res) {
    await tag_model.delete(req.params.id);
    res.redirect('/admin/tags');
});

module.exports = router