const db = require('../utils/db')

module.exports = {
    get_writers() {
        const sql = `select *
        from writers
        order by nick_name`;
        return db.raw(sql);
    },

    get_count_articles(writer_id) {
        const sql = `select count(*) as total
        from articles
        where writer_id = ${writer_id};`

        return db.raw(sql);
    },

    get_articles_by_writer(id, offset, limit, tab, is_total = false){
        var limit_offset = "";
        if (is_total === false)
            limit_offset = `limit ${limit}
                            offset ${offset}`;
        var tab_constraint = '';
        switch (tab){
            case '1':
                tab_constraint = `and is_published = true and article_id in (select pa.article_id
                    from published_articles pa
                    where pa.time_published <= now())`;
                break;
            case '2':
                tab_constraint = `and is_published = true and article_id in (select pa.article_id
                    from published_articles pa
                    where pa.time_published > now())`;
                break;
            case '3':
                tab_constraint = 'and is_submitted = true';
                break;
            case '4':
                tab_constraint = 'and is_draft = true';
                break;
            case '5':
                tab_constraint = 'and is_rejected = true';
                break;
        }

        const sql = `select article_id, article_title, writer_id, category_name,
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
         END AS status
        from articles a, categories c
        where writer_id = ${id}
        and c.category_id = a.category_id ${tab_constraint}
        order by a.article_id desc
        ${limit_offset}`;

        return db.raw(sql);
    },

    load_article_by_id(article_id) {
        const sql_query = `select *
        from articles
        where article_id = ?;`
        return db.raw(sql_query, article_id);
    },

    get_content_cat(article_id) {
        const sql_content_cat = `select article_content, category_id
        from articles
        where article_id = ?`;

        return content_cat = db.raw(sql_content_cat, article_id);
    },

    patch_article(article) {
        const id = article.article_id;
        delete article.article_id;
        return db('articles')
            .where('article_id', id)
            .update(article);
    },

    get_rejected_comment(article_id) {
        const sql = `select editor_comments
        from rejected_articles
        where article_id = ${article_id}
        order by rejected_articles_id desc
        limit 1`;

        return db.raw(sql);
    },

    is_exist(writer_id) {
        const sql = `select *
        from writers
        where writer_id = ${writer_id}`;

        return db.raw(sql);
    },

    if_article_belong_writer(writer_id, article_id) {
        const sql = `select *
        from articles
        where writer_id = ${writer_id}
        and article_id = ${article_id}`;

        return db.raw(sql);
    },

    delete_rejected_article(article_id) {
        const sql = `delete from rejected_articles
        where article_id = ${article_id}`;

        return db.raw(sql);
    },
    find_writer_nickname_by_userID(user_id) {
        const sql = `select writers.nick_name
        from writers
        where user_id = :user_id;`
        return db.raw(sql, { user_id: user_id });
    },
    get_writerid_by_userid(user_id){
        const sql = `select writer_id
        from writers
        where user_id = ${user_id}`;
        return db.raw(sql);
    }
}