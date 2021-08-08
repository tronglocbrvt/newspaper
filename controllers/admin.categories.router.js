const express = require('express');
const categoryModel = require('../models/category.model');
const auth = require('../middlewares/auth.mdw');
const router = express.Router();

// Category management
router.get('/dashboard', auth.auth, auth.auth_admin, async function(req, res) {
    res.render('vwAdmin/dashboard');
});
router.get('/add', auth.auth, auth.auth_admin, async function(req, res) {
    res.render('vwAdmin/vwCategory/add_category',{message: req.session.redirect_message});
    delete req.session.redirect_message;
});

router.post('/', auth.auth, auth.auth_admin, async function(req, res) {
    cat = await categoryModel.search_by_cat_name(req.body.category_name);
    if (cat[0][0] === undefined) {
        await categoryModel.add(req.body);
        req.session.redirect_message = 'Thêm thành công';
        res.redirect('/admin/categories');
    }
    else {
        req.session.redirect_message = 'Tên chuyên mục đã tồn tại. Vui lòng đặt tên khác!';
        res.redirect('/admin/categories/add');
    }
});

router.get('/', auth.auth, auth.auth_admin, async function(req, res) {
    const limit = 10; // number of rows on 1 page

    // get current page, default 1
    var page = req.query.page || 1;
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
        else if (+page >= n_pages - 1 && i >= n_pages - limit_page) {
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
        message: req.session.redirect_message
    });
   delete req.session.redirect_message
});

router.get('/:id', auth.auth, auth.auth_admin, async function(req, res) {
    const cat_id = req.params.id;
    if (isNaN(parseInt(cat_id))) {
        res.status(404);
        return res.render('vwError/viewNotFound');
    }
    const category = await categoryModel.find_by_cat_id(cat_id);
    if (category[0] === undefined)
    {
        return res.redirect('/admin/categories');
    }
    res.render('vwAdmin/vwCategory/edit_category', {
        category: category[0],
        err_message: req.session.redirect_message
    });
    delete req.session.redirect_message;
});

router.post('/:id/patch', auth.auth, auth.auth_admin, async function(req, res) {
    if (isNaN(parseInt(req.params.id))) {
        res.status(404);
        return res.render('vwError/viewNotFound');
    }
    cat = await categoryModel.search_by_cat_name(req.body.category_name);
    if (cat[0][0] === undefined) {
        await categoryModel.patch(req.params.id, req.body.cat_name);
        req.session.redirect_message = 'Chỉnh sửa thành công';
        res.redirect('/admin/categories');
    }
    else {
        req.session.redirect_message = 'Tên chuyên mục đã tồn tại. Vui lòng đặt tên khác!';
        res.redirect('/admin/categories/' + req.params.id);
    }
});

router.post('/:id/del', auth.auth, auth.auth_admin, async function(req, res) {
    if (isNaN(parseInt(req.params.id))) {
        res.status(404);
        return res.render('vwError/viewNotFound');
    }
    count_articles = await categoryModel.count_articles_in_cat(req.params.id);
    count_subcats = await categoryModel.count_sub_cats_by_cat_id(req.params.id);
    if (count_articles[0][0].count === 0 && count_subcats[0][0].total === 0) {
        await categoryModel.delete(req.params.id);
        req.session.redirect_message = 'Xóa thành công';
    }
    else {
        req.session.redirect_message = 'Không thể xóa - Do đây là chuyên mục chính - Cần xóa các bài báo và chuyên mục con trước';
        return res.redirect('/admin/categories/' + req.params.id);
    }
    res.redirect('/admin/categories');
});

module.exports = router