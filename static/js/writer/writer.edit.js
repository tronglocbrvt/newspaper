$(document).ready(function () {
    var tag_list = [];
    var tags = [];
    const url = window.location.href;
    const id = url.substr(url.lastIndexOf('/') + 1, url.length);

    $.ajax({
        url: '/writers/get_content_cat_tag/' + id
    }).done(function (data1) {
        $("#content").summernote("code", data1.article_content);
        $('#category').find(`option[value="${data1.main_category}"]`).attr('selected', 'selected');

        $.ajax({
            url: '/categories/getsubcats'
        }).done(function (data2) {
            set_sub_cats(data1.main_category, data2);
            $('#category').on('change', function () {
                set_sub_cats(+this.value, data2);
            });

            $('#sub_category').find(`option[value=${data1.sub_category}]`).attr('selected', 'selected');
        });

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

            const ori_tags = tag_list.toString();
            $("<input />").attr("type", "hidden")
                .attr("name", "original_tags")
                .attr("value", ori_tags)
                .appendTo("#form1");

            $('#title').focus();

            $('#btn-add-tag').click(function () {
                var input_tag = $('#tags').val();
                add_tag(input_tag);
            });
        });
    });

    $("#btn_edit_avatar").click(function () {
        $("#upload_conainter").attr('hidden', false);
        $("#avatar").fileinput({
            allowedFileExtensions: ['jpg', 'jpeg', 'png'],
            dropZoneEnabled: false
        });
        $(this).attr('hidden', true);
        $("#avatar_container").attr('hidden', true);
    })

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
        $('#alert-area').empty();
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
    }

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
