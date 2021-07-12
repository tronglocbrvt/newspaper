const db = require('../utils/db')

module.exports = {
    get_articles_by_id(id, offset){
        const sql = `select article_id, article_title, writer_id,
        CASE
            WHEN article_id in (select pa.article_id
                             from published_articles pa)
                THEN 'Đã xuất bản'
            ELSE 'Chờ xét duyệt'
         END AS status,
        CASE
            WHEN article_id in (select pa.article_id
                             from published_articles pa)
                THEN (select pa.published_article_id
                             from published_articles pa
                             where pa.article_id = articles.article_id)
            ELSE 0
         END AS published_article_id
        from articles
        where writer_id = ${id}
        limit 10 offset ${offset}`;

        return db.raw(sql);
    },
    
    load_article_by_id(article_id){
        const sql_query = `select *
        from articles
        where article_id = ?;`
        return db.raw(sql_query, article_id);
    },

    get_content_cat(article_id){
        const sql_content_cat = `select article_content, category_id
        from articles
        where article_id = ?`;

        return content_cat = db.raw(sql_content_cat, article_id);
    }
}