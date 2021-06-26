const exphbs = require('express-handlebars');
const hbs_sections = require('express-handlebars-sections');

var hbs = exphbs.create({});

// register new function
hbs.handlebars.registerHelper('date_format', function(str) {
    date = new Date(str);
    year = date.getFullYear();
    month = date.getMonth() + 1;
    dt = date.getDate();
  
    if (dt < 10) {
      dt = "0" + dt;
    }
    if (month < 10) {
      month = "0" + month;
    }
    return dt + "-" + month + "-" + year
})

module.exports = function(app){
    app.engine('hbs', exphbs({
        defaultLayout: 'main.hbs',
        helpers:{
            section: hbs_sections()
        }
    }));
    app.set('view engine', 'hbs');
}
