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
        $('#frmRegister').off('submit').submit();
    }
}



// Check Attributes are Valid or not? 
function checkDate(dateString) {
    if (dateString.length === 0) return false;

    // First check for the pattern
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
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








// Submit Form Change Password
$('#frmChangePassword').on('submit', function (e) {

    e.preventDefault();
    validTestPassed = true;

    ///////////////////////////////////////////////////

    if (!checkPassword()) {
        $('#password_invalid').show();
        $('#password').addClass("border border-danger");
        $("#password").val("");
        $("#password_confirm").val("");
        $("#old-password").val("");
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
        $("#old-password").val("");
        validTestPassed = false;
        myPassMeter.checkPasswordAgain("");
    }
    else {
        $('#password_confirm_invalid').hide();
        $('#password_confirm').removeClass("border border-danger");
    }

    // Check duplicate with Server DBs and submit()
    if (validTestPassed) {
        console.log("submit");
        $('#frmChangePassword').off('submit').submit();
    }
});



// Check Attributes are Valid or not? 
function checkName(name) {
    return (name.length > 0);
}

$('#frmName').on('submit', function (e) {

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

    if (validTestPassed) {
        console.log("submit");
        $('#frmName').off('submit').submit();
    }

});



// Check Attributes are Valid or not? 
function checkDate(dateString) {
    if (dateString.length === 0) return false;

    // First check for the pattern
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
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


$('#frmDOB').on('submit', function (e) {

    e.preventDefault();
    validTestPassed = true;

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

    if (validTestPassed) {
        console.log("submit");
        $('#frmDOB').off('submit').submit();
    }

});



