/**
 * Controller for article related requests
 */

const express = require('express');
const article_model = require('../models/article.model')
const router = express.Router();
const LIMIT_SIMILAR_ARTICLE = 5; // num of similar articles to get


/**
 * @param {s} String
 * @returns format time string
 */
function formatTime(s) {
    var date = new Date(s);
    return date.toLocaleString("en-US");
}


/**
 * API get Article by IDs
 * Input URL : id: published article id
 * Render page view a single paper
 */
router.get('/:id', async function (req, res) {
    // Get id
    const article_id = req.params.id || 0;

    // Load from dbs
    const db_data_article = await article_model.load_published_article_by_id(article_id);
    const db_data_tags = await article_model.load_tags_by_published_article_id(article_id);
    const db_data_similar_articles = await article_model.load_random_published_articles_with_same_category(article_id, LIMIT_SIMILAR_ARTICLE)

    if (db_data_article[0][0]) {
        // Generate input for views
        var article = db_data_article[0][0];
        article.time_published = formatTime(article.time_published);

        var tags = db_data_tags[0];

        var similar_articles = db_data_similar_articles[0];

        var view_inputs =
        {
            article: article,
            tags: tags,
            similar_articles: similar_articles
        }
        // Render 
        res.render('vwArticle/view', view_inputs);
    }
    else {
        res.render('vwArticle/viewBlankArticle');
    }
});

module.exports = router
