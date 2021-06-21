const categoryModel = require('../models/category.model')
module.exports = function(app){
    app.use(async function (req, res, next) {
    categories = await categoryModel.all();
    main_cat = categories.filter(category => category.parent_cat === null);
    sub_cat = categories.filter(category => category.parent_cat !== null);
    main_cat = main_cat.map(cat => {
        cat.cat_name = cat.cat_name.toUpperCase()
        return cat;
    });
    res.locals.main_cat = main_cat;
    res.locals.sub_cat = sub_cat;
    next();
  });
};