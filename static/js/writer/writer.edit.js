$(document).ready(function () {
    var tag_list = [];
    var tags = [];

    $('#category').find(`option[value="${main_cat}"]`).attr('selected', 'selected');
    $.ajax({
        url: '/categories/getsubcats'
    }).done(function (data) {
        set_sub_cats(main_cat, data);
        $('#category').on('change', function () {
            set_sub_cats(+this.value, data);
        });

        $('#sub_category').find(`option[value=${sub_cat}]`).attr('selected', 'selected');
    });

    $.ajax({
        url: '/tags'
    }).done(function (data) {
        data.map(function (tag) {
            tags.push(tag.tag_name);
            $("#tag-list").append($(`<option value="${tag.tag_name}">${tag.tag_name}</option>`));
        });

        $('.tag_ori').map(function () {
            tag_list.push(this.innerHTML);
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
            tag_list.push(input_tag);
        });
    });

    $("#btn_edit_avatar").click(function () {
        $("#upload_conainter").attr('hidden', false);
        $("#avatar").fileinput({
            allowedFileExtensions: ['jpg', 'jpeg', 'png'],
            dropZoneEnabled: false,
            'showUpload': false
        });
        $(this).attr('hidden', true);
        $("#avatar_container").attr('hidden', true);
    })

    $('#content').summernote({
        placeholder: 'Nhập nội dung',
        tabsize: 2,
        height: 300
    });

    function set_sub_cats(id, data) {
        $('#sub_category').empty();
        sub_cats = data.filter(cat => cat.parent_category_id === +id);
        for (let i = 0; i < sub_cats.length; i++) {
            var element = $('<option></option>').attr('value', sub_cats[i].category_id).text(sub_cats[i].category_name);
            $('#sub_category').append(element);
        }
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

    $("#form1").submit(function (e) {
        const tags = tag_list.toString();
        $("<input />").attr("type", "hidden")
            .attr("name", "tags")
            .attr("value", tags)
            .appendTo("#form1");

        $("<input />").attr("type", "hidden")
            .attr("name", "ori_avatar_url")
            .attr("value", avatar_url)
            .appendTo("#form1");

        return true;
    })
});
