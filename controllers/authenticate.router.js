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
 * API Get log-in In Page
 * Render page view for log-in
 */
router.get('/log-in', async function (req, res) {
    if (res.locals.auth === false)
    {
        res.render('vwAuthentications/sign_in');
    }
    else
    {
        const url = req.session.retUrl || '/';
        res.redirect(url);
    }
});

router.post('/log-in',async function (req,res)
{
    const username = req.body.username;
    console.log(username);

    const data = await authenticate_model.findByUsername(username);
    if (data.length===0) 
    {
      console.log("TK SAI");
      return res.render('vwAuthentications/sign_in', {
        err_message: 'Sai Tài Khoản!'
      })
    }
  
    user = data[0];
    
    console.log(user);

    const ret = bcrypt.compareSync(req.body.password, user.password);

    if (ret === false) 
    {
      console.log("MK SAI");
      return res.render('vwAuthentications/sign_in', {
        err_message: 'Sai mật khẩu'
      })
    }

    delete user.password;
    
    console.log(user.user_name + "Dang nhap thanh cong")
    req.session.auth = true;
    req.session.authUser = user;
    const url = req.session.retUrl || '/';
    res.redirect(url);
});

/**
 * API Get Sign up Page
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
        user_name : req.body.username,
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


/** 
 * view for quên mật khẩu
 * **/

 router.get('/forget-password', async function (req, res) {
    res.render('vwAuthentications/forget_password');
});

module.exports = router
