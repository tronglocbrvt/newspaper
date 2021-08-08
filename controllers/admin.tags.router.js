const express = require('express');
const tagModel = require('../models/tag.model');
const tag_model = require('../models/tag.model');
const auth = require('../middlewares/auth.mdw');
const router = express.Router();

// Tags management
router.get('/add', auth.auth, auth.auth_admin, async function(req, res) {
    res.render('vwAdmin/vwTag/add_tag',{
        message: req.session.redirect_message
    });
    delete req.session.redirect_message;
});

router.post('/', auth.auth, auth.auth_admin, async function(req, res) {
    tag = await tagModel.search_by_tag_name(req.body.tag_name);
    if (tag[0] === undefined) {
        await tag_model.add(req.body);
        req.session.redirect_message = 'Thêm thành công';
        res.redirect('/admin/tags');
    }
    else {
        req.session.redirect_message = 'Tên tag đã tồn tại. Vui lòng đặt tên khác!';
        res.redirect('/admin/tags/add');
    }
});

router.get('/', auth.auth, auth.auth_admin, async function(req, res) {
    const limit = 10; // number of rows on 1 page

    // get current page, default 1
    var page = req.query.page || 1;
    if (page < 1) page = 1;

    // count articles by tag_id
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
        else if (+page >= n_pages - 1 && i >= n_pages - limit_page) {
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
        message: req.session.redirect_message
    });
    delete req.session.redirect_message
});

router.get('/:id', auth.auth, auth.auth_admin, async function(req, res) {
    const tag_id = req.params.id;
    if (isNaN(parseInt(tag_id))) {
        res.status(404);
        return res.render('vwError/viewNotFound');
    }
    const tag_name = await tag_model.get_name_tag_by_tag_id(tag_id);
    if (tag_name === undefined)
    {
        return res.redirect('/admin/tags');
    }
    res.render('vwAdmin/vwTag/edit_tag', {
        tag_name: tag_name.tag_name,
        tag_id: tag_id,
        err_message: req.session.redirect_message,
    });
    delete req.session.redirect_message;
});

router.post('/:id/patch', auth.auth, auth.auth_admin, async function(req, res) {
    if (isNaN(parseInt(req.params.id))) {
        res.status(404);
        return res.render('vwError/viewNotFound');
    }
    tag = await tagModel.search_by_tag_name(req.body.tag_name);
    if (tag[0] === undefined) {
        await tag_model.patch(req.params.id, req.body.tag_name);
        req.session.redirect_message = 'Chỉnh sửa thành công';
        res.redirect('/admin/tags');
    }
    else {
        req.session.redirect_message = 'Tên tag đã tồn tại. Vui lòng đặt tên khác!';
        res.redirect('/admin/tags/' + req.params.id);
    }
});

router.post('/:id/del', auth.auth, auth.auth_admin, async function(req, res) {
    if (isNaN(parseInt(req.params.id))) {
        res.status(404);
        return res.render('vwError/viewNotFound');
    }
    await tag_model.delete_tag_link(req.params.id);
    await tag_model.delete_tag(req.params.id);
    req.session.redirect_message = 'Xóa thành công';
    res.redirect('/admin/tags');
});

module.exports = router