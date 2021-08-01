const db = require('../utils/db')

module.exports = {
    get_articles_by_id(id, offset){
        const sql = `select article_id, article_title, writer_id,
        CASE
            WHEN is_published and article_id in (select pa.article_id
                                                from published_articles pa
                                                where pa.time_published < now())
                THEN 'Đã xuất bản'
            WHEN is_rejected
                THEN 'Từ chối'
            WHEN is_submitted
                THEN 'Chờ xét duyệt'
            WHEN is_draft
                THEN 'Bản nháp'
            ELSE 'Chờ xuất bản'
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
        where writer_id = ${id}`;

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
    },

    patch_article(article){
        const id = article.article_id;
        delete article.article_id;
        return db('articles')
            .where('article_id', id)
            .update(article);
    },

    get_rejected_comment(article_id){
        const sql = `select editor_comments
        from rejected_articles
        where article_id = ${article_id}`;

        return db.raw(sql);
    },

    is_exist(writer_id){
        const sql = `select *
        from writers
        where writer_id = ${writer_id}`;

        return db.raw(sql);
    },

    if_article_belong_writer(writer_id, article_id){
        const sql = `select *
        from articles
        where writer_id = ${writer_id}
        and article_id = ${article_id}`;

        return db.raw(sql);
    },

    delete_rejected_article(article_id){
        const sql = `delete from rejected_articles
        where article_id = ${article_id}`;

        return db.raw(sql);
    }
}