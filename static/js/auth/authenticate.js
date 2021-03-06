/**
    Check whether username or email is duplicate. Show bug if duplicate. Submit if not
**/
async function checkDuplicateAndSubmit(formName, username, email) {
    function getJsonFromServer(api) {
        return new Promise(function (fn_done, fn_fail) {
            $.getJSON(api, function (data) { fn_done(data); });
        }
        );
    }
    const captcha = document.querySelector('#g-recaptcha-response').value;
    console.log("captcha = " + captcha);
    const is_username_avail = await getJsonFromServer(`/auth/is-username-available?username=${username}`);
    const is_email_avail = await getJsonFromServer(`/auth/is-email-available?email=${email}`);
    const is_captcha_avail = await getJsonFromServer(`/auth/is-captcha-available?captcha=${captcha}`);
    console.log("mail: " + is_email_avail);
    console.log("name: " + is_username_avail);
    console.log("captcha_avail: " + is_captcha_avail);

    if (is_email_avail === false) {
        $('#email_duplicate').show();
        $('#email').addClass("border border-danger");
        $("#password").val("");
        $("#password_confirm").val("");
        myPassMeter.checkPasswordAgain("");
        $('#captcha_invalid').show();
    }
    else {
        $('#email_duplicate').hide()
        $('#email').removeClass("border border-danger");
    }

    if (is_username_avail === false) {
        $('#username_duplicate').show();
        $('#username').addClass("border border-danger");
        $("#password").val("");
        $("#password_confirm").val("");
        myPassMeter.checkPasswordAgain("");
        $('#captcha_invalid').show();
    }
    else {
        $('#username_duplicate').hide()
        $('#username').removeClass("border border-danger");
    }


    if (is_captcha_avail === false) {
        $('#captcha_invalid').show();
        $("#password").val("");
        $("#password_confirm").val("");
        myPassMeter.checkPasswordAgain("");
    }
    else {
        $('#captcha_invalid').hide();
    }

    if (is_email_avail && is_username_avail && is_captcha_avail) {
        console.log("submit");
        $(formName).off('submit').submit();
    }
}





// Check Attributes are Valid or not? 
function checkDate(dateString) {
    if (dateString.length === 0) return false;

    // First check for the pattern
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    const dob = moment(dateString, "DD/MM/YYYY");
    console.log("DOB : " + dob + " - " + moment().subtract(10, 'years'));
    if (dob > moment().subtract(10, 'years')) return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);

    console.log(day + " " + month + " " + year);

    // Check the ranges of month and year
    if (year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Adjust for leap years
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    if (!(day > 0 && day <= monthLength[month - 1])) return false;
    return true;
}


// Check Attributes are Valid or not? 
function checkDatePremium(dateString, check_premium) {
    console.log("check_premium :" + check_premium);

    if (!check_premium) {
        $('#txtTimePremium').val("");
        return true;
    }
    console.log(dateString);

    if (dateString.length === 0) return false;

    const time_premium = moment(dateString, "DD/MM/YYYY HH");
    console.log("TIME PREMIUM : ");
    console.log(time_premium < moment());
    if (time_premium < moment()) return false; // Time premium is less than now
    return true;
}


async function checkDuplicateAndSubmitAdmin(formName, username, email) {
    function getJsonFromServer(api) {
        return new Promise(function (fn_done, fn_fail) {
            $.getJSON(api, function (data) { fn_done(data); });
        }
        );
    }
    const is_username_avail = await getJsonFromServer(`/auth/is-username-available?username=${username}`);
    const is_email_avail = await getJsonFromServer(`/auth/is-email-available?email=${email}`);
    console.log("mail: " + is_email_avail);
    console.log("name: " + is_username_avail);
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
        $(formName).off('submit').submit();
    }
}



// Check Attributes are Valid or not? 
function checkEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email) && (email.length <= 40);
}

function checkUsername(username) {
    const re = /^[a-z0-9]+$/;
    return re.test(username) && (username.length >= 5 && username.length <= 20);
}

// Check Attributes are Valid or not? 
function checkPassword() {
    if (parseInt(myPassMeter.getScore()) >= 4)
        return true;
    return false;
}

// Check Attributes are Valid or not? 
function checkName(name) {
    return (name.length > 0) && (name.length <= 40);
}

