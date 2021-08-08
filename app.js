const express = require('express');
const morgan = require('morgan');
const app = express();
const fileUpload = require('express-fileupload')

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(fileUpload())

app.use('/static', express.static('static'));

require('./middlewares/session.mdw')(app);
require('./middlewares/passport.mdw')(app);
require('./middlewares/view.mdw')(app);
require('./middlewares/locals.mdw')(app);
require('./middlewares/routers.mdw')(app);
require('./middlewares/error.mdw')(app);

const PORT = 3000;
app.listen(process.env.PORT || PORT, function () {
    console.log('Server listening at port ' + PORT);
})