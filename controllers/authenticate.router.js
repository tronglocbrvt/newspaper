/**
 * Controller for authentication related requests
 */
const N_HASHING_TIMES = 10;
const express = require('express');
const authenticate_model = require('../models/authenticate.model');
const auth = require('../middlewares/auth.mdw');
const router = express.Router();
const bcrypt = require('bcryptjs');
const moment = require('moment');
const otp = require('otplib');
const nodemailer = require('nodemailer');
const randomstring = require("randomstring");
const { clearCustomQueryHandlers } = require('puppeteer');
const { findByEmail } = require('../models/authenticate.model');

// Mailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'llp.newspapers@gmail.com',
    pass: 'LinhLocPhuc123'
  }
});


// 6 phut
const totp_options = {
  window: 20,
};


otp.totp.options = totp_options;


/**
 * API Get log-in In Page
 * Render page view for log-in
 */
router.get('/log-in', async function (req, res) {
  if (res.locals.auth === false) {
    res.render('vwAuthentications/sign_in');
  }
  else {
    const url = req.session.retUrl || '/';
    res.redirect(url);
  }
});




router.post('/log-in', async function (req, res) {
  const username = req.body.username;
  console.log(username);

  const data = await authenticate_model.findByUsername(username);
  if (data.length === 0) {
    return res.render('vwAuthentications/sign_in', {
      err_message: 'Sai Tài Khoản!'
    })
  }

  user = data[0];

  console.log(user);

  const ret = bcrypt.compareSync(req.body.password, user.password);

  if (ret === false) {
    return res.render('vwAuthentications/sign_in', {
      err_message: 'Sai mật khẩu'
    })
  }

  delete user.password;

  console.log(user.user_name + "Dang nhap thanh cong")
  req.session.auth = true;
  req.session.authUser = user;

  const url = req.session.retUrl || '/';
  console.log('url');
  res.redirect(url);
});



/**
 * API Get Sign up Page
 * Render page view for sign-up
 */
router.get('/sign-up', async function (req, res) {
  res.render('vwAuthentications/sign_up');
});




router.get('/is-username-available', async function (req, res) {
  const username = req.query.username;
  const user = await authenticate_model.findByUsername(username);
  if (user.length === 0)
    return res.json(true);
  return res.json(false);
});



router.get('/is-email-available', async function (req, res) {
  const email = req.query.email;
  const user = await authenticate_model.findByEmail(email);
  if (user.length === 0)
    return res.json(true);
  return res.json(false);
});




router.post('/sign-up', async function (req, res) {
  const hash = bcrypt.hashSync(req.body.raw_password, N_HASHING_TIMES);
  const dob = moment(req.body.raw_date_of_birth, "MM/DD,YYYY").format("YYYY-MM-DD");
  const new_user =
  {
    user_name: req.body.username,
    gender: req.body.gender,
    password: hash,
    date_of_birth: dob,
    name: req.body.name,
    email: req.body.email,
    is_premium: 0,
    is_writer: 0,
    is_editor: 0,
    is_admin: 0
  }
  console.log(new_user);
  await authenticate_model.add_new_user(new_user);
  res.redirect("log-in");
}
);


/** 
 * view for quên mật khẩu
 * **/

router.get('/forget-password', async function (req, res) {
  res.render('vwAuthentications/forget_password');
});