// Check Attributes are Valid or not? 
function checkConfirmPassword(password, password_confirm) {
    return (password === password_confirm);
}

// Submit Form
$('#frmRegister').on('submit', function (e) {

    e.preventDefault();
    validTestPassed = true;
    $('#captcha_invalid').hide();
    $('#username_duplicate').hide();
    $('#username').removeClass("border border-danger");
    $('#email_duplicate').hide()
    $('#email').removeClass("border border-danger");

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

    const date = $('#date_of_birth').val()
    if (!checkDate(date)) {
        $('#date_of_birth_invalid').show();
        $('#date_of_birth').addClass("border border-danger");
        validTestPassed = false;
    }

    else {
        $('#date_of_birth_invalid').hide()
        $('#date_of_birth').removeClass("border border-danger");
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
        checkDuplicateAndSubmit("#frmRegister", username, email);
    }
    else {
        $("#password").val("");
        $("#password_confirm").val("");
        myPassMeter.checkPasswordAgain("");
        $('#captcha_invalid').show();
    }
    console.log("RESET CAPCHA");
    grecaptcha.reset(
        document.querySelector('#g-recaptcha-response'));
});



$('#frmAdminAddUser').on('submit', function (e) {
    console.log("check form");

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

    const date = $('#date_of_birth').val()
    if (!checkDate(date)) {
        $('#date_of_birth_invalid').show();
        $('#date_of_birth').addClass("border border-danger");
        validTestPassed = false;
    }

    else {
        $('#date_of_birth_invalid').hide()
        $('#date_of_birth').removeClass("border border-danger");
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


    const time_premium = $('#txtTimePremium').val();
    const check_premium = $('#checked_premium').prop('checked');

    if (!checkDatePremium(time_premium, check_premium)) {
        $('#time_premium_invalid').show();
        $('#txtTimePremium').addClass("border border-danger");
        validTestPassed = false;
    }
    else {
        $('#time_premium_invalid').hide();
        $('#txtTimePremium').removeClass("border border-danger");
    }

    // check - nickname
    const check_nickname = $('#check_writer').prop('checked');
    const nickname = $('#nickname').val();
    console.log("CHECK-NICKNAME" + check_nickname);
    if (check_nickname && !checkName(nickname)) {
        $('#nickname_invalid').show();
        $('#nickname').addClass("border border-danger");
        validTestPassed = false;
    }
    else {
        $('#nickname_invalid').hide()
        $('#nickname').removeClass("border border-danger")
    }



    //Check duplicate with Server DBs and submit()
    if (validTestPassed) {
        checkDuplicateAndSubmitAdmin("#frmAdminAddUser", username, email);
    }
    else {
        $("#password").val("");
        $("#password_confirm").val("");
    }
    clickedFlag = false;
});

$('#frmAdminEditUser').on('submit', function (e) {
    console.log("CHECK FORM");
    e.preventDefault();
    validTestPassed = true;
    // if (!clickedFlag) return;
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

    const date = $('#date_of_birth').val()
    if (!checkDate(date)) {
        $('#date_of_birth_invalid').show();
        $('#date_of_birth').addClass("border border-danger");
        validTestPassed = false;
    }

    else {
        $('#date_of_birth_invalid').hide()
        $('#date_of_birth').removeClass("border border-danger");
    }

    ///////////////////////////////////////////////////


    const time_premium = $('#txtTimePremium').val();
    const check_premium = $('#checked_premium').prop('checked');

    if (!checkDatePremium(time_premium, check_premium)) {
        $('#time_premium_invalid').show();
        $('#txtTimePremium').addClass("border border-danger");
        validTestPassed = false;
    }
    else {
        $('#time_premium_invalid').hide();
        $('#txtTimePremium').removeClass("border border-danger");
    }

    const check_nickname = $('#check_writer').prop('checked');
    const nickname = $('#nickname').val();
    if (check_nickname && !checkName(nickname)) {
        $('#nickname_invalid').show();
        $('#nickname').addClass("border border-danger");
        validTestPassed = false;
    }
    else {
        $('#nickname_invalid').hide()
        $('#nickname').removeClass("border border-danger")
    }


    //Check duplicate with Server DBs and submit()
    if (validTestPassed) {
        console.log("submit");
        $('#frmAdminEditUser').off('submit').submit();
    }
    else {
    }
});