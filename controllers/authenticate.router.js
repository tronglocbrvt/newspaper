/**
 * Controller for authentication related requests
 */
const N_HASHING_TIMES = 10;
const express = require('express');
const authenticate_model = require('../models/authenticate.model');
const auth = require('../middlewares/auth.mdw');
const not_auth = require('../middlewares/not_auth.mdw')
const email_helper = require('../middlewares/email_creator.mdw')
const router = express.Router();
const bcrypt = require('bcryptjs');
const moment = require('moment');
const otp = require('otplib');
var passport = require('passport');
const randomstring = require("randomstring");
// Mailer
const transporter = email_helper.create_transporter();

// 6 phut
const totp_options = { window: 20, };
otp.totp.options = totp_options;



//----------------------------------------------------------------------------------
/**
 * API Get log-in In Page
 * Render page view for log-in
 */
router.get('/log-in', not_auth, async function (req, res) {
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

router.post('/log-in', not_auth, async function (req, res) {
  const username = req.body.username;
  console.log(username);

  const data = await authenticate_model.findByUsername(username);

  if (data.length === 0) {
    return res.render('vwAuthentications/sign_in', {
      err_message: 'Sai Tài Khoản!'
    })
  }

  // user exist
  user = data[0];

  // Not authenticated
  if (user.is_authenticated == false) {
    req.session.redirect_message = 'Tài khoản của quý khách chưa được kích hoạt. Quý khách vui lòng kích hoạt theo hướng dẫn.';
    req.session.authenticate_user_email = data[0].email;
    return res.redirect('authenticate-account');
  }

  //console.log(user);
  const ret = bcrypt.compareSync(req.body.password, user.password);
  if (ret === false) {
    return res.render('vwAuthentications/sign_in', {
      err_message: 'Sai mật khẩu'
    })
  }


  // Success.
  delete user.password;
  console.log(user.user_name + "Dang nhap thanh cong")
  req.session.auth = true;
  req.session.authUser = user;

  const url = req.session.retUrl || '/';
  console.log('url');
  res.redirect(url);
});



//----------------------------------------------------------------------------------

/**
 * API Get Sign up Page
 * Render page view for sign-up
 */
router.get('/sign-up', not_auth, async function (req, res) {
  res.render('vwAuthentications/sign_up');
});

router.get('/is-username-available', not_auth, async function (req, res) {
  const username = req.query.username;
  const user = await authenticate_model.findByUsername(username);
  if (user.length === 0)
    return res.json(true);
  return res.json(false);
});

router.get('/is-email-available', not_auth, async function (req, res) {
  const email = req.query.email;
  const user = await authenticate_model.findByEmail(email);
  if (user.length === 0)
    return res.json(true);
  return res.json(false);
});

router.post('/sign-up', not_auth, async function (req, res) {
  const hash = bcrypt.hashSync(req.body.raw_password, N_HASHING_TIMES);
  const dob = moment(req.body.raw_date_of_birth, "DD/MM/YYYY").format("YYYY-MM-DD");
  const new_user =
  {
    user_name: req.body.username,
    gender: req.body.gender,
    password: hash,
    date_of_birth: dob,
    name: req.body.name,
    email: req.body.email,
    is_writer: 0,
    is_editor: 0,
    is_admin: 0,
    is_authenticated: false
  }
  console.log(new_user);
  await authenticate_model.add_new_user(new_user);
  req.session.authenticate_user_email = new_user.email;
  res.redirect("authenticate-account");
}
);

//----------------------------------------------------------------------------------
/** 
 * view for authenticate_account
 * **/
router.get('/authenticate-account', not_auth, async function (req, res) {
  const user_email = req.session.authenticate_user_email;
  if (!user_email) {
    return res.redirect('log-in');
  }

  const data = await authenticate_model.findByEmail(user_email);
  if (data.length === 0) {
    delete req.session.authenticate_user_email;
    return res.redirect('log-in');
  }

  // -- BEGIN OTP 
  // Create token
  const secret = randomstring.generate(128); // Secret Key
  const token = otp.totp.generate(secret); // Token create by the Secret key
  const expired_time = moment(Date.now() + 300000).format('YYYY-MM-DD HH:mm:ss');   // Expired_time for the password is 5 minutes.
  const token_data =
  {
    user_id: data[0].user_id,
    token: secret,
    expired_time: expired_time
  };

  // Insert to DB.
  await authenticate_model.insertAccountAuthenticationToken(token_data);

  // Send Emails.
  var mailOptions = email_helper.create_auth_email(user_email, token);
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  // -- END OTP send email.

  // username has request forget password.
  res.render('vwAuthentications/authenticate_account', {
    email: user_email, redirect_message: req.session.redirect_message
  });
  delete req.session.redirect_message;
});




router.post('/authenticate-account', not_auth, async function (req, res) {
  const current_time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  const user_email = req.session.authenticate_user_email;
  if (!user_email) {
    return res.redirect('auth/log-in');
  }
  var data = await authenticate_model.findByEmail(user_email);
  if (data.length === 0) {
    delete req.session.authenticate_user_email;
    return res.redirect('auth/log-in');
  }

  const user_id = data[0].user_id;
  // check token and time
  console.log(user_id, current_time);
  data = await authenticate_model.findAccountAuthenticationToken(user_id, current_time);

  // can not auth
  if (data.length === 0)
    return res.redirect('auth/log-in');

  // otp from client
  const key = req.body.otp;
  // secret key in db
  const secret = data[0]['token'];
  console.log('secret ' + secret);
  console.log('key' + key);
  const isValid = otp.totp.check(key, secret);

  // check secret key and otp
  if (!isValid) {
    req.session.redirect_message = 'Mã OTP bạn vừa nhập không đúng hoặc đã hết hạn sử dụng. Chúng tôi đã gửi đến bạn một mã xác thực khác. Vui lòng kiểm tra lại email';
    return res.redirect('authenticate-account');
  }

  await authenticate_model.authenticate_by_user_id(user_id);
  req.session.redirect_message = "Chúc mừng quý khách đã đăng kí thành công. Quý khách có thể đăng nhập để sử dụng đầy đủ các chức năng của LLP Newspapers"
  res.redirect("log-in");
  delete req.session.authenticate_user_email;
});






//----------------------------------------------------------------------------------
/** 
 * view for quên mật khẩu
 * **/
router.get('/forget-password', not_auth, async function (req, res) {
  res.render('vwAuthentications/forget_password',
    {
      redirect_message: req.session.redirect_message
    });
  delete req.session.redirect_message;
});

router.post('/forget-password', not_auth, async function (req, res) {
  data = await authenticate_model.findByEmail(req.body.email);
  if (data.length === 0) {
    return res.render('vwAuthentications/forget_password',
      {
        err_message: 'Email bạn vừa nhập không tồn tại!'
      });
  }
  else {

    // Generate tokens
    const secret = randomstring.generate(128); // Secret Key
    const token = otp.totp.generate(secret); // Token create by the Secret key
    const expired_time = moment(Date.now() + 300000).format('YYYY-MM-DD HH:mm:ss'); // Expired_time for the password is 5 minutes.
    const token_data =
    {
      user_id: data[0].user_id,
      token: secret,
      expired_time: expired_time
    };

    // add to DB
    await authenticate_model.insertToken(token_data);

    // Send Emails
    var mailOptions = email_helper.create_reset_password_email(req.body.email, token);
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
}
);



//----------------------------------------------------------------------------------
/** 
 * view for reset password
 * **/
router.get('/reset-password', not_auth, async function (req, res) {
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
router.post('/reset-password/', not_auth, async function (req, res) {

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
  if (!isValid) {
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

// /**
// HINH NHU K CO XAI NEN CMT XOA SAU
//  * Check password-is correct.
//  */
// router.get('/is-password-correct', auth, async function (req, res) {
//   // Get username from session.
//   const username = req.session.authUser.user_name;
//   console.log(username);

//   // Get user by user-name  
//   const data = await authenticate_model.findByUsername(username);
//   user = data[0];

//   // Compare Password.
//   const ret = bcrypt.compareSync(req.body.password, user.password);
//   return res.json(ret);
// });


//----------------------------------------------------------------------------------


/**
 * Change-password API => must sign-in
 * TODO: Chan login google facebook doi mk.
 */
router.post('/change-password', auth.auth, async function (req, res) {
  const is_log_in_by_third_party = req.session.authUser.facebook_id || req.session.authUser.google_id;

  if (is_log_in_by_third_party) {
    res.redirect("../profile");
    return;
  }

  // Get user_id from session.
  const user_id = req.session.authUser.user_id;

  // Get user by user-name  
  const data = await authenticate_model.findByUserID(user_id);
  user = data[0];

  // Compare Password.
  const ret = bcrypt.compareSync(req.body.password, user.password);

  if (ret) {
    // raw passwords
    const raw_password = req.body.newpassword
    const hash = bcrypt.hashSync(raw_password, N_HASHING_TIMES);
    // console.log(hash);
    await authenticate_model.change_password_by_user_id(user_id, hash);
  }
  else {
    req.session.change_password_error = 'Mật khẩu cũ không đúng.';
  }
  // password k luu nen khoi doi session
  req.session.redirect_message = 'Chúc mừng bạn đã đổi mật khẩu thành công.';
  res.redirect("../profile");
});


router.post('/change-name', auth.auth, async function (req, res) {
  // Get username from session.
  const user_id = req.session.authUser.user_id;
  await authenticate_model.change_name_by_user_id(user_id, req.body.name);

  // change session
  req.session.authUser.name = req.body.name;

  res.redirect("../profile");
});


router.post('/change-dob', auth.auth, async function (req, res) {
  // Get username from session.
  const user_id = req.session.authUser.user_id;
  const dob = moment(req.body.raw_date_of_birth, "DD/MM/YYYY").format("YYYY-MM-DD");
  await authenticate_model.change_DOB_by_user_id(user_id, dob);

  // change session
  req.session.authUser.date_of_birth = dob;

  res.redirect("../profile");
});

router.post('/change-gender', auth.auth, async function (req, res) {
  // Get username from session.
  const user_id = req.session.authUser.user_id;
  await authenticate_model.change_gender_by_user_id(user_id, req.body.gender);

  // change session
  req.session.authUser.gender = req.body.gender;
  console.log("changed gender" + req.session.authUser.gender);

  res.redirect("../profile");
});


router.post('/change-nick-name', auth.auth,auth.auth_writer, async function (req, res) {
  // Get username from session.
  const user_id = req.session.authUser.user_id;
  await authenticate_model.change_writer_nickname_by_user_id(user_id, req.body.nickname);

  // change session
  console.log("changed nick_name");

  res.redirect("../profile");
});



//----------------------------------------------------------------------------------


/** 
 * Log-out
*/
router.post('/log-out', auth.auth, async function (req, res) {
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


//----------------------------------------------------------------------------------

/**
 * Sign in with google handler
 */
router.get('/google', not_auth,
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', not_auth,
  passport.authenticate('google',
    {
      failureRedirect: '/log-in'
    }),
  async function (req, res) {
    const google_id = req.user.id;
    var data = await authenticate_model.findByGoogleID(google_id);

    // Create new users.
    if (data[0].length === 0) {
      console.log("create new google users")
      const new_user =
      {
        name: req.user.displayName,
        is_admin: 0,
        is_editor: 0,
        is_writer: 0,
        is_authenticated: 1,
      }
      await authenticate_model.add_new_user(new_user); // add new users to db
      await authenticate_model.insertGoogleUser(google_id);
      var data = await authenticate_model.findByGoogleID(google_id);
    }

    // Log-in
    user = data[0][0];
    user.google_id = google_id;
    delete user.password;
    console.log(user.google_id + " - Dang nhap thanh cong")
    req.session.auth = true;
    req.session.authUser = user;
    const url = req.session.retUrl || '/';
    console.log('url');
    res.redirect(url);
  }
);




/**
 * Sign in with facebook handler
 */
router.get("/facebook", not_auth, passport.authenticate("facebook"));
router.get("/facebook/callback", not_auth,
  passport.authenticate("facebook",
    {
      failureRedirect: "/log-in"
    }),
  async function (req, res) {
    const facebook_id = req.user.id;
    console.log(facebook_id);
    var data = await authenticate_model.findByFacebookID(facebook_id);

    // Create new users.
    if (data[0].length === 0) {
      console.log("create new facebook users")
      const new_user =
      {
        name: req.user.displayName,
        is_admin: 0,
        is_editor: 0,
        is_writer: 0,
        is_authenticated: 1
      }
      await authenticate_model.add_new_user(new_user); // add new users to db
      await authenticate_model.insertFacebookUser(facebook_id);
      var data = await authenticate_model.findByFacebookID(facebook_id);
    }
    // Log-in
    user = data[0][0];
    user.facebook_id = facebook_id;
    delete user.password;
    console.log(user.facebook_id + " - Dang nhap thanh cong")
    req.session.auth = true;
    req.session.authUser = user;
    const url = req.session.retUrl || '/';
    console.log(req.session.authUser);
    res.redirect(url);
  }
);

module.exports = router


//------------------------------------------


