$(document).ready(function(){
    setFilters();
})

function clickCollapse(id) {
    tab = id[id.length - 1];
    redirect();
}

function clickWriter(id){
    writer_id = id;
    redirect();
}

function clickMainCat(id){
    main_cat = id;
    sub_cat = '0';
    redirect();
}

function clickSubCat(id){
    sub_cat = id;
    redirect();
}

function clickTag(id){
    tag_id = id;
    redirect();
}

function clickPage(id){
    page = id;
    redirect();
}

function redirect(){
    writer = writer_id !== '0' ? `&writer=${writer_id}` : '';
    tag = tag_id !== '0' ? `&tag=${tag_id}` : '';
    main_cat = main_cat !== '0' ? `&main_cat=${main_cat}` : '';
    sub_cat = sub_cat !== '0' ? `&sub_cat=${sub_cat}` : '';
    page = +page > 1 ? `&page=${page}` : '';

    window.location.href = `/admin/articles?tab=${tab}${writer}${tag}${main_cat}${sub_cat}${page}`;
}

function setFilters(){
    console.log(writer_id)
    $("#btn" + tab).removeClass('btn-dark').addClass('btn-success');
    $('#writers').find(`option[value=${writer_id}]`).attr('selected', 'selected');
    $('#main_cat').find(`option[value=${main_cat}]`).attr('selected', 'selected');
    $('#sub_cat').find(`option[value=${sub_cat}]`).attr('selected', 'selected');
    $('#tags').find(`option[value=${tag_id}]`).attr('selected', 'selected');
}