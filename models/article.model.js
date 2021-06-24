const db = require('../utils/db')

module.exports=
{
    find_by_id(id){
        prams = {id:id};
        const sql_query = `
        SELECT pa.time_published, a.article_title, a.article_abstract, c.category_id as subcate_id, c.category_name as sub_category, m_c.category_id as maincate_id, m_c.category_name as main_category, CONCAT('/categories/',m_c.category_id) as maincate_ref, CONCAT('/categories/',c.category_id) as subcate_ref
        from published_articles as pa, articles as a, categories as c, categories as m_c
        where pa.published_article_id=? and pa.article_id = a.article_id and a.category_id = c.category_id and c.parent_category_id = m_c.category_id;`
        return db.raw(sql_query,id);
    },

    find_tags_by_id(id)
    {
        const sql_query = `
        SELECT T.tag_id,T.tag_name, CONCAT('/tags/',T.tag_id) as tag_link
        from tags as T, tag_links as TL, articles as A
        where A.article_id=? and  T.tag_id = TL.tag_id and TL.article_id =A.article_id;
        `
        return db.raw(sql_query,id);
    }
}

