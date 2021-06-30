


/**
    Check whether username or email is duplicate. Show bug if duplicate. Submit if not
    **/
async function checkDuplicateAndSubmit(username, email) {
    function getJsonFromServer(api) {
        return new Promise(function (fn_done, fn_fail) {
            $.getJSON(api, function (data) { fn_done(data); });
        }
        );
    }
    const is_username_avail = await getJsonFromServer(`/auth/is-username-available?username=${username}`);
    const is_email_avail = await getJsonFromServer(`/auth/is-email-available?email=${email}`);
    if (is_email_avail === false) {
        $('#email_duplicate').show();
        $('#email').addClass("border border-danger");
    }
    else {
        $('#email_duplicate').hide()
        $('#email').removeClass("border border-danger");
    }

    if (is_username_avail === false) {
        $('#username_duplicate').show();
        $('#username').addClass("border border-danger");
    }
    else {
        $('#username_duplicate').hide()
        $('#username').removeClass("border border-danger");
    }

    if (is_email_avail && is_username_avail) {
        console.log("submit");
        { { !--$('#frmRegister').off('submit').submit(); --} }
    }
}


// Check Attributes are Valid or not? 
function checkEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function checkUsername(username) {
    return (username.length > 0);
}

// Check Attributes are Valid or not? 
function checkPassword() {
    if (parseInt(myPassMeter.getScore()) >= 3)
        return true;
    return false;
}

// Check Attributes are Valid or not? 
function checkName(name) {
    return (name.length > 0);
}

// Check Attributes are Valid or not? 
function checkConfirmPassword(password, password_confirm) {
    return (password === password_confirm);
}

// Submit Form
$('#frmRegister').on('submit', function (e) {

    e.preventDefault();
    validTestPassed = true;

    ///////////////////////////////////////////////////

    const name = $('#name').val();
    if (!checkName(name)) {
        $('#name_invalid').show();
        $('#name').addClass("border border-danger");
        validTestPassed = false;
    }
    else {
        $('#name_invalid').hide()
        $('#name').removeClass("border border-danger");
    }


    ///////////////////////////////////////////////////

    const email = $('#email').val()
    if (!checkEmail(email)) {
        $('#email_invalid').show();
        $('#email').addClass("border border-danger");
        validTestPassed = false;
    }
    else {
        $('#email_invalid').hide()
        $('#email').removeClass("border border-danger");
    }


    ///////////////////////////////////////////////////

    const username = $('#username').val();
    if (!checkUsername(username)) {
        $('#username_invalid').show();
        $('#username').addClass("border border-danger");
        validTestPassed = false;
    }
    else {
        $('#username_invalid').hide()
        $('#username').removeClass("border border-danger");
    }

    ///////////////////////////////////////////////////

    if (!checkPassword()) {
        $('#password_invalid').show();
        $('#password').addClass("border border-danger");
        $("#password").val("");
        $("#password_confirm").val("");
        validTestPassed = false;
        myPassMeter.checkPasswordAgain("");
    }
    else {
        $('#password_invalid').hide()
        $('#password').removeClass("border border-danger");
    }

    ///////////////////////////////////////////////////

    const password = $('#password').val();
    const password_confirm = $('#password_confirm').val();

    if (!checkConfirmPassword(password, password_confirm)) {
        $('#password_confirm_invalid').show();
        $('#password_confirm').addClass("border border-danger");
        $("#password").val("");
        $("#password_confirm").val("");
        validTestPassed = false;
        myPassMeter.checkPasswordAgain("");
    }
    else {
        $('#password_confirm_invalid').hide();
        $('#password_confirm').removeClass("border border-danger");
    }

    // Check duplicate with Server DBs and submit()
    if (validTestPassed) {
        checkDuplicateAndSubmit(username, email);
    }
});