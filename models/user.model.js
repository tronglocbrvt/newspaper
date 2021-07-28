const db = require('../utils/db')

module.exports =
{
    /**
     * @param user_id Int
     * @Return return information of a user with user_id
     */
    load_user_info_by_id(user_id) {
        const sql_query = `
        SELECT users.*, writers.nick_name ,(users.time_premium is not null and users.time_premium > NOW()) as is_premium
        FROM users LEFT JOIN writers on users.user_id = writers.user_id
        where users.user_id = :uid;`;
        return db.raw(sql_query, { uid: user_id });
    },

    /**
    * @param 
    * @Return return all users
    */
    all(offset) {
        const sql_query = `SELECT users.*, (users.time_premium is not null and users.time_premium > NOW()) as is_premium
        FROM users limit 20 offset ?`;
        return db.raw(sql_query, offset);
    },

    count_users() {
        const sql = `select count(*) as total
        from users`;
        return db.raw(sql);
    },

    find_user_id_by_user_name(user_name)
    {
        return db('users').where('user_name', user_name);
    },

    addEditor(editor)
    {
        return db('editors').insert(editor);
    },

    addWriter(writer)
    {
        return db('writers').insert(writer);
    },

    addCategoryForEditor(user_id,category_id)
    {
        const sql = `insert into editor_category_links(editor_id, category_id)
        select e.editor_id,:cate_id
        from editors as e
        where :uid = e.user_id`;

        return db.raw(sql,{uid:user_id,cate_id:category_id});
    },

    get_selected_cats_by_user_id(user_id)
    {
        const sql = `SELECT link.category_id
        from  users as u, editors as e,editor_category_links as link
        where u.user_id=:uid and  u.user_id = e.user_id and e.editor_id =  link.editor_id;`;
        return db.raw(sql,{uid:user_id});
    },
    countNumArticles(user_id)
    {
        const sql = `SELECT count(*) as num
        from users as u, writers as w,articles as a
        where u.user_id = :uid and u.user_id = w.user_id and w.writer_id = a.writer_id
        group by u.user_id;`;
        return db.raw(sql,{uid:user_id});
    },

    deleteUser(user_id)
    {
        const sql = `DELETE FROM users WHERE user_id =:uid;`;
        return db.raw(sql,{uid:user_id});
    },
    updateUser(edited_user)
    {
        const sql = `UPDATE users
        SET gender=:gender , date_of_birth = :date_of_birth , name = :name , is_writer:is_writer ,is_editor = :is_editor
        WHERE user_id = :user_id;`;
        return db.raw(sql,edited_user);
    }
}
