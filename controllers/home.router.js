const express = require('express');
const { most_news, hot_categories } = require('../models/article.model');
const router = express.Router();
const article_model = require('../models/article.model')

router.get('/', async function(req, res){
    const hot_news = await article_model.hot_news();
    const latest_news = await article_model.latest_news();
    const most_news = await article_model.most_news();
    const hot_categories = await article_model.hot_categories();
    res.render('home', {
        hot_news: hot_news[0],
        latest_news: latest_news[0],
        most_news: most_news[0],
        hot_categories: hot_categories[0]
    })
})

module.exports = router