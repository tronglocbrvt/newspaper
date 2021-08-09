const express = require('express');
const router = express.Router();
const category_model = require('../models/category.model')
const tag_model = require('../models/tag.model')
const path = require('path');
const auth = require('../middlewares/auth.mdw');
const article_model = require('../models/article.model');
const writer_model = require('../models/writer.model');

router.get('/:writer_id/add', auth.auth, auth.auth_writer, async function (req, res) {
    const writer_id = req.params.writer_id;
    if (isNaN(parseInt(writer_id))) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }
    if (+writer_id !== req.session.authUser.user_id) {
        return res.redirect('/writers/'+req.session.authUser.user_id+'/add');
    }

    const main_cats = await category_model.get_main_cats();
    const tags = await tag_model.get_tags();

    const if_exist = await writer_model.is_exist(writer_id);
    if (if_exist[0][0]) {
        res.render('vwWriters/add', {
            main_cats: main_cats[0],
            tags: tags[0],
            writer_id: writer_id
        });
    }
    else {
        res.status(404);
        res.render('vwError/viewNotFound');
    }
})

router.post('/:writer_id/add', auth.auth, auth.auth_writer, async function (req, res) {
    const writer_id = req.params.writer_id;
    if (isNaN(parseInt(writer_id))) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }
    const file = req.files.avatar;
    const savePath = Date.now() + '.png';
    await file.mv('./static/images/' + savePath);

    var article = req.body;
    var tags = req.body.tags;
    delete article['tags'];

    //category
    const sub_category_id = +article['sub_category'];
    if (sub_category_id !== 0) {
        article['category_id'] = sub_category_id;
    } else {
        article['category_id'] = +article['category_id'];
    }
    delete article['sub_category'];

    //is_premium
    if ('is_premium' in article) {
        article['is_premium'] = 1;
    } else {
        article['is_premium'] = 0;
    }

    //avatar_url
    var avatar_url = '/static/images/' + savePath;
    article['avatar_url'] = avatar_url;

    //set is_draft to true
    if (article['action'] === 'submit') {
        article['is_submitted'] = true;
    } else {
        article['is_draft'] = true;
    }
    delete article['action']


    //add article and get returned article_id
    article['writer_id'] = writer_id;
    var id = await article_model.add(article);
    id = id[0];

    if (tags !== "") {
        //split tags from string
        tags = tags.split(',');
        var all_tags = await tag_model.get_tags();
        all_tags = all_tags[0];

        //get all tags from database
        var all_tag_names = [];
        all_tags.map(function (tag) {
            all_tag_names.push(tag.tag_name);
        });

        //insert each tag to tag_link table
        var insert_tag = { 'article_id': id };
        for (let i = 0; i < tags.length; i++) {
            var tag_id = all_tag_names.indexOf(tags[i]) + 1;
            insert_tag['tag_id'] = tag_id;
            await tag_model.add_tag(insert_tag);
        }
    }
    res.redirect('/writers/' + writer_id + '/articles');
})

router.get('/:writer_id/articles', auth.auth, auth.auth_writer, async function (req, res) {
    const id = req.params.writer_id || 0;
    if (isNaN(id)) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }
    if (+id !== req.session.authUser.user_id) {
        return res.redirect('/writers/'+req.session.authUser.user_id+'/articles');
    }
    const if_exist = await writer_model.is_exist(id);
    if (!if_exist[0][0]) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }

    const total = await writer_model.get_count_articles(id);
    // number of articels on 1 page
    const limit = 10;

    // get current page, default 1
    const page = req.query.page || 1;
    if (page < 1) page = 1;
    let n_pages = Math.ceil(total[0][0].total / limit);

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
    const articles = await writer_model.get_articles_by_id(id, offset, limit)
    res.render("vwWriters/view_articles", {
        articles: articles[0],
        page_numbers,
        n_pages,
        page_first: parseInt(page) === 1,
        page_last: parseInt(page) === parseInt(n_pages),
        next_page: parseInt(page) + 1 ,
        previous_page: parseInt(page) - 1,
    });
})

router.get('/:writer_id/edit/:article_id', auth.auth, auth.auth_writer, async function (req, res) {
    const article_id = req.params.article_id || 0;
    const writer_id = req.params.writer_id;

    if (isNaN(parseInt(writer_id)) || isNaN(parseInt(article_id))) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }
    if (+writer_id !== req.session.authUser.user_id) {
        return res.redirect('/writers/'+req.session.authUser.user_id+'/edit/' + article_id);
    }
    const if_exist = await writer_model.if_article_belong_writer(writer_id, article_id);
    if (!if_exist[0][0]) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }

    const article = await writer_model.load_article_by_id(article_id);
    const main_cats = await category_model.get_main_cats();
    const tags = await tag_model.get_tags();
    var is_rejected = false, comment;
    if (article[0][0].is_rejected) {
        comment = await writer_model.get_rejected_comment(article_id);
        comment = comment[0][0].editor_comments;
        is_rejected = true;
    }
    res.render("vwWriters/edit_article", {
        article: article[0][0],
        main_cats: main_cats[0],
        tags: tags[0],
        is_rejected: is_rejected,
        comment: comment
    })
})

