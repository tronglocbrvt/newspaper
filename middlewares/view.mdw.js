const exphbs = require('express-handlebars');
const hbs_sections = require('express-handlebars-sections');

var hbs = exphbs.create({});

// register new function
hbs.handlebars.registerHelper('date_format', function (str) {
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
});


hbs.handlebars.registerHelper('date_format_2', function (str) {
  if (!str) return null;
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
  return month + "/" + dt + "/" + year;
});



hbs.handlebars.registerHelper('date_time_format', function (str) {
  if (!str) return null;
  var date = new Date(str);
  return date.toLocaleString("en-US");
});

hbs.handlebars.registerHelper('is_editable', function (str) {
  if (str === "Đã xuất bản" || str === "Chờ xuất bản")
    return false
  return true
})

hbs.handlebars.registerHelper('get_status_color', function (str) {
  if (str === "Đã xuất bản")
    return "success";
  if (str === "Từ chối")
    return "danger";
  if (str === "Chờ xét duyệt")
    return "primary";
  if (str === "Chờ xuất bản")
    return "success";
  if (str === "Bản nháp")
    return "dark";
})

hbs.handlebars.registerHelper('gen_gender', function (value) {
  if (value === 0)
    return "Nữ";
  if (value === 1)
    return "Nam";
  return "Khác"
});

module.exports = function (app) {
  app.engine('hbs', exphbs({
    defaultLayout: 'main.hbs',
    helpers: {
      section: hbs_sections()
    }
  }));
  app.set('view engine', 'hbs');
}
