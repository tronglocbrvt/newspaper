const db = require('../utils/db')

module.exports =
{
    /**
     * @param load_user_info_by_id
     * @Return return information of a user with user_id
     */
    load_user_info_by_id(user_id) 
    {
        return db("users").where("user_id",user_id);
    }
}