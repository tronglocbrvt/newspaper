const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.mdw');
const authenticate_model = require('../models/authenticate.model');

function formatTime(s) {
    var date = new Date(s);
    return date.toLocaleDateString("en-US");
}

function genderToString(gender)
{
    gender = parseInt(gender);
    if (gender === 1)
        return "Nam"
    else if(gender ===0)
        return "Nữ";
    else
        return "Khác";
}

router.get('/', auth, async function (req, res) {

    // TODO : fix premium
    res.render('vwProfile/profile', 
    { 
        err_message: req.session.change_password_error,
        redirect_message : req.session.redirect_message,
        username: req.session.authUser.user_name,
        is_premium: req.session.authUser.is_premium,
        name: req.session.authUser.name,
        dob: formatTime(req.session.authUser.date_of_birth),
        gender: genderToString(req.session.authUser.gender),
        email: req.session.authUser.email,
        premium_date: formatTime(req.session.authUser.time_premium),
    }
    );
    delete req.session.redirect_message;
    delete req.session.change_password_error;// remove from further requests
})

module.exports = router