const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.mdw');
const authenticate_model = require('../models/authenticate.model');
const premium_form_db = require('../models/premium_forms.model.js')
const getTimeModule = require('../utils/get_time.js');


function formatTime(s) {
    if (!s)
        return "Không có thông tin";
    var date = new Date(s);
    return date.toLocaleDateString("en-US");
}

function genderToString(gender) {
    if (!gender)
        return "Không có thông tin";
    gender = parseInt(gender);
    if (gender === 1)
        return "Nam"
    else if (gender === 0)
        return "Nữ";
    else
        return "Khác";
}


router.get('/', auth.auth, async function (req, res) {

    // TODO : fix premium
    const is_premium = getTimeModule.get_time_now() <= getTimeModule.get_time_from_date(req.session.authUser.time_premium);

    const is_log_in_by_third_party = req.session.authUser.facebook_id || req.session.authUser.google_id;

    var user_name = null;
    if (req.session.authUser.user_name)
        user_name = req.session.authUser.user_name;
    else if (req.session.authUser.facebook_id)
        user_name = "Người dùng Facebook: " + req.session.authUser.facebook_id;
    else if (req.session.authUser.google_id)
        user_name = "Người dùng Google: " + req.session.authUser.google_id;


    console.log(req.session.authUser);

    res.render('vwProfile/profile',
        {
            err_message: req.session.change_password_error,
            redirect_message: req.session.redirect_message,
            username: user_name,
            is_premium: is_premium,
            name: req.session.authUser.name,
            dob: req.session.authUser.date_of_birth,
            gender: genderToString(req.session.authUser.gender),
            email: req.session.authUser.email,
            user_id: req.session.authUser.user_id,
            premium_date: req.session.authUser.time_premium,
            is_log_in_by_third_party: is_log_in_by_third_party,
            is_admin: req.session.authUser.is_admin,
            is_editor: req.session.authUser.is_editor,
            is_writer: req.session.authUser.is_writer,
        }
    );
    delete req.session.redirect_message;
    delete req.session.change_password_error;// remove from further requests
});


router.post('/sign-up-premium', auth.auth, async function (req, res) 
{
    const sign_up_premium_form = 
    {
        user_id : req.session.authUser.user_id,
        bank_number: req.body.stk,
        bank_owner: req.body.ctk,
        bank_name: req.body.chinhanh,
        package: parseInt(req.body.goi)
    }
    premium_form_db.add_new_form(sign_up_premium_form);
    console.log(sign_up_premium_form);
    res.redirect("../profile");
}
);

module.exports = router