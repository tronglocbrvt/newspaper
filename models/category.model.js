const db = require('../utils/db')
// const list = [
//     {catID: 1, catName:'Mobile'},
//     {catID: 2, catName: 'Laptop'},
//     {catID: 3, catName: 'Clothes'}
// ]


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
        where parent_cat is not null`;
        sub_cats = db.raw(sql);
        return sub_cats;
    }
}