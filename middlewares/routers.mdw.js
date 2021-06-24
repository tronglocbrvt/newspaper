module.exports=function(app){
    app.get('/', function (req, res){
        res.render('home')
    });
    app.use('/categories', require('../controllers/category.router'));
    app.use('/article',require('../controllers/article.router'))
};