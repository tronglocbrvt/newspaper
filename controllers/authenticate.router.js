/**
 * Controller for authentication related requests
 */
const N_HASHING_TIMES = 10;
const express = require('express');
const authenticate_model = require('../models/authenticate.model')
const router = express.Router();
const bcrypt = require('bcryptjs');
const moment = require('moment');

/**
 * API Get Sign In Page
 * Render page view for sign-in
 */
router.get('/log-in', async function (req, res) {
    res.render('vwAuthentications/sign_in');
});


/**
 * API Get Sign In Page
 * Render page view for sign-up
 */
router.get('/sign-up', async function (req, res) {
    res.render('vwAuthentications/sign_up');
});


router.get('/is-username-available',async function (req, res){
    const username = req.query.username;
    const user = await authenticate_model.findByUsername(username);
    if (user.length ===0)
        return res.json(true);
    return res.json(false);
});

router.get('/is-email-available',async function (req, res){
    const email = req.query.email;
    const user = await authenticate_model.findByEmail(email);
    if (user.length ===0)
        return res.json(true);
    return res.json(false);
})

router.post('/sign-up',async function (req,res)
{
    const hash = bcrypt.hashSync(req.body.raw_password, N_HASHING_TIMES);
    const dob = moment(req.body.raw_date_of_birth,"MM/DD,YYYY").format("YYYY-MM-DD");
    const new_user = 
    {
        user_name : req.body.user_name,
        gender: req.body.gender,
        password : hash,
        date_of_birth : dob,
        name : req.body.name,
        email: req.body.email,
        is_premium : 0,
        is_writer : 0,
        is_editor : 0,
        is_admin : 0
    }
    console.log(new_user);
    await authenticate_model.add_new_user(new_user);
    res.render('vwAuthentications/sign_up');
}
);


module.exports = router
