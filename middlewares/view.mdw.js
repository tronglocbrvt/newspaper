const exphbs = require('express-handlebars');
const hbs_sections = require('express-handlebars-sections');
const moment = require('moment');
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

hbs.handlebars.registerHelper('render_gender', function (gender) {
  if (gender === -1) {
    console.log(gender);
    return `<option selected value="-1">Khác</option>
              <option value="1">Nam</option>
              <option value="0">Nữ</option>`
  }
  else if (gender === 0) {
    return `<option value="-1">Khác</option>
    <option value="1">Nam</option>
    <option selected value="0">Nữ</option>`
  }
  else if (gender === 1) {
    return `<option value="-1">Khác</option>
    <option selected value="1">Nam</option>
    <option  value="0">Nữ</option>`
  }
});


hbs.handlebars.registerHelper('render_categories', function (categories, selected_categories) {
  result = "";
  for (let i = 0; i < categories.length; ++i) {
    let selected = false;
    for (let j = 0; j < selected_categories.length; ++j) {
      if (categories[i].category_id === selected_categories[j].category_id) {
        selected = true;
        break;
      }
    }
    if (!selected)
      result += `<option value="` + categories[i].category_id + `">` + categories[i].category_name + `</option>`;
    else
      result += `<option selected value="` + categories[i].category_id + `">` + categories[i].category_name + `</option>`;
  }
  return result;
}
);


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
  return dt + "/" + month + "/" + year;
});



hbs.handlebars.registerHelper('date_time_format', function (str) {
  if (!str) return null;
  const result = moment(str).format("DD/MM/YYYY HH");
  return result;
});

hbs.handlebars.registerHelper('is_editable', function (str) {
  if (str === "Đã xuất bản" || str === "Chờ xuất bản" || str === "Chờ xét duyệt")
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

hbs.handlebars.registerHelper('is_empty_array', function(value){
  if(value.length < 1)
    return true
  return false
})

hbs.handlebars.registerHelper('gen_gender', function (value) {
  if (value === 0)
    return "Nữ";
  if (value === 1)
    return "Nam";
  return "Khác"
});

hbs.handlebars.registerHelper('is_submitted', function (str) {
  if (str === "Chờ xét duyệt")
    return true;
  return false;
})

module.exports = function (app) {
  app.engine('hbs', exphbs({
    defaultLayout: 'main.hbs',
    helpers: {
      section: hbs_sections()
    }
  }));
  app.set('view engine', 'hbs');
}
