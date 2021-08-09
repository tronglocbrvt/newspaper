const express = require('express');
const userModel = require('../models/user.model');
const categoryModel = require('../models/category.model');
const authenticate_model = require('../models/authenticate.model');
const router = express.Router();
const bcrypt = require('bcryptjs');
const N_HASHING_TIMES = 10;
const moment = require('moment');
const auth = require('../middlewares/auth.mdw');
const time_zone_converter = require("../middlewares/timezone.mdw");

// -- VIEW USER API --
router.get('/edit/:id', auth.auth, auth.auth_admin, async function (req, res) {
    if (isNaN(parseInt(req.params.id))) {
        res.status(404);
        return res.render('vwError/viewNotFound');
    }

    const user_id = parseInt(req.params.id);
    const user = await userModel.load_user_info_by_id(user_id);
    if (!user[0][0]) {
        return res.redirect('/admin/users');
    }
    const list = await categoryModel.get_main_cats();
    data = user[0][0];
    data.categories = list[0];
    if (data.is_editor) {
        var selected_categories = await userModel.get_selected_cats_by_user_id(user_id);
        data.selected_categories = selected_categories[0];
    }
    data.err_message = req.session.redirect_message;
    //console.log(data);
    data.time_premium = time_zone_converter.server_time_to_GMT_7(data.time_premium);
    res.render('vwAdmin/vwUser/vwEditUser', data);
    delete req.session.redirect_message;
});

// post patch
router.post('/patch/:id', auth.auth, auth.auth_admin, async function (req, res) {
    if (isNaN(parseInt(req.params.id))) {
        res.status(404);
        return res.render('vwError/viewNotFound');
    }

    const user_id = parseInt(req.params.id);
    const dob = moment(req.body.raw_date_of_birth, "DD/MM/YYYY").format("YYYY-MM-DD");
    const time_premium = time_zone_converter.GMT_7_to_server_time(moment(req.body.time_premium, "DD/MM/YYYY HH")).format("YYYY-MM-DD HH");

    const user = await userModel.load_user_info_by_id(user_id);
    if (!user[0][0]) {
        return res.redirect('/admin/users');
    }

    const old_user = user[0][0];

    const editted_user =
    {
        user_id: user_id,
        gender: req.body.gender,
        date_of_birth: dob,
        name: req.body.name,
        time_premium: time_premium,
        is_writer: (req.body.check_writer != undefined) ? 1 : 0,
        is_editor: (req.body.check_editor != undefined) ? 1 : 0,
    }

    console.log(editted_user);
    console.log(old_user);
    console.log(req.body);
    console.log("pre =" + req.body.check_premium);
    if (time_premium === 'Invalid date' || (req.body.check_premium == undefined))
        editted_user.time_premium = null;

    // Update table writer.
    if (!(editted_user.is_writer)) // Xóa 1 người viết.
    {
        const num_articles = await userModel.countNumArticles(user_id); // đếm số bài báo đã có của ng đó
        if (num_articles[0].length > 0 && num_articles[0][0].num) // đã có bài viết mà bị bắt xóa.
        {
            req.session.redirect_message = 'Không thể  điều chỉnh - Do người dùng là tác giả - Cần xóa các bài do người này viết trước.';
            return res.redirect('/admin/users/edit/' + user_id);
        }
        await userModel.deleteWriter(user_id);
        // Xóa
    }
    else {
        console.log("Co phai writer k : " + old_user.is_writer);
        if (old_user.is_writer) {
            // Edit Writer
            console.log(req.body.nick_name);
            console.log(typeof user_id);
            await userModel.editWriter(user_id, req.body.nick_name);
        }
        else {
            // Insert
            console.log("insert");
            await userModel.insertWriter(user_id, req.body.nick_name);
        }
    }

    // Update table editor.
    if (!editted_user.is_editor) {
        console.log("xoa editor");
        await userModel.deleteEditor(user_id);
    }
    else {
        console.log("Co phai editor k : " + old_user.is_editor);
        if (old_user.is_editor) {
            // Chinh sua
            await userModel.deleteEditorLinks(user_id);
        }
        else {
            await userModel.addEditor({ user_id: user_id });
        }
        list_categories = req.body.categories_selected
        // Add Category
        if (list_categories) {
            if (typeof list_categories === 'string') {
                await userModel.addCategoryForEditor(user_id, list_categories);
            }
            else {
                for (let i = 0; i < list_categories.length; ++i) {
                    console.log("abcd " + user_id + " " + list_categories[i]);
                    await userModel.addCategoryForEditor(user_id, list_categories[i]);
                }
            }
        }
    }
    // Update one table user.
    console.log(editted_user);
    await userModel.updateUser(editted_user);
    res.redirect('/admin/users/');
});


// Post Delete
router.post('/del/:id', auth.auth, auth.auth_admin, async function (req, res) {
    if (isNaN(parseInt(req.params.id))) {
        res.status(404);
        return res.render('vwError/viewNotFound');
    }

    const user_id = parseInt(req.params.id);

    const data = await userModel.load_user_info_by_id(user_id);
    // user khong hop le
    if (!data[0][0]) {
        return res.redirect('/admin/users');
    }

    const user = data[0][0];
    // Khi writer có bài viết thì không cho xóa.
    if (user.is_writer) {
        const num_articles = await userModel.countNumArticles(user.user_id);
        if (num_articles[0].length > 0 && num_articles[0][0].num) {
            req.session.redirect_message = 'Không thể xóa - Do người dùng là tác giả - Cần xóa các bài do người này viết trước.';
            return res.redirect('/admin/users/edit/' + user_id);
        }
    }
    console.log("Xóa hết đây các tình iu - Xóa lan sang comments, writers, editors, fb,google.");
    await userModel.deleteUser(user_id);
    res.redirect('/admin/users');
});



