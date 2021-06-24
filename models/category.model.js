const db = require('../utils/db')

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

    get_sub_cats_by_cat_id(cat_id) {
        const sql = `select distinct category_name
        from categories
        where parent_category_id is not null
        and parent_category_id = ?`;
        sub_cats = db.raw(sql, cat_id);
        return sub_cats;
    }
}