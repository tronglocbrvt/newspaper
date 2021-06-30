module.exports = function (app) {
    app.use('/', require('../controllers/home.router'));
    app.use('/categories', require('../controllers/category.router'));
    app.use('/articles', require('../controllers/article.router'));
    app.use('/auth',require('../controllers/authenticate.router'));
    app.use('/categories/:category_id', function (req, res, next) {
        req.cat_id = req.params.category_id;
        next();
    }, require('../controllers/subcategory.router'));
    app.use('/tags', require('../controllers/tag.router'));
}