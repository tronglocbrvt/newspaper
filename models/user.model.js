const db = require('../utils/db')

module.exports =
{
    /**
     * @param user_id Int
     * @Return return information of a user with user_id
     */
    load_user_info_by_id(user_id) 
    {
        const sql_query = `
        SELECT users.*, (users.time_premium is not null and users.time_premium > NOW()) as is_premium
        FROM users
        where users.user_id = :uid;`;
        return db.raw(sql_query,{uid:user_id});
    },

     /**
     * @param 
     * @Return return all users
     */
    all(){
        const sql_query = `SELECT users.*, (users.time_premium is not null and users.time_premium > NOW()) as is_premium
        FROM users`;
        return db.raw(sql_query);
  },
}
