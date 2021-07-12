const express = require('express');
const router = express.Router();
const multer = require('multer');
const category_model = require('../models/category.model')
const tag_model = require('../models/tag.model')
const path = require('path');
const article_model = require('../models/article.model');
const writer_model = require('../models/writer.model');

router.get('/add', async function (req, res) {
    const main_cats = await category_model.get_main_cats();
    const tags = await tag_model.get_tags();
    res.render('vwWriters/add', {
        main_cats: main_cats[0],
        tags: tags[0]
    });
})


router.post('/add', function (req, res) {
    const storage = multer.diskStorage({
        destination(req, file, cb) {
            cb(null, './static/images')
        },
        filename(req, file, cb) {
            var name = Date.now() + path.extname(file.originalname)
            cb(null, name);
        }
    });
    const upload = multer({
        storage
    });

    upload.single('avatar')(req, res, async function (err) {
        if (err) {
            console.log(err);
        } else {
            var article = req.body;
            var tags = req.body.tags;
            const sub_category_id = +article['sub_category'];
            if (sub_category_id !== 0) {
                article['category_id'] = sub_category_id;
            } else {
                article['category_id'] = +article['category_id'];
            }
            delete article['sub_category'];
            delete article['tags'];
            article['avatar_url'] = '/static/images/' + req.file.filename;
            if ('is_premium' in article) {
                article['is_premium'] = 1;
            } else {
                article['is_premium'] = 0;
            }
            article['writer_id'] = 1;
            var id = await article_model.add(article);
            id = id[0];

            tags = tags.split(',');
            var all_tags = await tag_model.get_tags();
            all_tags = all_tags[0];
            
            var all_tag_names = [];
            all_tags.map(function (tag) {
                all_tag_names.push(tag.tag_name);
            });
            var insert_tag = { 'article_id': id };
            for (let i = 0; i < tags.length; i++) {
                var tag_id = all_tag_names.indexOf(tags[i]) + 1;
                insert_tag['tag_id'] = tag_id;
                var rs = await tag_model.add_tag(insert_tag);
            }

            res.redirect('/writers/add');
        }
    })
})

router.get('/:writer_id/articles', async function(req, res){
    const id = req.params.writer_id || 0;
    const articles = await writer_model.get_articles_by_id(id, 0);
    res.render("vwWriters/view_article", {
        articles: articles[0]
    });
})

router.get('/:writer_id/articles/:article_id', async function(req, res){
    const article_id = req.params.article_id || 0;
    const article = await writer_model.load_article_by_id(article_id);
    const main_cats = await category_model.get_main_cats();
    const tags = await tag_model.get_tags();
    res.render("vwWriters/edit_article", {
        article: article[0][0],
        main_cats: main_cats[0],
        tags: tags[0]
    })
})

router.post('/:writer_id/articles/:article_id', async function(req, res){
    const storage = multer.diskStorage({
        destination(req, file, cb) {
            cb(null, './static/images')
        },
        filename(req, file, cb) {
            var name = Date.now() + path.extname(file.originalname)
            cb(null, name);
        }
    });
    
    const upload = multer({
        storage
    });

    upload.single('avatar')(req, res, async function (err) {
        if (err) {
            console.log(err);
        } else {
            var article = req.body;
            var tags = req.body.tags;
            const sub_category_id = +article['sub_category'];
            if (sub_category_id !== 0) {
                article['category_id'] = sub_category_id;
            } else {
                article['category_id'] = +article['category_id'];
            }
            delete article['sub_category'];
            delete article['tags'];
            article['avatar_url'] = '/static/images/' + req.file.filename;
            if ('is_premium' in article) {
                article['is_premium'] = 1;
            } else {
                article['is_premium'] = 0;
            }
            article['writer_id'] = 1;
            var id = await article_model.add(article);
            id = id[0];

            tags = tags.split(',');
            var all_tags = await tag_model.get_tags();
            all_tags = all_tags[0];
            
            var all_tag_names = [];
            all_tags.map(function (tag) {
                all_tag_names.push(tag.tag_name);
            });
            var insert_tag = { 'article_id': id };
            for (let i = 0; i < tags.length; i++) {
                var tag_id = all_tag_names.indexOf(tags[i]) + 1;
                insert_tag['tag_id'] = tag_id;
                var rs = await tag_model.add_tag(insert_tag);
            }

            res.redirect('/writers/add');
        }
    })
})

router.get('/get_content_cat_tag/:article_id', async function(req, res){
    const content_cat = await writer_model.get_content_cat(req.params.article_id || 0);
    const tags = await tag_model.get_tags_by_id(req.params.article_id || 0);
    var cat_id = content_cat[0][0].category_id;
    main_cat, sub_cat = await get_main_sub_cat(cat_id);

    res.json({
        article_content: content_cat[0][0].article_content,
        main_category: main_cat,
        sub_category: sub_cat,
        tags: tags[0]
    });
})

async function get_main_sub_cat(category_id){
    var parent_cat_id = await category_model.get_parent_cat_by_id(category_id);
    parent_cat_id = parent_cat_id[0][0]
    
    if(parent_cat_id.parent_category_id === null){
        main_cat = category_id;
        sub_cat = 0;
    } else {
        main_cat = parent_cat_id.parent_category_id;
        sub_cat = category_id;
    }

    return main_cat, sub_cat;
}

module.exports = router