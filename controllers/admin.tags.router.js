const express = require('express');
const tag_model = require('../models/tag.model');

const router = express.Router();

// Tags management
router.get('/add', async function(req, res) {
    res.render('vwAdmin/vwTag/add_tag');
});

router.post('/', async function(req, res) {
    await tag_model.add(req.body)
    res.redirect('/admin/tags');
});

router.get('/', async function(req, res) {
    const list = await tag_model.get_tags()
    res.render('vwAdmin/vwTag/view_tag', {
        tags: list[0]
    });
});

router.get('/:id', async function(req, res) {
    const tag_id = req.params.id;
    const tag_name = await tag_model.get_name_tag_by_tag_id(tag_id);
    if (tag_name === undefined)
    {
        return res.redirect('/admin/tags');
    }
    res.render('vwAdmin/vwTag/edit_tag', {
        tag_name: tag_name.tag_name,
        tag_id: tag_id,
    });
});

router.post('/:id/patch', async function(req, res) {
    await tag_model.patch(req.params.id, req.body.tag_name);
    res.redirect('/admin/tags');
});

router.post('/:id/del', async function(req, res) {
    await tag_model.delete(req.params.id);
    res.redirect('/admin/tags');
});

module.exports = router