// -- ADD USER API --
router.get('/add', auth.auth, auth.auth_admin, async function (req, res) {
    const list = await categoryModel.get_main_cats();
    console.log(list[0]);
    res.render('vwAdmin/vwUser/vwAddUser', { categories: list[0] });
});

router.post('/add', auth.auth, auth.auth_admin, async function (req, res) {
    const hash = bcrypt.hashSync("admin", N_HASHING_TIMES); // Password is always admin
    const dob = moment(req.body.raw_date_of_birth, "DD/MM/YYYY").format("YYYY-MM-DD");
    const time_premium = time_zone_converter.GMT_7_to_server_time(moment(req.body.time_premium, "DD/MM/YYYY HH")).format("YYYY-MM-DD HH"); // GMT+7 to server time
    //console.log(req.body);
    const new_user =
    {
        user_name: req.body.username,
        gender: req.body.gender,
        password: hash,
        date_of_birth: dob,
        name: req.body.name,
        email: req.body.email,
        time_premium: time_premium,
        is_writer: (req.body.check_writer != undefined),
        is_editor: (req.body.check_editor != undefined),
        is_admin: 0,
        is_authenticated: 0,
    }


    console.log("pre =" + req.body.check_premium);
    if (time_premium === 'Invalid date' || (req.body.check_premium == undefined))
        new_user.time_premium = null;

    await authenticate_model.add_new_user(new_user);

    console.log(new_user);

    const user_data = await userModel.find_user_id_by_user_name(new_user.user_name);
    if (new_user.is_writer) {
        // add Writer
        await userModel.addWriter({ user_id: user_data[0].user_id, nick_name: req.body.nick_name || new_user.name });
    }

    if (new_user.is_editor) {
        list_categories = req.body.categories_selected;
        // Add Editor
        await userModel.addEditor({ user_id: user_data[0].user_id });

        // Add Category
        if (list_categories) {
            if (typeof list_categories === 'string') {
                await userModel.addCategoryForEditor(user_data[0].user_id, list_categories);
            }
            else {
                console.log(typeof list_categories);
                for (let i = 0; i < list_categories.length; ++i) {
                    await userModel.addCategoryForEditor(user_data[0].user_id, list_categories[i]);
                }
            }
            console.log(req.body.categories_selected);
        }
    }
    res.redirect("");
});


// VIEW ALL USER API
router.get('/:filter', auth.auth, auth.auth_admin, async function (req, res) 
{
    const limit = 20; // number of rows on 1 page
    // get current page, default 1
    var page = req.query.page || 1;
    if (page < 1) page = 1;

    // count articles by cat_id
    var total = null;
    switch (req.params.filter) {
        case "all":
            total = await userModel.countfilter(0, 0, 0);
            break;
        case "normal":
            total = await userModel.countfilterNot(0, 1, 1);
            break;
        case "premium":
            total = await userModel.countfilter(1, 0, 0);
            break;
        case "writer":
            total = await userModel.countfilter(0, 1, 0);
            break;
        case "editor":
            total = await userModel.countfilter(0, 0, 1);
            break;
        default:
            res.status(404);
            return res.render('vwError/viewNotFound');
    }

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

    // Filter
    var listAllUsers = null;
    switch (req.params.filter) {
        case "normal":
            listAllUsers = await userModel.filterNot(offset, 0, 1, 1);
            break;
        case "premium":
            listAllUsers = await userModel.filter(offset, 1, 0, 0);
            break;
        case "writer":
            listAllUsers = await userModel.filter(offset, 0, 1, 0);
            break;
        case "editor":
            listAllUsers = await userModel.filter(offset, 0, 0, 1);
            break;
        default:
            res.status(404);
            return res.render('vwError/viewNotFound');
    }

    // render
    res.render('vwAdmin/vwUser/vwShowAllUsers', {
        users: listAllUsers[0],
        page_numbers,
        n_pages,
        page_first: parseInt(page) === 1, // check first page 
        page_last: parseInt(page) === parseInt(n_pages), // check last page
    });
});


router.get('/', auth.auth, auth.auth_admin, async function (req, res) {
    const limit = 20; // number of rows on 1 page
    // get current page, default 1

    var page = req.query.page || 1;
    if (page < 1) page = 1;

    // count articles by cat_id
    const total = await userModel.countfilter(0, 0, 0);
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
    const listAllUsers = await userModel.filter(offset, 0, 0, 0);

    //console.log(listAllUsers[0][0]);
    res.render('vwAdmin/vwUser/vwShowAllUsers', {
        users: listAllUsers[0],
        page_numbers,
        n_pages,
        page_first: parseInt(page) === 1, // check first page 
        page_last: parseInt(page) === parseInt(n_pages), // check last page
    });
});



module.exports = router