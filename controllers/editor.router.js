const express = require('express');
const router = express.Router();
const editor_model = require('../models/editor.model');
const category_model = require('../models/category.model');

router.get('/:editor_id/categories/:category_id', async function(req, res){
    const category_id = req.params.category_id;
    const editor_id = req.params.editor_id;
    var category_name = await category_model.get_name_by_id(category_id);
    var articles = await editor_model.get_articles_by_editor_category(editor_id, category_id);
    res.render('vwEditors/view_articles', {
        category_name: category_name[0][0].category_name,
        editor_id: editor_id,
        articles: articles[0]
    })
});

module.exports = router;