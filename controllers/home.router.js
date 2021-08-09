const express = require('express');
const router = express.Router();
const article_model = require('../models/article.model');
const category_model = require('../models/category.model');

router.get('/', async function(req, res){
    const hot_news = await article_model.hot_news();
    const latest_news = await article_model.latest_news();
    const most_news = await article_model.most_news();
    var hot_categories = await category_model.get_hot_categories();
    var hot_cat_articles = [];
    for(i = 0; i < hot_categories[0].length; i++){
        var get_art = await article_model.get_latest_art_of_category(hot_categories[0][i].parent_category_id);
        hot_cat_articles.push(get_art[0][0])
    }

    res.render('home', {
        hot_news: hot_news[0],
        latest_news: latest_news[0],
        most_news: most_news[0],
        hot_categories: hot_cat_articles
    })
})

module.exports = router