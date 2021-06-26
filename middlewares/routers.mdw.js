module.exports=function(app){
    app.get('/', function (req, res){
        res.render('home')
    });
    app.use('/categories', require('../controllers/category.router'));
    app.use('/categories/:category_id', function(req, res, next) {
        req.cat_id = req.params.category_id;
        next();
    }, require('../controllers/subcategory.router'));
    app.use('/article',require('../controllers/article.router'))
};