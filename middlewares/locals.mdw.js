const categoryModel = require('../models/category.model')
module.exports = function(app){
    app.use(async function (req, res, next) {
    categories = await categoryModel.all();
    main_cat = categories.filter(category => category.parent_category_id === null);
    sub_cat = categories.filter(category => category.parent_category_id !== null);
    main_cat = main_cat.map(cat => {
        cat.category_name = cat.category_name.toUpperCase()
        return cat;
    });
    res.locals.main_cat = main_cat;
    res.locals.sub_cat = sub_cat;
    next();
  });
};