const db = require('../utils/db')

module.exports=
{
    find_by_id(id){
        prams = {id:id};
        const sql_query = `

        SELECT pa.time_published, a.article_title, a.article_abstract, c.category_id as subcate_id, c.category_name as sub_category, m_c.category_id as maincate_id, m_c.category_name as main_category
        from published_articles as pa, articles as a, categories as c, categories as m_c
        where pa.published_article_id=? and pa.article_id = a.article_id and a.category_id = c.category_id and c.parent_category_id = m_c.category_id`
        return db.raw(sql_query,id);
    },
}

