// Check Attributes are Valid or not? 
function checkPassword() {
    if (parseInt(myPassMeter.getScore()) >= 4)
        return true;
    return false;
}

// Check Attributes are Valid or not? 
function checkConfirmPassword(password, password_confirm) {
    return (password === password_confirm);
}

// Submit Form Change Password
$('#frmResetPassword').on('submit', function (e) {

    e.preventDefault();
    validTestPassed = true;

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
    else 
    {
        $('#password_confirm_invalid').hide();
        $('#password_confirm').removeClass("border border-danger");
    }

    // Check duplicate with Server DBs and submit()
    if (validTestPassed) {
        console.log("submit");
        $('#frmResetPassword').off('submit').submit();
    }
});
