const db = require('../utils/db')

module.exports =
{
    add_new_user(user) {
        return db('users').insert(user);
    }
    ,


    // Find API
    findByUsername(username) {
        return db('users').where('user_name', username);
    },
    findByEmail(email) {
        return db('users').where('email', email);
    },
    findByUserID(user_id) {
        return db('users').where('user_id', user_id);
    },
    findByGoogleID(googleID) {

        const params =
        {
            gid: googleID
        };

        const sql_query = `select u.*
                from google_users as gu, users as u
                where gu.user_id = u.user_id and gu.google_id = :gid`;
        return db.raw(sql_query, params);
    },
    findByFacebookID(facebookID) {

        const params =
        {
            fbid: facebookID
        };

        const sql_query = `select u.*
                from facebook_users as fu, users as u
                where fu.user_id = u.user_id and fu.fb_id = :fbid`;
        return db.raw(sql_query, params);
    },

    // change_password(username, hash) {
    //     const params =
    //     {
    //         un: username,
    //         pw: hash
    //     };
    //     const sql_query = `UPDATE users
    //                         SET password = :pw
    //                         WHERE users.user_name = :un;`;

    //     return db.raw(sql_query, params);

    // },


    change_password_by_user_id(userid, hash) {
        const params =
        {
            un: userid,
            pw: hash
        };
        const sql_query = `UPDATE users
                            SET password = :pw
                            WHERE users.user_id = :un;`;
        return db.raw(sql_query, params);
    },

    change_name_by_user_id(user_id, name) {
        const params =
        {
            un: user_id,
            pw: name
        };
        const sql_query = `UPDATE users
                            SET name = :pw
                            WHERE users.user_id = :un;`;
        return db.raw(sql_query, params);

    },
    change_gender_by_user_id(user_id, gender) {
        const params =
        {
            un: user_id,
            pw: gender
        };
        const sql_query = `UPDATE users
                            SET gender = :pw
                            WHERE users.user_id = :un;`;

        return db.raw(sql_query, params);

    },
    change_DOB_by_user_id(user_id, DOB) {
        const params =
        {
            un: user_id,
            pw: DOB
        };
        const sql_query = `UPDATE users
                            SET date_of_birth = :pw
                            WHERE users.user_id = :un;`;

        return db.raw(sql_query, params);

    },

    change_writer_nickname_by_user_id(user_id, nick_name) {
        const sql_query = `UPDATE writers
    SET nick_name = :nick_name
    WHERE writers.user_id = :uid;`;
    return db.raw(sql_query,{uid:user_id,nick_name:nick_name})
    }
    ,


    // OTP API.
    insertToken(data) {
        return db('reset_password_commands').insert(data);
    }
    ,

    findToken(user_id, time) {
        return db('reset_password_commands').where('user_id', user_id).andWhere('expired_time', '>', time).orderBy('expired_time', 'desc');
    }
    ,

    insertAccountAuthenticationToken(data) {
        return db('authenticate_email_commands').insert(data);
    },

    findAccountAuthenticationToken(user_id, time) {
        return db('authenticate_email_commands').where('user_id', user_id).andWhere('expired_time', '>', time).orderBy('expired_time', 'desc');
    },

    authenticate_by_user_id(user_id) {
        const params =
        {
            un: user_id,
        };
        const sql_query = `UPDATE users
        SET is_authenticated = 1
        WHERE user_id = :un;`;
        return db.raw(sql_query, params);
    }
    ,
    // Add FB & GG users.
    insertGoogleUser(googleID) {
        const params =
        {
            gid: googleID,
        };
        const sql_query = `insert into google_users(google_id, user_id) values(:gid,LAST_INSERT_ID());`;
        return db.raw(sql_query, params);
    },

    insertFacebookUser(facebookID) {
        const params =
        {
            fbid: facebookID
        };
        const sql_query = `insert into facebook_users(fb_id, user_id) values(:fbid,LAST_INSERT_ID());`;
        return db.raw(sql_query, params);
    }
}