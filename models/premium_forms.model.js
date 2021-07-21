const db = require('../utils/db')

module.exports =
{
    add_new_form(form)
    {
        return db('premium_forms').insert(form);
    }
}