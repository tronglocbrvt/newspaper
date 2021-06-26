const express = require('express');
const categoryModel = require('../models/tag.model')
const articleModel = require('../models/article.model')
const router = express.Router();

router.get('/:tag_id', async function(req, res) {
    const tag_id = req.params.tag_id || 0;

    const limit = 10;
    const page = req.query.page || 1;
    if (page < 1) page = 1;

    const total = await articleModel.count_by_tag_id(tag_id);
    let n_pages = Math.ceil(total[0][0].total / limit);
    if (total % limit > 0) n_pages++;

    const page_numbers = [];
    for (i = 1; i <= n_pages; i++) {
    page_numbers.push({
      value: i,
      isCurrent: i === +page
    });
    }

    const offset = (page - 1) * limit;
  
    const name_cat = await categoryModel.get_name_by_cat_id(cat_id);
    const list = await articleModel.find_by_subcat_id(sub_id, offset);

    for (i = 0; i < sub_cats[0].length; i++) {
        if (sub_cats[0][i].category_id === +sub_id) {
            sub_cats[0][i].is_active = true;
        }
        else {
            sub_cats[0][i].is_active = false;
        }
    }
    var tags = new Array();
    if (list[0].length !== 0) {
        for (let i = 0; i < list[0].length; i++) {
            let tags_article = await articleModel.find_tags_by_article_id(list[0][i].article_id);
            tags[i] = tags_article[0];
        }
    }

    res.render('vwCategories/article_subcategory', {
        articles: list[0],
        tags,
        page_numbers,
        page_first: parseInt(page) === 1,
        page_last: parseInt(page) === parseInt(n_pages),
        next_page: parseInt(page) + 1 ,
        previous_page: parseInt(page) - 1,
        name_cat: name_cat[0],
        empty: list[0].length === 0 || sub_cats[0].length === 0
    })
});

module.exports = router
