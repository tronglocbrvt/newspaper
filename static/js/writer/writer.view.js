$(document).ready(function () {
    var tag_list = [];
    var tags = [];
    const url = window.location.href;
    const id = url.substr(url.lastIndexOf('/') + 1, url.length);

    $.ajax({
        url: '/writers/get_content_cat_tag/' + id
    }).done(function (data1) {
        $("#content").html(data1.article_content);
        $('#category').val(data1.main_category_name);
        $('#sub_category').val(data1.sub_category_name);

        $.ajax({
            url: '/tags'
        }).done(function (data3) {

            data3.map(function (tag) {
                tags.push(tag.tag_name);
            });

            data1.tags.map(function (tag) {
                add_tag(tag.tag_name);
                tag_list.push(tag.tag_name);
            })

            $('#title').focus();

        });
    });

    function set_sub_cats(id, data) {
        $('#sub_category').empty();
        sub_cats = data.filter(cat => cat.parent_category_id === +id);
        for (let i = 0; i < sub_cats.length; i++) {
            var element = $('<option></option>').attr('value', sub_cats[i].category_id).text(sub_cats[i].category_name);
            $('#sub_category').append(element);
        }
        const empty_element = $('<option></option>').attr('value', 0).text('---------');
        $('#sub_category').append(empty_element);
    }

    function add_tag(input_tag) {
        if (tags.includes(input_tag)) {
            if (tag_list.includes(input_tag)) {
                $('#alert-area').text('Bạn đã chọn tag');
            } else {
                if (tag_list.length > 10) {
                    $('#alert-area').text('Bạn đã chọn vượt quá 10 tag');
                }
                else {
                    var element = $('<div class="btn-group mr-3 mb-3" role="group"></div>');
                    var tag_btn = $('<div class="btn btn-outline-primary"></div>').text(input_tag);
                    var delete_icon = $('<i class="fa fa-trash"></i>')
                    element.append(tag_btn);
                    $('#tag-area').append(element);
                    tag_list.push(input_tag);
                }
            }
        }
        else {
            $('#alert-area').text('Tag không hợp lệ');
        }
        $('#tags').val('').focus();
    }
});
