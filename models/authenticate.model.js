const db = require('../utils/db')

module.exports =
{
    add_new_user(user)
    {
        return db('users').insert(user);
    }
    ,
    findByUsername(username)
    {
        return db('users').where('user_name',username);
    },
    findByEmail(email)
    {
        return db('users').where('email',email);
    }
}