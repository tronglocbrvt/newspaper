const express = require('express');
const auth = require('../middlewares/auth.mdw');
const router = express.Router();

router.get('/dashboard', auth.auth, auth.auth_admin, async function(req, res) {
    res.render('vwAdmin/dashboard');
});

module.exports = router