const express = require('express');
const router = express.Router();
const editor_model = require('../models/editor.model');
const category_model = require('../models/category.model');
const writer_model = require('../models/writer.model');
const auth = require('../middlewares/auth.mdw');
const tag_model = require("../models/tag.model");

router.get('/reviews', auth.auth, auth.auth_editor, async function (req, res) {
    //check if editor has been added to writers table
    var editor_id = await editor_model.get_editorid_by_userid(req.session.authUser.user_id);
    if (!editor_id[0][0]) {
        res.redirect('/');
        return;
    }
    editor_id = editor_id[0][0].editor_id;

    //get tab
    var cat_id = req.query.tab || 0;

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

    var editor_cats = await editor_model.get_categories_by_editor(editor_id);
    var articles = await editor_model.get_articles_by_editor_category(editor_id, +cat_id, limit, offset);

    res.render('vwEditors/view_articles', {
        articles: articles[0],
        categories: editor_cats[0],
        tab: +cat_id,
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
    res.render("vwEditors/view_article", {
        article: article[0][0],
        main_cats: main_cats[0]
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
    article['article_id'] = req.params.article_id || 0;

    if ('comment' in article) {
        //add to rejected_articles
        var article_reject = {};
        article_reject['article_id'] = article_id;
        article_reject['editor_comments'] = article['comment'];
        article_reject['rejected_time'] = new Date().toISOString().slice(0, 19).replace('T', ' ');

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

        await writer_model.patch_article(article);
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
        article_publish['time_published'] = formatDateTime(article['publish_time']);

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
            await tag_model.delete_tag(insert_tag);
        }
    }

    res.redirect(`/editors/reviews`);
});

function formatDateTime(date) {
    let dateComponents = date.split(' ');
    let datePieces = dateComponents[0].split("/");
    let timePieces = dateComponents[1].split(":");
    res = `${datePieces[2]}-${datePieces[1]}-${datePieces[0]} ${timePieces[0]}:${timePieces[1]}:00`;
    return res;
}

module.exports = router;