const db = require('../utils/db')

module.exports =
{
    add_new_comment(comment)
    {
        return db('comments').insert(comment);
    }
}