router.post('/forget-password', async function (req, res) {
  data = await authenticate_model.findByEmail(req.body.email);
  if (data.length === 0) {
    return res.render('vwAuthentications/forget_password', {
      err_message: 'Email bạn vừa nhập không tồn tại!'
    });
  }
  else {
    const secret = randomstring.generate(64);
    const token = otp.totp.generate(secret);

    console.log(otp.totp.timeUsed());
    console.log("S = " + secret);
    console.log("T = " + token);
    console.log("Secret Token valid = " + otp.totp.check(token,secret));
    
    console.log(typeof secret);
    console.log(typeof token);

    const expired_time = moment(Date.now() + 360000).format('YYYY-MM-DD HH:mm:ss');
    const token_data =
    {
      user_id: data[0].user_id,
      token: secret,
      expired_time: expired_time
    };
    console.log(token_data);
    await authenticate_model.insertToken(token_data);

    // send mail
    var mailOptions = {
      from: 'llp.newspapers@gmail.com',
      to: req.body.email,
      subject: 'Reset password',
      text: 'Your token is: ' + token + "."
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.redirect("reset-password/" + secret);
  }
});


router.get('/reset-password/:token', async function (req, res) {
  const token = req.params.token || 0;
  const expired_time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  console.log("token: " + token);
  console.log("time: " + expired_time);
  // check token and time
  data = await authenticate_model.findToken(token, expired_time);

  if (data.length === 0)
    return res.redirect('../forget-password');

  // token is avail  
  console.log(token);
  res.render('vwAuthentications/reset_password');
});



// Reset by Tokens
router.post('/reset-password/:token', async function (req, res) {
  
  const token = req.params.token || 0;
  const expired_time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  console.log("token: " + token);
  console.log("time: " + expired_time);

  // check token and time
  data = await authenticate_model.findToken(token, expired_time);

  if (data.length === 0)
    return res.redirect('../forget-password');


  const key = req.body.otp;
  console.log(key);

  console.log("S = " + token);
  console.log("T = " + key);
  console.log(typeof token);
  console.log(typeof key);
  console.log("Secret Token valid = " + otp.totp.check(key,token));

  const isValid = otp.totp.check( key, token );

  if (!isValid)
    return res.redirect('../forget-password');


  const hash = bcrypt.hashSync(req.body.raw_password, N_HASHING_TIMES);
  await authenticate_model.change_password_by_user_id(data[0].user_id, hash);
  res.redirect('../log-in');
});





/**
 * Check password-is correct - Ajax.
 */
router.get('/is-password-correct', auth, async function (req, res) {
  // Get username from session.
  const username = req.session.authUser.user_name;
  console.log(username);

  // Get user by user-name  
  const data = await authenticate_model.findByUsername(username);
  user = data[0];

  // Compare Password.
  const ret = bcrypt.compareSync(req.body.password, user.password);
  return res.json(ret);
});


/**
 * Change-password API => must sign-in
 */
router.post('/change-password', auth, async function (req, res) {
  // Get username from session.
  const username = req.session.authUser.user_name;
  console.log(username);

  // Get user by user-name  
  const data = await authenticate_model.findByUsername(username);
  user = data[0];

  // console.log(user);
  // console.log(req.body.password);
  // Compare Password.
  const ret = bcrypt.compareSync(req.body.password, user.password);

  if (ret) {
    // raw passwords
    const raw_password = req.body.newpassword
    const hash = bcrypt.hashSync(raw_password, N_HASHING_TIMES);
    // console.log(hash);
    await authenticate_model.change_password(user.user_name, hash);
  }
  else {
    req.session.change_password_error = 'Mật khẩu cũ không đúng.';
  }

  // password k luu ne khoi doi session

  res.redirect("../profile");
});


router.post('/change-name', auth, async function (req, res) {
  // Get username from session.
  const username = req.session.authUser.user_name;
  await authenticate_model.change_name(username, req.body.name);

  // change session
  req.session.authUser.name = req.body.name;

  res.redirect("../profile");
});

router.post('/change-dob', auth, async function (req, res) {
  // Get username from session.
  const username = req.session.authUser.user_name;
  const dob = moment(req.body.raw_date_of_birth, "MM/DD,YYYY").format("YYYY-MM-DD");

  await authenticate_model.change_DOB(username, dob);

  // change session
  req.session.authUser.date_of_birth = dob;

  res.redirect("../profile");
});



router.post('/change-gender', auth, async function (req, res) {
  // Get username from session.
  const username = req.session.authUser.user_name;
  await authenticate_model.change_gender(username, req.body.gender);

  // change session
  req.session.authUser.gender = req.body.gender;
  console.log("changed gender" + req.session.authUser.gender);

  res.redirect("../profile");
});





router.post('/log-out', auth, async function (req, res) {
  if (req.session) {
    req.session.destroy(function (err) {
      if (err) {
        res.status(400).send('Unable to log out')
      } else {
        const url = req.headers.referer || '/';
        res.redirect(url);
      }
    });
    ;
  } else {
    res.end()
  }
});

module.exports = router




// const secret = authenticator.authenticator.generateSecret();
// const token = authenticator.authenticator.generate(secret);
// console.log(secret);
// console.log(token);
// try 
// {
//   const isValid = authenticator.authenticator.verify({ token, secret });
// } catch (err) 
// {
//   console.error(err);
// }


// // Test scripts
// var nodemailer = require('nodemailer');


// var transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 587,
//     auth: {
//     user: 'llp.newspapers@gmail.com',
//     pass: 'LinhLocPhuc123'
//   }
// });
// transporter.verify().then(console.log).catch(console.error);

// var mailOptions = {
//   from: 'llp.newspapers@gmail.com',
//   to: 'tronglocbrvt1611@gmail.com',
//   subject: 'Reset password',
//   text: 'Your token is: ' + token + "."
// };

// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// }); 
