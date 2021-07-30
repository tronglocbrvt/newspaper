$(document).ready(function () {
    var tag_list = [];
    const url = window.location.href;
    const id = url.substr(url.lastIndexOf('/') - 1, 1);

    $.ajax({
        url: '/categories/getsubcats'
    }).done(function (data) {
        set_sub_cats(1, data);
        $('#category').on('change', function () {
            set_sub_cats(+this.value, data);
        });
    })

    $.ajax({
        url: '/tags'
    }).done(function (data) {
        tags = [];
        data.map(function (tag) {
            tags.push(tag.tag_name);
        })
        $('#btn-add-tag').click(function (e) {
            $('#alert-area').empty();
            var input_tag = $('#tags').val();
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
                        var delete_btn = $('<div class="btn btn-outline-danger"></div>').addClass('delete-btn').attr('value', input_tag)
                            .append(delete_icon);
                        element.append(tag_btn).append(delete_btn);
                        $('#tag-area').append(element);
                        tag_list.push(input_tag);
                    }
                }
            }
            else {
                $('#alert-area').text('Tag không hợp lệ');
            }
            $('#tags').val('').focus();

            $('.delete-btn').click(function () {
                const delete_tag = $(this).attr('value');
                const index = tag_list.indexOf(delete_tag);
                if (index > -1) {
                    tag_list.splice(index, 1);
                }
                $(this).parent().remove();
            });
        })
    });

    $('#save_draft').click(function (e) {
        const tags = tag_list.toString();
        $("<input />").attr("type", "hidden")
            .attr("name", "tags")
            .attr("value", tags)
            .appendTo("#form1");

        $("#form1").submit();
    });

    $('#submit').click(function (e) {
        const tags = tag_list.toString();
        $("<input />").attr("type", "hidden")
            .attr("name", "tags")
            .attr("value", tags)
            .appendTo("#form1");

        $("<input />").attr("type", "hidden")
            .attr("name", "is_submit")
            .attr("value", "1")
            .appendTo("#form1");

        $("#form1").submit();
    });
});

function set_sub_cats(id, data) {
    $('#sub_category').empty();
    sub_cats = data.filter(cat => cat.parent_category_id === +id);
    for (let i = 0; i < sub_cats.length; i++) {
        var element = $('<option></option>').attr('value', sub_cats[i].category_id).text(sub_cats[i].category_name);
        $('#sub_category').append(element);
    }
}