const express = require('express');
const userModel = require('../models/user.model');
const categoryModel = require('../models/category.model');
const authenticate_model = require('../models/authenticate.model');
const router = express.Router();
const bcrypt = require('bcryptjs');
const N_HASHING_TIMES = 10;
const moment = require('moment');


// VIEW ALL USER API
router.get('/', async function (req, res) {
    const limit = 20; // number of rows on 1 page
    // get current page, default 1

    const page = req.query.page || 1;
    if (page < 1) page = 1;

    // count articles by cat_id
    const total = await userModel.count_users();
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
    const listAllUsers = await userModel.all(offset);

    //console.log(listAllUsers[0][0]);
    res.render('vwAdmin/vwUser/vwShowAllUsers', {
        users: listAllUsers[0],
        page_numbers,
        n_pages,
        page_first: parseInt(page) === 1, // check first page 
        page_last: parseInt(page) === parseInt(n_pages), // check last page
        next_page: parseInt(page) + 1,
        previous_page: parseInt(page) - 1,
    });
});



// -- VIEW USER API --
router.get('/edit/:id', async function (req, res) {
    const user_id = req.params.id;
    const user = await userModel.load_user_info_by_id(user_id);
    if (!user[0][0]) {
        return res.redirect('/admin/users');
    }
    const list = await categoryModel.get_main_cats();
    data = user[0][0];
    data.categories = list[0];
    if (data.is_editor)
    {
        var selected_categories = await userModel.get_selected_cats_by_user_id(user_id);
        data.selected_categories = selected_categories[0];
    }
    data.err_message = req.session.redirect_message;
    //console.log(data);
    res.render('vwAdmin/vwUser/vwEditUser',data);
    delete req.session.redirect_message;
});

// post patch
router.post('/patch/:id', async function (req, res) {
    const user_id = req.params.id;
    const dob = moment(req.body.raw_date_of_birth, "DD/MM/YYYY").format("YYYY-MM-DD");
    const time_premium = moment(req.body.time_premium, "DD/MM/YYYY HH").format("YYYY-MM-DD HH");
    const editted_user =
    {
        user_id = user_id,
        gender: req.body.gender,
        date_of_birth: dob,
        name: req.body.name,
        time_premium: time_premium,
        is_writer: (req.body.check_writer != undefined),
        is_editor: (req.body.check_editor != undefined),
    }
    if (time_premium === 'Invalid date')
        delete editted_user.time_premium;

    // Update one table user.

    await userModel.updateUser(editted_user);

    // Update table writer.

    // Update table editor.
    res.redirect('/admin/users/');
});


// Post Delete
router.post('/del/:id', async function (req, res) {
    const user_id = req.params.id;

    const data = await userModel.load_user_info_by_id(user_id);
    // user khong hop le
    if (!data[0][0]) {
        return res.redirect('/admin/users');
    }

    const user = data[0][0];
    // Khi writer có bài viết thì không cho xóa.
    if (user.is_writer)
    {
        const num_articles = await userModel.countNumArticles(user.user_id);
        console.log(num_articles[0][0].num);
        if (num_articles[0][0].num)
        {
            req.session.redirect_message = 'Không thể xóa - Do người dùng là tác giả - Cần xóa các bài do người này viết trước.';
            return res.redirect('/admin/users/edit/' + user_id);   
        }
    }
    console.log("Xóa hết đây các tình iu - Xóa lan sang comments, writers, editors, fb,google.");
    //await userModel.deleteUser(user_id);
    res.redirect('/admin/users');
});



// -- ADD USER API --
router.get('/add', async function (req, res) {
    const list = await categoryModel.get_main_cats();
    //console.log(list[0]);
    res.render('vwAdmin/vwUser/vwAddUser', { categories: list[0] });
});

router.post('/add', async function (req, res) {
    const hash = bcrypt.hashSync("admin", N_HASHING_TIMES); // Password is always admin
    const dob = moment(req.body.raw_date_of_birth, "DD/MM/YYYY").format("YYYY-MM-DD");
    const time_premium = moment(req.body.time_premium, "DD/MM/YYYY HH").format("YYYY-MM-DD HH");
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


    if (time_premium === 'Invalid date')
        delete new_user.time_premium;

    await authenticate_model.add_new_user(new_user);
    
    console.log(new_user);

    const user_data = await userModel.find_user_id_by_user_name(new_user.user_name);
    if (new_user.is_writer)
    {
        // add Writer
        await userModel.addWriter({user_id:user_data[0].user_id,nick_name: req.body.nick_name || new_user.name});
    }

    if (new_user.is_editor) {
        list_categories = req.body.categories_selected;
        // Add Editor
        await userModel.addEditor({user_id:user_data[0].user_id});

        // Add Category
        if (list_categories) 
        {
            if (typeof list_categories === 'string')
            {
                await userModel.addCategoryForEditor(user_data[0].user_id,list_categories);
            }
            else
            {
                console.log(typeof list_categories);
                for (let i = 0;i<list_categories.length;++i)
                {
                    await userModel.addCategoryForEditor(user_data[0].user_id,list_categories[i]);
                }
            }
            console.log(req.body.categories_selected);
        }
    }
    res.redirect("");
});


module.exports = router