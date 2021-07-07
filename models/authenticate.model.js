const db = require('../utils/db')

module.exports =
{
    add_new_user(user) {
        return db('users').insert(user);
    }
    ,
    findByUsername(username) {
        return db('users').where('user_name', username);
    },
    findByEmail(email) {
        return db('users').where('email', email);
    },

    change_password(username, hash) {
        const params =
        {
            un: username,
            pw: hash
        };
        const sql_query = `UPDATE users
                            SET password = :pw
                            WHERE users.user_name = :un;`;

        return db.raw(sql_query, params);

    }
    
    ,


    change_name(username, name) {
        const params =
        {
            un: username,
            pw: name
        };
        const sql_query = `UPDATE users
                            SET name = :pw
                            WHERE users.user_name = :un;`;
        return db.raw(sql_query, params);

    }
    
    ,

    change_gender(username, gender) {
        const params =
        {
            un: username,
            pw: gender
        };
        const sql_query = `UPDATE users
                            SET gender = :pw
                            WHERE users.user_name = :un;`;

        return db.raw(sql_query, params);

    }
    ,


    change_DOB(username, DOB) {
        const params =
        {
            un: username,
            pw: DOB
        };
        const sql_query = `UPDATE users
                            SET date_of_birth = :pw
                            WHERE users.user_name = :un;`;

        return db.raw(sql_query, params);

    }

}