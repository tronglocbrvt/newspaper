module.exports=function(app){
    app.use('/', require('../controllers/home.router'));
    app.use('/categories', require('../controllers/category.router'));
    app.use('/article',require('../controllers/article.router'))
};