const express = require('express');
const userModel = require('../models/user.model');
const router = express.Router();




// VIEW ALL USER API
router.get('/', async function(req, res) 
{
    const listAllUsers = await userModel.all();
    //console.log(listAllUsers[0][0]);
    res.render('vwAdmin/vwUser/vwShowAllUsers',{users:listAllUsers[0]});
});



// -- VIEW USER API --
router.get('/edit/:id', async function(req, res) {
    const user_id = req.params.id;
    const user = await userModel.load_user_info_by_id(user_id);
    console.log(user[0][0]);
    if (!user[0])
    {
        return res.redirect('/admin/users');
    }
    res.render('vwAdmin/vwUser/vwEditUser',user[0][0]);
});

// post patch
router.post('/patch/:id', async function(req, res) 
{
    const user_id = req.params.id;
    //await userModel.patch();
    res.redirect('/admin/users/edit/'+user_id);
});

// Post Delete
router.post('/del/:id', async function(req, res) 
{
    const user_id = req.params.id;
    //await userModel.patch();
    res.redirect('/admin/users');
});



// -- ADD USER API --
router.get('/add', async function(req, res) {
    // const list = await categoryModel.get_main_cats()
    res.render('vwAdmin/vwUser/vwAddUser', {});
});

router.post('/add', async function(req, res) {
    // const list = await categoryModel.get_main_cats()
    res.redirect('/admin/users');
});




module.exports = router