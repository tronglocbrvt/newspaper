/**
 * Controller for article requests
 */

const express = require('express');
const { createConnection } = require('mysql2/promise');
const article_model = require('../models/article.model')
const router = express.Router();

function formatTime(s)
{
    var date = new Date(s);
    return date.toLocaleString("en-US");
}

/**
 * API get Article by IDs:
 */
router.get('/:id', async function(req, res)
{
    const article_id = req.params.id || 0;
    const db_data_article = await article_model.find_by_id(article_id);
    const db_data_tags = await article_model.find_tags_by_id(article_id);

    var article = db_data_article[0][0];
    article.time_published = formatTime(article.time_published);
    var tags = db_data_tags[0];
    console.log(tags);

    res.render('vwArticle/view', {
        article: article,
        tags : tags
    });
});

module.exports = router
