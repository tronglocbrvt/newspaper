const db = require('/utils/db')

module.exports={
    all(){
          return db('categories');
    },
    
    add(category){
        return db('categories').insert(category);
    },

    get_sub_cats(){
        const sql = `select *
        from categories
        where parent_category_id is not null`;
        sub_cats = db.raw(sql);
        return sub_cats;
    },

    // get list sub-cat of parent category
    get_sub_cats_by_cat_id(cat_id) {
        const sql = `select distinct category_name, category_id
        from categories
        where parent_category_id is not null
        and parent_category_id = ?`;
        sub_cats = db.raw(sql, cat_id);
        return sub_cats;
    },

    get_main_cats(){
        const sql = `select *
        from categories
        where parent_category_id is null`;
        main_cats = db.raw(sql);
        return main_cats;
    },

    get_parent_cat_by_id(cat_id){
        const sql = `select *
        from categories
        where category_id = ?`;
        return db.raw(sql, cat_id);
    },
    // get name and id of parent category
    get_name_by_cat_id(cat_id) {
        const sql = `select if(c2.category_name is null, c1.category_name, c2.category_name) as name,
        if(c2.category_name is null, c1.category_id, c2.category_id) as id
        from categories as c1 left join categories as c2
            on c1.parent_category_id = c2.category_id
        where c1.category_id = ?`;
        name_cat = db.raw(sql, cat_id);
        return name_cat;
    },

    //get name by cat id
    get_name_by_id(cat_id){
        const sql = `select c.category_name as category_name
        from categories c
        where c.category_id = ?`
        return db.raw(sql, cat_id);
    },
    
    find_by_cat_id(cat_id) {
        return db('categories').where('category_id', cat_id);
    },

    patch(cat_id, cat_name) {
        return db('categories').where('category_id', cat_id).update({category_name: cat_name});
    },

    patch_subcat(cat_id, cat_name, parent_cat_id) {
        return db('categories').where('category_id', cat_id).update({category_name: cat_name, parent_category_id: parent_cat_id});
    },

    delete(cat_id) {
        return db('categories').where('category_id', cat_id).del();
    },

    count_main_cat(){
        const sql = `select count(*) as total
        from categories
        where parent_category_id is null`;
        return db.raw(sql);
    },

    list_main_cat(offset){
        const sql = `select *
        from categories
        where parent_category_id is null
        limit 10 offset ?`;
        main_cats = db.raw(sql, offset);
        return main_cats;
    },

    count_articles_in_cat(cat_id) {
        const sql = `select count(*) as count
        from articles as a, categories as c
        where a.category_id = c.category_id
            and c.parent_category_id = ?`;
        return db.raw(sql, cat_id);
    },

    count_sub_cats_by_cat_id(cat_id) {
        const sql = `select count(*) as total
        from categories
        where parent_category_id is not null
        and parent_category_id = ?`;
        sub_cats = db.raw(sql, cat_id);
        return sub_cats;
    },

    list_sub_cats_by_cat_id(cat_id, offset) {
        const sql = `select distinct category_name, category_id
        from categories
        where parent_category_id is not null
        and parent_category_id = ${cat_id}
        limit 10 offset ${offset}`;
        sub_cats = db.raw(sql);
        return sub_cats;
    },

    count_articles_in_subcat(subcat_id) {
        const sql = `select count(*) as count
        from articles as a
        where a.category_id = ?`;
        return db.raw(sql, subcat_id);
    },

    search_by_cat_name(cat_name) {
        const sql = `select * from categories where category_name = '${cat_name}'`;
        return db.raw(sql);
    }
}