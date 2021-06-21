$(document).ready(function(){
    console.log("ready");
    $.ajax({
        url: 'categories/getsubcats'
    }).done(function(data){
        $('.nav-link2').hover(
            function(){
                const id = $(this).attr('id');
                $('#ul-sub-nav').empty();
                sub_cats = data.filter(cat => cat.parent_cat === +id);
                for (let i = 0; i < sub_cats.length; i++) {
                    var element = $('<li></li>').addClass('nav-item')
                                    .append('a').addClass('subnav-link').attr('href', '#').text(sub_cats[i].cat_name);
                    $('#ul-sub-nav').append(element);
                }
                $('#sub-nav').attr("hidden", false);
            },
            function(){
                $('#sub-nav').attr("hidden", true);
            });
    });
});