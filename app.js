const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(morgan('dev'));
app.use(express.urlencoded({
    extended: true
}));

app.use('/static', express.static('static'));


require('./middlewares/session.mdw')(app);
require('./middlewares/passport.mdw')(app);
require('./middlewares/view.mdw')(app);
require('./middlewares/locals.mdw')(app);
require('./middlewares/routers.mdw')(app);

const PORT = 3000
app.listen(PORT, function () {
    console.log('Server listening at port ' + PORT);
})