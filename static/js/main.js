$(document).ready(function(){
    console.log("ready");
    $.ajax({
        url: '/categories/getsubcats'
    }).done(function(data){
        $('.nav-link2').hover(
            function(){
                const id = $(this).attr('id');
                $('#ul-sub-nav').empty();
                sub_cats = data.filter(cat => cat.parent_category_id === +id);
                for (let i = 0; i < sub_cats.length; i++) {
                    var element = $('<li></li>').addClass('nav-item')
                    var link = $('<a></a>').addClass('subnav-link').attr('href', '#').text(sub_cats[i].category_name);
                    element.append(link);
                    $('#ul-sub-nav').append(element);
                }
                $('#sub-nav').attr("hidden", false);
            },
            function(){
                $('#sub-nav').attr("hidden", true);
            });
    });

    $('#sub-nav').hover(function(){
        $('#sub-nav').attr('hidden', false);
    },
    function(){
        $('#sub-nav').attr('hidden', true);
    });
});