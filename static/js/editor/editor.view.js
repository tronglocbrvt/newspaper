$(document).ready(function () {
    var state = 0;
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
        $('#main_cat_reset').find(`option[value="${data1.main_category}"]`).attr('selected', 'selected');
        // $('#sub_cat_reset').append(`<option selected>${data1.sub_category_name}</option>`);

        $.ajax({
            url: '/categories/getsubcats'
        }).done(function (data2) {
            set_sub_cats(data1.main_category, data2);
            $('#main_cat_reset').on('change', function () {
                set_sub_cats(+this.value, data2);
            });

            $('#sub_cat_reset').find(`option[value=${data1.sub_category}]`).attr('selected', 'selected');
        });

        $.ajax({
            url: '/tags'
        }).done(function (data3) {

            data3.map(function (tag) {
                tags.push(tag.tag_name);
            });

            data1.tags.map(function (tag) {
                add_tag(tag.tag_name);
                add_tag_reset(tag.tag_name);
                tag_list.push(tag.tag_name);
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

        });
    });

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

    $("#accept").change(function () {
        if (this.checked) {
            state = 1;
            showStateAccept();
            hideStateReject()
        } else {
            hideStateAccept();
            state = 0;
        }
    })

    $("#reject").change(function () {
        if (this.checked) {
            state = 2;
            showStateReject();
            hideStateAccept();
        } else {
            hideStateReject();
            state = 0;
        }
    })

    $("#form").submit(function (e) {
        if (state === 0) {
            alert('Vui lòng chọn DUYỆT hoặc TỪ CHỐI');
            e.preventDefault();
            return false;
        }

        if (state === 1) {
            if ($("#publish-time").val() !== '') {
                date_picked = stringToDatetime($("#publish-time").val());
                if (!isValidDate(date_picked)) {
                    alert('Vui lòng chọn ngày hợp lệ');
                    e.preventDefault();
                    return false;
                }
            }
        }

        const tags = tag_list.toString();
        $("<input />").attr("type", "hidden")
            .attr("name", "tags")
            .attr("value", tags)
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

    function add_tag(input_tag) {
        if (tags.includes(input_tag)) {
            var element = $('<div class="btn-group mr-3 mb-3" role="group"></div>');
            var tag_btn = $('<div class="btn btn-outline-primary"></div>').text(input_tag);
            element.append(tag_btn);
            $('#tag-area').append(element);
        }
        $('#tags').val('').focus();
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

    function showStateAccept() {
        $('#reject').prop('checked', false);
        $("#main_cat_reset, #sub_cat_reset, #tag-area-reset, #tag-group, #publish-time").attr('hidden', false);
        $("#main_cat_readonly, #sub_cat_readonly, #tag_readonly, #date_readonly").attr('hidden', true);
        $("#publish-time").attr("required", true);
    }

    function hideStateAccept() {
        $("#main_cat_reset, #sub_cat_reset, #tag-area-reset, #tag-group, #publish-time").attr('hidden', true);
        $("#main_cat_readonly, #sub_cat_readonly, #tag_readonly, #date_readonly").attr('hidden', false);
        $("#publish-time").attr("required", false);
    }

    function showStateReject() {
        $('#accept').prop('checked', false);
        $("#comment").attr('disabled', false).attr('required', true);
    }

    function hideStateReject() {
        $("#comment").attr('disabled', true).attr('required', false);
    }
});
