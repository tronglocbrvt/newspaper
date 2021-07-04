const express = require('express');
const router = express.Router();
const multer = require('multer');
const category_model = require('../models/category.model')
const tag_model = require('../models/tag.model')
const path = require('path');
const articleModel = require('../models/article.model');

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
            var id = await articleModel.add(article);
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

module.exports = router