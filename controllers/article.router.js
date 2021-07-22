/**
 * Controller for article related requests
 */
const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const hb = require('handlebars');
const path = require('path');
const utils = require('util');
const article_model = require('../models/article.model');
const comment_model = require('../models/comment_model');
const router = express.Router();
const LIMIT_SIMILAR_ARTICLE = 5; // num of similar articles to get
const auth = require('../middlewares/auth.mdw');
const getTimeModule = require('../utils/get_time.js');

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
    const db_data_similar_articles = await article_model.load_random_published_articles_with_same_category(article_id, LIMIT_SIMILAR_ARTICLE);
    const db_data_comment = await article_model.load_comments_of_published_articles_by_id(article_id);

    if (db_data_article[0][0]) {
        // Generate input for views
        var article = db_data_article[0][0];

        if (article.is_premium === 1 && (req.session.auth === false || getTimeModule.get_time_now() > getTimeModule.get_time_from_date(req.session.authUser.time_premium))) {
            res.status(403);
            return res.render('vwError/viewPremium');
        }

        article.time_published = formatTime(article.time_published);

        var tags = db_data_tags[0];

        var similar_articles = db_data_similar_articles[0];

        var comments = db_data_comment[0];
        for (let i = 0; i < comments.length; ++i)
            comments[i].time_comment = formatTime(comments[i].time_comment);

        let obj_article = JSON.stringify(article)
        let obj_tags = JSON.stringify(tags);
        obj_article = obj_article.substring(0, obj_article.length - 1)
        let data = obj_article + ", \"tags\":" + obj_tags + "}";

        var view_inputs =
        {
            article: article,
            tags: tags,
            similar_articles: similar_articles,
            comments: comments,
            premium: req.session.auth,
            data: data
        }
        
        await article_model.update_views(article_id)

        // Render 
        res.render('vwArticle/viewArticle', view_inputs);
    }
    else {
        res.status(404);
        res.render('vwError/viewNotFound');
    }
},

);

router.post('/:id', auth, async function (req, res) {
    const published_article_id = req.params.id || 0;
    const content = req.body.comment;
    const time_comment = new Date().toISOString().slice(0, 19).replace('T', ' ');
    // console.log(req.session.authUser);
    const new_comment =
    {
        content: content,
        published_article_id: published_article_id,
        time_comment: time_comment,
        user_id: req.session.authUser.user_id
    };
    console.log(new_comment);
    await comment_model.add_new_comment(new_comment);
    res.redirect('back');
}
);

async function getTemplateHtml() {
    const readFile = utils.promisify(fs.readFile)
    console.log("Loading template file in memory")
    try {
        const newsPath = path.resolve("./views/template_download/viewDownloadArticle.hbs");
        return await readFile(newsPath, 'utf8');
    } catch (err) {
        return Promise.reject("Could not load html template");
    }
}

router.post('/:id/download', async function (req, res) {
    if (req.session.auth === false || getTimeModule.get_time_now() > getTimeModule.get_time_from_date(req.session.authUser.time_premium)) {
        res.status(403);
        return;
    }
    let data_download = req.body.download;
    data = JSON.parse(data_download);
    getTemplateHtml().then(async (res) => {
        console.log("Compile the template with handlebars")
        const template = hb.compile(res, { strict: true });
        const result = template(data);
        const html = result;
        const browser = await puppeteer.launch();
        const page = await browser.newPage()
        await page.setContent(html)
        await page.pdf({ path: 'newspaper.pdf', format: 'A4' })
        await browser.close();
        console.log("PDF Generated");
    }).catch(err => {
        console.error(err)
    });
    res.redirect('back');
});

module.exports = router
