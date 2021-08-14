$(document).ready(function () {
    var tag_list = [];
    var tags = [];

    $('#category').val(main_cat_name);
    $('#sub_category').val(main_cat_name);
    $('#main_cat_reset').find(`option[value="${+main_cat}"]`).attr('selected', 'selected');

    $.ajax({
        url: '/categories/getsubcats'
    }).done(function (data) {
        set_sub_cats(main_cat, data);
        $('#main_cat_reset').on('change', function () {
            set_sub_cats(+this.value, data);
        });

        $('#sub_cat_reset').find(`option[value=${sub_cat}]`).attr('selected', 'selected');
    });

    $.ajax({
        url: '/tags'
    }).done(function (data) {
        data.map(function (tag) {
            tags.push(tag.tag_name);
        });

        $('.btn-outline-primary').map(function () {
            add_tag_reset(this.innerHTML);
            tag_list.push(this.innerHTML);
        })

        const ori_tags = tag_list.toString();
        $("<input />").attr("type", "hidden")
            .attr("name", "original_tags")
            .attr("value", ori_tags)
            .appendTo("#form");

        $('#title').focus();

        $('#btn-add-tag').click(function () {
            var input_tag = $('#tags').val();
            add_tag_reset(input_tag);
            tag_list.push(input_tag);
        });
    })

    jQuery('#publish-time').datetimepicker({
        format: 'd/m/Y H:i'
    });


    $("#publish-time").on('change', function () {
        $("#date-alert-area").empty();
        if ($("#publish-time").val() !== '') {
            date_picked = stringToDatetime($("#publish-time").val());
            if (!isValidDate(date_picked)) {
                $("#date-alert-area").text('Ngày không hợp lệ!');
            }
        }
    })

    $("#form").submit(function (e) {
        const new_tags = tag_list.toString();

        date_picked = stringToDatetime($("#publish-time").val());
        if (!isValidDate(date_picked)) {
            alert('Vui lòng chọn ngày hợp lệ');
            e.preventDefault();
            return false;
        }
        
        $("<input />").attr("type", "hidden")
            .attr("name", "tags")
            .attr("value", new_tags)
            .appendTo("#form");
        return true;
    })

    function set_sub_cats(id, data) {
        $('#sub_cat_reset').empty();
        sub_cats = data.filter(cat => cat.parent_category_id === +id);
        for (let i = 0; i < sub_cats.length; i++) {
            var element = $('<option></option>').attr('value', sub_cats[i].category_id).text(sub_cats[i].category_name);
            $('#sub_cat_reset').append(element);
        }
    }

    function add_tag_reset(input_tag) {
        $('#tag-alert-area').empty();
        if (tags.includes(input_tag)) {
            if (tag_list.includes(input_tag)) {
                $('#tag-alert-area').text('Bạn đã chọn tag');
            } else {
                if (tag_list.length > 10) {
                    $('#tag-alert-area').text('Bạn đã chọn vượt quá 10 tag');
                }
                else {
                    var element = $('<div class="btn-group mr-3 mb-3" role="group"></div>');
                    var tag_btn = $('<div class="btn btn-primary"></div>').text(input_tag);
                    var delete_icon = $('<i class="fa fa-trash"></i>')
                    var delete_btn = $('<div class="btn btn-danger"></div>').addClass('delete-btn').attr('value', input_tag)
                        .append(delete_icon);
                    element.append(tag_btn).append(delete_btn);
                    $('#tag-area-reset').append(element);
                }
            }
        }
        else {
            $('#tag-alert-area').text('Tag không hợp lệ');
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

    function stringToDatetime(responseDate) {
        let dateComponents = responseDate.split(' ');
        let datePieces = dateComponents[0].split("/");
        let timePieces = dateComponents[1].split(":");
        return (new Date(datePieces[2], (datePieces[1] - 1), datePieces[0],
            timePieces[0], timePieces[1]))
    }

    function isValidDate(date) {
        today = new Date();
        if (date_picked.getTime() < today.getTime()) {
            return false;
        }
        return true;
    }
})