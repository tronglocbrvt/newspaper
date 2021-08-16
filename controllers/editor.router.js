const express = require('express');
const router = express.Router();
const editor_model = require('../models/editor.model');
const category_model = require('../models/category.model');
const writer_model = require('../models/writer.model');
const article_model = require('../models/article.model');
const auth = require('../middlewares/auth.mdw');
const tag_model = require("../models/tag.model");
const time_zone_converter = require("../middlewares/timezone.mdw");
const moment = require('moment');

router.get('/reviews', auth.auth, auth.auth_editor, async function (req, res) {
    //check if editor has been added to writers table
    var editor_id = await editor_model.get_editorid_by_userid(req.session.authUser.user_id);
    if (!editor_id[0][0]) {
        res.redirect('/');
        return;
    }
    editor_id = editor_id[0][0].editor_id;

    //get tab
    var tab = req.query.tab || 0;

    var editor_cats = await editor_model.get_categories_by_editor(editor_id);
    if (editor_cats[0].length === 0) {
        res.redirect('/');
        return;
    }

    var cat_id = editor_cats[0][+tab].category_id;

    var if_belong = await editor_model.if_category_belong_editor(editor_id, +cat_id);
    if (!if_belong[0][0]) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }

    //get page
    const page = req.query.page || 1;
    if (page < 1) page = 1;

    // number of articles on 1 page
    const limit = 10;

    const total = await editor_model.get_articles_by_editor_category(editor_id, +cat_id, 0, 0, true);
    let n_pages = Math.ceil(total[0].length / limit); // total page

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

    var articles = await editor_model.get_articles_by_editor_category(editor_id, +cat_id, limit, offset);

    res.render('vwEditors/view_articles', {
        articles: articles[0],
        categories: editor_cats[0],
        tab: +tab,
        is_empty: articles[0].length === 0,
        //pagination
        page_numbers,
        page_first: parseInt(page) === 1,
        page_last: parseInt(page) === parseInt(n_pages),
        next_page: parseInt(page) + 1,
        previous_page: parseInt(page) - 1,
        n_pages: n_pages,
        is_empty: articles[0].length === 0,
        is_show_pagination: n_pages > 0,
    })
});

router.get('/review/:article_id', auth.auth, auth.auth_editor, async function (req, res) {
    //check if editor has been added to writers table
    var editor_id = await editor_model.get_editorid_by_userid(req.session.authUser.user_id);
    if (!editor_id[0][0]) {
        res.redirect('/');
        return;
    }
    editor_id = editor_id[0][0].editor_id;

    //check if article param is numerical
    const article_id = req.params.article_id || 0;
    if (isNaN(parseInt(article_id))) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }

    //check if article belongs to editor category
    const if_exist = await editor_model.if_article_belong_editor(editor_id, article_id);
    if (!if_exist[0][0]) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }

    const article = await writer_model.load_article_by_id(article_id);
    const main_cats = await category_model.get_main_cats();
    const parent_cat = await category_model.get_name_by_cat_id(article[0][0].category_id);
    const sub_cat = await category_model.get_name_by_id(article[0][0].category_id);
    const tags = await tag_model.get_names_by_art_id(article_id);

    res.render("vwEditors/view_article", {
        article: article[0][0],
        main_cats: main_cats[0],
        parent_cat: parent_cat[0][0],
        sub_cat: sub_cat[0][0],
        tags: tags[0]
    })
});

router.post('/review/:article_id', auth.auth, auth.auth_editor, async function (req, res) {
    //check if editor has been added to writers table
    var editor_id = await editor_model.get_editorid_by_userid(req.session.authUser.user_id);
    if (!editor_id[0][0]) {
        res.redirect('/');
        return;
    }
    editor_id = editor_id[0][0].editor_id;

    //check if article param is numerical
    const article_id = req.params.article_id || 0;
    if (isNaN(parseInt(article_id))) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }

    //check if article belongs to editor category
    const if_exist = await editor_model.if_article_belong_editor(editor_id, article_id);
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

    if ('comment' in article) {
        //add to rejected_articles
        var article_reject = {};
        article_reject['editor_comments'] = article['comment'];
        article_reject['rejected_time'] = new Date().toISOString().slice(0, 19).replace('T', ' ');
        article_reject['editor_id'] = editor_id;

        //add comment of original article to rejected table
        article_reject['article_id'] = article_id;
        await editor_model.add_reject_article(article_reject);

        //update article
        article['is_rejected'] = true;
        article['is_submitted'] = false;

        delete article['comment'];
        delete article['main_cat_reset'];
        delete article['sub_cat_reset'];
        if ('publish_time' in article) {
            delete article['publish_time'];
        }

        //update status to article
        await writer_model.patch_article(article);

        // //clone original article to keep a version for editor to trace back
        // clone_art = await writer_model.load_article_by_id(article_id);
        // delete clone_art[0][0]['article_id'];
        // var ret = await article_model.add(clone_art[0][0]);

        // //add comment of original article to rejected table
        // article_reject['article_id'] = ret[0];
        // await editor_model.add_reject_article(article_reject);
    } else {
        //set state
        article['is_published'] = true;
        article['is_submitted'] = false;

        //category_id
        const sub_category_id = +article['sub_cat_reset'];
        if (sub_category_id !== 0) {
            article['category_id'] = sub_category_id;
        } else {
            article['category_id'] = +article['main_cat_reset'];
        }

        //add to rejected_articles
        var article_publish = {};
        article_publish['article_id'] = article_id;
        article_publish['time_published'] = time_zone_converter.GMT_7_to_server_time(moment(article['publish_time'], "DD/MM/YYYY HH")).format("YYYY-MM-DD HH");
        article_publish['views_numbers'] = 0;
        article_publish['editor_id'] =  editor_id;
        await editor_model.add_publish_article(article_publish);

        //delete uneccessary fields
        delete article['main_cat_reset'];
        delete article['sub_cat_reset'];
        delete article['publish_time'];
        if ('comment' in article) {
            delete article['comment'];
        }

        //update article
        await writer_model.patch_article(article);

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

        var insert_tag = { 'article_id': article_id };
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
            await tag_model.delete_tag_article_link(insert_tag);
        }
    }

    res.redirect(`/editors/reviews`);
});

router.get('/dashboard', auth.auth, auth.auth_editor, async function(req, res) {
    res.render('vwEditors/dashboard');
});

module.exports = router;