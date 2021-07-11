/**
 * Controller for article related requests
 */

const express = require('express');
const puppeteer = require("puppeteer");
const article_model = require('../models/article.model');
const comment_model = require('../models/comment_model');
const router = express.Router();
const LIMIT_SIMILAR_ARTICLE = 5; // num of similar articles to get
const auth = require('../middlewares/auth.mdw');


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
    const db_data_similar_articles = await article_model.load_random_published_articles_with_same_category(article_id,LIMIT_SIMILAR_ARTICLE);
    const db_data_comment = await article_model.load_comments_of_published_articles_by_id(article_id);
    

    if (db_data_article[0][0]) {
        // Generate input for views
        var article = db_data_article[0][0];
        article.time_published = formatTime(article.time_published);

        var tags = db_data_tags[0];

        var similar_articles = db_data_similar_articles[0];

        var comments = db_data_comment[0];
        for (let i = 0;i<comments.length;++i)
            comments[i].time_comment= formatTime(comments[i].time_comment);


        var view_inputs=
        { 
            article: article,
            tags : tags,
            similar_articles : similar_articles,
            comments: comments
        }
        // Render 
        res.render('vwArticle/viewArticle', view_inputs);
    }
    else {
        res.status(404);
        res.render('vwError/viewNotFound');
    }
},

);

router.post('/:id', auth,async function(req, res)
{
    const published_article_id = req.params.id || 0;
    const content = req.body.comment;
    const time_comment = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const new_comment = 
    {
        content:content,
        published_article_id : published_article_id,
        time_comment:time_comment,
        user_id : res.locals.authUser.user_id
    };
    console.log(new_comment);
    await comment_model.add_new_comment(new_comment);
    res.redirect('back');
}
);

router.get('/:id/download', async function(req, res) {
    const published_article_id = req.params.id || 0;
    const browser = await puppeteer.launch( {
        headless: true
    });
    const web_page = await browser.newPage();
    const url = "http://localhost:3000/articles/" + published_article_id;
    await web_page.goto(url, {
    waitUntil: "networkidle0"
    });

    const pdf = await web_page.pdf({
        printBackground: true,
        path: "newspaper.pdf",
        format: "Letter",
        margin: {
            top: "40px",
            bottom: "40px",
            left: "40px",
            right: "40px"
        }
    });
    
    await browser.close();

    res.contentType("application/pdf");
    res.send(pdf);
  });

module.exports = router
