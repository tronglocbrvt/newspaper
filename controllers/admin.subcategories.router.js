const express = require('express');
const categoryModel = require('../models/category.model');
const auth = require('../middlewares/auth.mdw');
const router = express.Router();

// Subcategory management
router.get('/add', auth.auth, auth.auth_admin, async function(req, res) {
    if (isNaN(parseInt(req.cat_id))) {
        res.status(404);
        return res.render('vwError/viewNotFound');
    }
    res.render('vwAdmin/vwSubCategory/add_subcategory', {
        cat_id: req.cat_id,
        message: req.session.redirect_message
    });
    delete req.session.redirect_message;
});

router.post('/', auth.auth, auth.auth_admin, async function(req, res) {
    if (isNaN(parseInt(req.cat_id))) {
        res.status(404);
        return res.render('vwError/viewNotFound');
    }
    req.body.parent_category_id = req.cat_id;
    cat = await categoryModel.search_by_cat_name(req.body.category_name);
    if (cat[0][0] === undefined) {
        await categoryModel.add(req.body);
        req.session.redirect_message = 'Thêm thành công';
        res.redirect('/admin/categories/' + req.cat_id + '/subs');
    }
    else {
        req.session.redirect_message = 'Tên chuyên mục đã tồn tại. Vui lòng đặt tên khác!';
        res.redirect('/admin/categories/' + req.cat_id + '/add');
    }
});

router.get('/subs', auth.auth, auth.auth_admin, async function(req, res) {
    const cat_id = req.cat_id || 0;
    if (isNaN(parseInt(cat_id))) {
        res.status(404);
        return res.render('vwError/viewNotFound');
    }
    const limit = 10; // number of rows on 1 page

    // get current page, default 1
    var page = req.query.page || 1;
    if (page < 1) page = 1;

    // count articles by cat_id
    const total = await categoryModel.count_sub_cats_by_cat_id(cat_id);
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

    const list = await categoryModel.list_sub_cats_by_cat_id(cat_id, offset);
    const cat_name = await categoryModel.get_name_by_id(cat_id);
    res.render('vwAdmin/vwSubCategory/view_subcategory', {
        categories: list[0],
        page_numbers,
        n_pages,
        page_first: parseInt(page) === 1, // check first page 
        page_last: parseInt(page) === parseInt(n_pages), // check last page
        next_page: parseInt(page) + 1 ,
        previous_page: parseInt(page) - 1,
        cat_name: cat_name[0][0],
        cat_id: cat_id,
        message: req.session.redirect_message
    });
    delete req.session.redirect_message
});

router.get('/subs/:id', auth.auth, auth.auth_admin, async function(req, res) {
    const cat_id = req.params.id;
    if (isNaN(parseInt(req.cat_id)) || isNaN(parseInt(cat_id))) {
        res.status(404);
        return res.render('vwError/viewNotFound');
    }
    const category = await categoryModel.find_by_cat_id(cat_id);
    const parent_name = await categoryModel.get_name_by_cat_id(cat_id);
    const main_cats = await categoryModel.get_main_cats();

    for (i=0; i < main_cats[0].length; i++) {
        if (+main_cats[0][i].category_id === +req.cat_id) {
            main_cats[0][i].select = true;
        }
        else
            main_cats[0][i].select = false;
    }

    if (category[0][0] === undefined)
    {
        return res.redirect('/admin/categories/' + req.cat_id + '/subs');
    }
    res.render('vwAdmin/vwSubCategory/edit_subcategory', {
        category: category[0],
        err_message: req.session.redirect_message,
        parent_cat_id: req.cat_id,
        parent_cat_name: parent_name[0][0].name,
        main_cats: main_cats[0],
    });
    delete req.session.redirect_message;
});

router.post('/subs/:id/patch', auth.auth, auth.auth_admin, async function(req, res) {
    if (isNaN(parseInt(req.cat_id)) || isNaN(parseInt(req.params.id))) {
        res.status(404);
        return res.render('vwError/viewNotFound');
    }
    cat = await categoryModel.search_by_cat_name(req.body.category_name);
    if (cat[0][0] === undefined) {
        await categoryModel.patch_subcat(req.params.id, req.body.cat_name, req.body.parent_category_id);
        req.session.redirect_message = 'Chỉnh sửa thành công';
        res.redirect('/admin/categories/' + req.cat_id + '/subs');
    }
    else {
        req.session.redirect_message = 'Tên chuyên mục đã tồn tại. Vui lòng đặt tên khác!';
        res.redirect('/admin/categories/' + req.cat_id + '/subs/' + req.params.id);
    }
});

router.post('/subs/:id/del', auth.auth, auth.auth_admin, async function(req, res) {
    if (isNaN(parseInt(req.cat_id)) || isNaN(parseInt(req.params.id))) {
        res.status(404);
        return res.render('vwError/viewNotFound');
    }
    count = await categoryModel.count_articles_in_subcat(req.params.id);
    if (count[0][0].count === 0) {
        await categoryModel.delete(req.params.id);
        req.session.redirect_message = 'Xóa thành công';
    }
    else {
        req.session.redirect_message = 'Không thể xóa - Do đây là chuyên mục  - Cần xóa các bài báo thuộc về chuyên mục này trước';
        return res.redirect('/admin/categories/' + req.cat_id + '/subs/' + req.params.id);
    }
    res.redirect('/admin/categories/' + req.cat_id + '/subs');;
});

module.exports = router