router.post('/:writer_id/edit/:article_id', auth.auth, auth.auth_writer, async function (req, res) {
    const article_id = req.params.article_id;
    const writer_id = req.params.writer_id;

    if (isNaN(parseInt(writer_id)) || isNaN(parseInt(article_id))) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }
    const if_exist = await writer_model.if_article_belong_writer(writer_id, article_id);
    if (!if_exist[0][0]) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }

    var article = req.body;

    //get tag and delete from body
    var tags = req.body.tags;
    var original_tags = req.body.original_tags;
    delete article['tags'];
    delete article['original_tags'];

    //article_id
    article['article_id'] = article_id;

    //category_id
    const sub_category_id = +article['sub_category'];
    if (sub_category_id !== 0) {
        article['category_id'] = sub_category_id;
    } else {
        article['category_id'] = +article['category_id'];
    }
    delete article['sub_category'];

    //avatar_url if updated
    if (req.files !== null && 'avatar' in req.files) {
        const file = req.files.avatar;
        const savePath = Date.now() + '.png';
        await file.mv('./static/images/' + savePath);
        article['avatar_url'] = '/static/images/' + savePath;
    }

    //is_premium
    if ('is_premium' in article) {
        article['is_premium'] = 1;
    } else {
        article['is_premium'] = 0;
    }

    //delete rejected article if any
    await writer_model.delete_rejected_article(article['article_id']);
    article['is_rejected'] = false;

    //set is_draft to true
    if (article['action'] === 'submit') {
        article['is_submitted'] = true;
        article['is_draft'] = false;
    } else {
        article['is_draft'] = true;
    }
    delete article['action']

    //call model to process
    await writer_model.patch_article(article);
    var id = req.params.article_id || 0;

    //process tags
    original_tags = original_tags.split(',');
    tags = tags.split(',');

    //get all tag names
    var all_tags = await tag_model.get_tags();
    all_tags = all_tags[0];

    var all_tag_names = [];
    all_tags.map(function (tag) {
        all_tag_names.push(tag.tag_name);
    });

    //add tags
    var add_tags = [];
    for (let i = 0; i < tags.length; i++) {
        if (original_tags.indexOf(tags[i]) === -1)
            add_tags.push(tags[i]);
    }

    var insert_tag = { 'article_id': id };
    for (let i = 0; i < add_tags.length; i++) {
        var tag_id = all_tag_names.indexOf(add_tags[i]) + 1;
        insert_tag['tag_id'] = tag_id;
        await tag_model.add_tag(insert_tag);
    }

    //delete tags
    var delete_tags = [];
    for (let i = 0; i < original_tags.length; i++) {
        if (tags.indexOf(original_tags[i]) === -1)
            delete_tags.push(original_tags[i]);
    }

    for (let i = 0; i < delete_tags.length; i++) {
        var tag_id = all_tag_names.indexOf(delete_tags[i]) + 1;
        insert_tag['tag_id'] = tag_id;
        await tag_model.delete_tag(insert_tag);
    }

    res.redirect('/writers/' + writer_id + '/articles');
})

router.get('/get_content_cat_tag/:article_id', auth.auth, auth.auth_writer, async function (req, res) {
    const article_id = req.params.article_id;

    if (isNaN(parseInt(article_id))) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }
    const content_cat = await writer_model.get_content_cat(req.params.article_id || 0);
    const tags = await tag_model.get_tags_by_id(req.params.article_id || 0);
    var cat_id = content_cat[0][0].category_id;
    var get_cats = await get_main_sub_cat(cat_id);

    res.json({
        article_content: content_cat[0][0].article_content,
        main_category: get_cats.main_cat,
        main_category_name: get_cats.main_cat_name,
        sub_category: get_cats.sub_cat,
        sub_category_name: get_cats.sub_cat_name,
        tags: tags[0]
    });
})

async function get_main_sub_cat(category_id) {
    var parent_cat_id = await category_model.get_parent_cat_by_id(category_id);
    parent_cat_id = parent_cat_id[0][0];
    var main_cat_name = "hello";
    var sub_cat_name = "Hola";
    var main_cat, sub_cat;

    if (parent_cat_id.parent_category_id === null) {
        main_cat = category_id;
        sub_cat = 0;
        sub_cat_name = '--------------';
    } else {
        main_cat = parent_cat_id.parent_category_id;
        sub_cat = category_id;
        var get_name = await category_model.get_name_by_id(sub_cat);
        sub_cat_name = get_name[0][0].category_name;
    }

    var get_name2 = await category_model.get_name_by_id(main_cat);
    main_cat_name = get_name2[0][0].category_name;

    return {
        main_cat: main_cat,
        main_cat_name: main_cat_name,
        sub_cat: sub_cat,
        sub_cat_name: sub_cat_name
    };
}

router.get('/:writer_id/submitted/:article_id', auth.auth, auth.auth_writer, async function (req, res) {
    const article_id = req.params.article_id || 0;
    const writer_id = req.params.writer_id;
    const article = await writer_model.load_article_by_id(article_id);
    if (isNaN(parseInt(writer_id)) || isNaN(parseInt(article_id))) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }
    if (+writer_id !== req.session.authUser.user_id) {
        return res.redirect('/writers/'+req.session.authUser.user_id+'/submitted/' + article_id);
    }
    const if_exist = await writer_model.if_article_belong_writer(writer_id, article_id);
    if (!if_exist[0][0]) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }
    res.render("vwWriters/view_article", {
        article: article[0][0]
    })
})

router.get('/:writer_id/published/:article_id', auth.auth, auth.auth_writer, async function (req, res) {
    const article_id = req.params.article_id || 0;
    const writer_id = req.params.writer_id;
    
    if (isNaN(parseInt(writer_id)) || isNaN(parseInt(article_id))) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }
    if (+writer_id !== req.session.authUser.user_id) {
        return res.redirect('/writers/'+req.session.authUser.user_id+'/published/' + article_id);
    }
    const if_exist = await writer_model.if_article_belong_writer(writer_id, article_id);
    if (!if_exist[0][0]) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }

    const article = await writer_model.load_article_by_id(article_id);
    
    res.render("vwWriters/view_article", {
        article: article[0][0]
    })
})

module.exports = router