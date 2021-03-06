module.exports = function (app) {
    app.use('/', require('../controllers/home.router'));
    app.use('/categories', require('../controllers/category.router'));
    app.use('/articles', require('../controllers/article.router'));
    app.use('/auth',require('../controllers/authenticate.router'));
    // get cat_id and pass to route
    app.use('/categories/:category_id', function (req, res, next) {
        req.cat_id = req.params.category_id;
        next();
    }, require('../controllers/subcategory.router'));
    app.use('/tags', require('../controllers/tag.router'));
    app.use('/writers', require('../controllers/writer.router'));
    app.use('/search', require('../controllers/search.router'));
    app.use('/profile', require('../controllers/profile.router'));
    app.use('/admin',require('../controllers/admin.router'));
    app.use('/admin/users',require('../controllers/admin.user.router'));
    app.use('/editors', require('../controllers/editor.router'));
    app.use('/admin/categories', require('../controllers/admin.categories.router'));
    app.use('/admin/articles', require('../controllers/admin.articles.router'));
    app.use('/admin/categories/:category_id', function (req, res, next) {
        req.cat_id = req.params.category_id;
        next();
    }, require('../controllers/admin.subcategories.router'));
    app.use('/admin/tags', require('../controllers/admin.tags.router'));
}