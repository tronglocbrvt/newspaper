module.exports = function (app) {
  app.use(function (req, res) {
    res.status(404);
    res.render('vwError/viewNotFound');
  });

  app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('vwError/viewInternalServerErr')
  })
}