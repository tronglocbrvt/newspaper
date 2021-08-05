$(document).ready(function () {
    console.log("ready");
    $.ajax({
        url: '/categories/getsubcats'
    }).done(function (data) {
        for(let i = 0; i < data.length; i++) {
            cat = data[i];
            element = $("<a></a>")
                .addClass("dropdown-item")
                .attr('href', '/categories/' + cat.parent_category_id + '/subs/' + cat.category_id)
                .text(cat.category_name);
            $("#dropdown" + cat.parent_category_id).append(element);

            element = $("<a></a>")
            .addClass("text-primary mr-3")
            .attr('href', '/categories/' + cat.parent_category_id + '/subs/' + cat.category_id)
            .text(cat.category_name);
            $("#side_maincat" + cat.parent_category_id).append(element);
        }

        $('.nav-link2').hover(
            function () {
                const id = $(this).attr('id');
                $('#ul-sub-nav').empty();
                sub_cats = data.filter(cat => cat.parent_category_id === +id);
                for (let i = 0; i < sub_cats.length; i++) {
                    var element = $('<li></li>').addClass('nav-item')
                    var link = $('<a></a>').addClass('subnav-link').attr('href', '/categories/' + id + '/subs/' + sub_cats[i].category_id).text(sub_cats[i].category_name);
                    element.append(link);
                    $('#ul-sub-nav').append(element);
                }
                $('#sub-nav').attr("hidden", false);
            },
            function () {
                $('#sub-nav').attr("hidden", true);
            });
    });

    $('#sub-nav').hover(function () {
        $('#sub-nav').attr('hidden', false);
    },
        function () {
            $('#sub-nav').attr('hidden', true);
        });

    $('#search').click(function () {
        $('#search-bar').toggle();
    });
});