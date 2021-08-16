    const express = require('express');
    const admin_model = require('../models/admin.model');
    const writer_model = require('../models/writer.model');
    const category_model = require('../models/category.model');
    const tag_model = require('../models/tag.model');
    const editor_model = require('../models/editor.model');
    const article_model = require('../models/article.model');
    const auth = require('../middlewares/auth.mdw');
    const time_zone_converter = require("../middlewares/timezone.mdw");
    const moment = require('moment');

    const router = express.Router();

    router.get('/', auth.auth, auth.auth_admin, async function (req, res) {
        //get queries
        const page = req.query.page || 1;
        if (page < 1) page = 1;
        const tab = req.query.tab || 0;
        const writer_id = req.query.writer || 0;
        const main_cat = req.query.main_cat || 0;
        const sub_cat = req.query.sub_cat || 0;
        const tag_id = req.query.tag || 0;
        var sub_cats = [[]];

        // number of articles on 1 page
        const limit = 10;

        const total = await admin_model.get_articles_by_filter(10, 0, +tab, +writer_id, +main_cat, +sub_cat, +tag_id, true);
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
            else if (+page >= n_pages - 1 && i >= n_pages - limit_page) {
                page_numbers[i].hide = false;
            }
            else if (+page - 3 <= i && i < +page + 2) {
                page_numbers[i].hide = false;
            }
        }

        // set offset that pass to query in database
        const offset = (page - 1) * limit;

        //get articles tab by tab and push to all articles
        var articles = await admin_model.get_articles_by_filter(limit, offset, +tab, +writer_id, +main_cat, +sub_cat, +tag_id);

        //get filter data
        const main_cats = await category_model.get_main_cats();
        const tags = await tag_model.get_tags_ordered();
        const writers = await writer_model.get_writers();
        if(+main_cat !== 0)
            sub_cats = await category_model.get_sub_cats_by_cat_id(main_cat);

        res.render('vwAdmin/vwArticle/view_articles.hbs', {
            types: ['Đã xuất bản', 'Chờ xuất bản', 'Chờ xét duyệt', 'Bản nháp', 'Từ chối'],
            articles: articles[0],
            //pagination
            page_numbers,
            page_first: parseInt(page) === 1,
            page_last: parseInt(page) === parseInt(n_pages),
            n_pages: n_pages,
            is_empty: articles[0].length === 0,
            is_show_pagination: n_pages > 0,
            //tab
            tab: +tab,
            //filters
            main_cats: main_cats[0],
            tags: tags[0],
            writers: writers[0],
            writer_filter: +writer_id,
            tag_filter: +tag_id,
            main_cat_filter: +main_cat,
            sub_cat_filter: +sub_cat,
            sub_cats: sub_cats[0],
            //if is_submitted, publish button for admin
            is_publishable: +tab === 2
        })
    })

    router.get('/view/:article_id', auth.auth, auth.auth_admin, async function (req, res) {
        const article_id = req.params.article_id || 0;

        if (isNaN(parseInt(article_id))) {
            res.status(404);
            res.render('vwError/viewNotFound');
            return;
        }

        const article = await writer_model.load_article_by_id(article_id);
        var is_rejected = false, comment;
        if (article[0][0].is_rejected) {
            comment = await writer_model.get_rejected_comment(article_id);
            comment = comment[0][0].editor_comments;
            is_rejected = true;
        }
        
        const parent_cat = await category_model.get_name_by_cat_id(article[0][0].category_id);
        const sub_cat = await category_model.get_name_by_id(article[0][0].category_id);
        const tags = await tag_model.get_names_by_art_id(article_id);
        res.render("vwWriters/view_article", {
            article: article[0][0],
            is_rejected: is_rejected,
            comment: comment,
            parent_cat: parent_cat[0][0],
            sub_cat: sub_cat[0][0],
            tags: tags[0]
        })
    })

    router.get('/delete/:article_id', auth.auth, auth.auth_admin, async function(req, res){
        const article_id = req.params.article_id || 0;
        if (isNaN(parseInt(article_id))) {
            res.status(404);
            res.render('vwError/viewNotFound');
            return;
        }
        const tab = req.query.tab || 0;
        await article_model.delete(article_id);
        res.redirect(`/admin/articles?tab=${tab}`);
    })

    router.get('/publish/:article_id', auth.auth, auth.auth_admin, async function (req, res) {
        const article_id = req.params.article_id || 0;
        if (isNaN(parseInt(article_id))) {
            res.status(404);
            res.render('vwError/viewNotFound');
            return;
        }

        const article = await writer_model.load_article_by_id(article_id);
        const main_cats = await category_model.get_main_cats();
        const parent_cat = await category_model.get_name_by_cat_id(article[0][0].category_id);
        const sub_cat = await category_model.get_name_by_id(article[0][0].category_id);
        const tags = await tag_model.get_names_by_art_id(article[0][0].article_id);

        res.render("vwAdmin/vwArticle/publish_article", {
            article: article[0][0],
            main_cats: main_cats[0],
            parent_cat: parent_cat[0][0],
            sub_cat: sub_cat[0][0],
            tags: tags[0]
        })
    })

    router.post('/publish/:article_id', auth.auth, auth.auth_admin, async function (req, res) {
        const article_id = req.params.article_id;
        if (isNaN(parseInt(article_id))) {
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
        console.log(tags);
        console.log('orginal_Tags' + original_tags);

        //article_id
        article['article_id'] = req.params.article_id || 0;

        //set state
        article['is_published'] = true;
        article['is_draft'] = false;
        article['is_rejected'] = false;
        article['is_submitted'] = false;

        //delete rejected article if any
        await writer_model.delete_rejected_article(article['article_id']);

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

        res.redirect(`/admin/articles`);
    })

    module.exports = router;