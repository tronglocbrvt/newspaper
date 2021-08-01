function check_tag_name(tag_name) {
    if (tag_name.startsWith("#") && /^[A-Za-z0-9].*/.test(tag_name[1])) {
        return true;
    }
    return false;
};

$(document).ready(function () {
    $("form").on('submit', function (e) {
        validTestPassed = true;
        const name = $('#txtTagName').val();
        if (!check_tag_name(name)) {
            $('#error_message').hide();
            $('#name_invalid').show();
            $('#txtTagName').addClass("border border-danger");
            validTestPassed = false;
        }
        if (validTestPassed) {
            return $("form").off('submit').submit();
        }
        e.preventDefault();
    });
});