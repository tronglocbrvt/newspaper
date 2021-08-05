const express = require('express');
const router = express.Router();
const editor_model = require('../models/editor.model');
const category_model = require('../models/category.model');
const writer_model = require('../models/writer.model');
const tag_model = require("../models/tag.model");

router.get('/:editor_id/reviews', async function (req, res) {
    const editor_id = req.params.editor_id;

    if (isNaN(parseInt(editor_id))) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }
    const if_exist = await editor_model.if_exist(editor_id);
    if (!if_exist[0][0]) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }

    var editor_cats = await editor_model.get_categories_by_editor(editor_id);
    editor_cats = editor_cats[0];
    var categories = [], articles_all = [];
    for (i = 0; i < editor_cats.length; i++) {
        editor_cat = editor_cats[i];
        var category_name = await category_model.get_name_by_id(editor_cat.category_id);
        var article = await editor_model.get_articles_by_editor_category(editor_id, editor_cat.category_id);
        articles_all.push(article[0]);
        categories.push(category_name[0][0]);
    }

    res.render('vwEditors/view_articles', {
        editor_id: editor_id,
        articles_all: articles_all,
        categories: categories
    })
});

router.get('/:editor_id/review/:article_id', async function (req, res) {
    const article_id = req.params.article_id || 0;
    const editor_id = req.params.editor_id;
    if (isNaN(parseInt(editor_id)) || isNaN(parseInt(article_id))) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }
    const if_exist = await editor_model.if_article_belong_editor(editor_id, article_id);
    if (if_exist[0][0]) {
        const article = await writer_model.load_article_by_id(article_id);
        const main_cats = await category_model.get_main_cats();
        res.render("vwEditors/view_article", {
            article: article[0][0],
            main_cats: main_cats[0]
        })
    }
    else {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }
});

router.post('/:editor_id/review/:article_id', async function (req, res) {
    const editor_id = req.params.editor_id;
    const article_id = req.params.article_id;
    if (isNaN(parseInt(editor_id)) || isNaN(parseInt(article_id))) {
        res.status(404);
        res.render('vwError/viewNotFound');
        return;
    }
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

    res.redirect(`/editors/${editor_id}/reviews`);
});

function formatDateTime(date) {
    let dateComponents = date.split(' ');
    let datePieces = dateComponents[0].split("/");
    let timePieces = dateComponents[1].split(":");
    res = `${datePieces[2]}-${datePieces[1]}-${datePieces[0]} ${timePieces[0]}:${timePieces[1]}:00`;
    return res;
}

module.exports = router;