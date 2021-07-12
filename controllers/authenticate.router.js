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
    res.render('vwAuthentications/sign_in',
      {
        redirect_message: req.session.redirect_message
      });
    delete req.session.redirect_message;
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
  req.session.redirect_message = "Chúc mừng quý khách đã đăng kí thành công. Quý khách có thể đăng nhập để sử dụng đầy đủ các chức năng của LLP Newspapers"
  res.redirect("log-in");
}
);


/** 
 * view for quên mật khẩu
 * **/

router.get('/forget-password', async function (req, res) {
  res.render('vwAuthentications/forget_password',
    {
      redirect_message: req.session.redirect_message
    });
  delete req.session.redirect_message;
});


router.post('/forget-password', async function (req, res) {
  data = await authenticate_model.findByEmail(req.body.email);
  if (data.length === 0) {
    return res.render('vwAuthentications/forget_password',
      {
        err_message: 'Email bạn vừa nhập không tồn tại!'
      });
  }
  else {
    const secret = randomstring.generate(128); // Secret Key
    const token = otp.totp.generate(secret); // Token create by the Secret key

    // Expired_time for the password is 5 minutes.
    const expired_time = moment(Date.now() + 300000).format('YYYY-MM-DD HH:mm:ss');


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
      subject: '[LLP Newspaper] - [Đặt lại mật khẩu]',
      html: OTP_email_creator(token)
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    // Temporary Save user_id to session.
    req.session.forgetPasswordUserID = data[0].user_id;
    console.log('session user_id = ' + req.session.forgetPasswordUserID);

    // Redirect to Reset password page
    res.redirect("reset-password/");
  }
});


router.get('/reset-password', async function (req, res) {
  const current_time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  const user_id = req.session.forgetPasswordUserID || -1;


  // check token and time
  data = await authenticate_model.findToken(user_id, current_time);

  // can not reset password
  if (data.length === 0)
    return res.redirect('../forget-password');

  // username has request forget password.
  res.render('vwAuthentications/reset_password');
});



// Reset by Tokens
router.post('/reset-password/', async function (req, res) {

  const current_time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  const user_id = req.session.forgetPasswordUserID || -1;

  // check token and time
  data = await authenticate_model.findToken(user_id, current_time);

  // can not reset password
  if (data.length === 0)
    return res.redirect('../forget-password');


  // otp from client
  const key = req.body.otp;
  // secret key in db
  const secret = data[0]['token'];
  console.log('secret ' + secret);
  console.log('key' + key);
  const isValid = otp.totp.check(key, secret);

  // check secret key and otp
  if (!isValid)
  {
    req.session.redirect_message = 'Mã OTP bạn vừa nhập không đúng hoặc đã hết hạn sử dụng. Vui lòng thực hiện lại thao tác.';
    return res.redirect('../forget-password');
  }

  // change password
  const hash = bcrypt.hashSync(req.body.raw_password, N_HASHING_TIMES);
  await authenticate_model.change_password_by_user_id(data[0].user_id, hash);
  delete req.session.forgetPasswordUserID;

  // redirect to login
  req.session.redirect_message = 'Chúc mừng bạn đã đổi mật khẩu thành công. Bạn có thể đăng nhập để sử dụng đầy đủ các tính năng của LLP Newspaper.';
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
  req.session.redirect_message = 'Chúc mừng bạn đã đổi mật khẩu thành công.';
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


// utilities
function OTP_email_creator(otp) {
  return `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">LLP News</a>
    </div>
    <p style="font-size:1.1em">Kính chào quý khách,</p>
    <p>Cảm ơn quý khách đã sử dụng dịch vụ của LLP News. Quý khách vui lòng sử dụng mã OTP bên dưới để hoàn tất quá trình đặt lại mật khẩu. Quý khách lưu ý : mã OTP chỉ có giá trị sử dụng trong vòng <b>5 phút</b>.</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">`
    + otp + `</h2>
    <p style="font-size:0.9em;">Trân trọng cảm ơn,<br />LLP News</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>LLP News</p>
      <p>18CNTN - Khoa Công Nghệ Thông Tin</p>
      <p>Đại học Khoa học Tự nhiên - ĐHQG TPHCM</p>
    </div>
  </div>
</div>`
}

