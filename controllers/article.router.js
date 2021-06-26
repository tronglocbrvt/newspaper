/**
 * Controller for article requests
 */

const express = require('express');
const { createConnection } = require('mysql2/promise');
const article_model = require('../models/article.model')
const router = express.Router();

/**
 * API get Article by IDs:
 */
router.get('/:id', async function(req, res)
{
    const article_id = req.params.id || 0;
    const article = await article_model.find_by_id(article_id);
    console.log(article[0]);
    res.render('vwArticle/view', {
        article: article[0][0]
    });
});

module.exports = router
