const db = require('../utils/db');

module.exports = {
    get_published_art(limit, offset) {
        const sql = `select a.article_id as article_id, a.article_title as article_title, c.category_name as category_name, w.nick_name as writer_alias
        from articles a, categories c, writers w, published_articles pa
        where is_published = true
        and w.writer_id = a.writer_id
        and pa.article_id = a.article_id
        and pa.time_published <= now()
        and a.category_id = c.category_id
        limit ${limit}
        offset ${offset}`;

        return db.raw(sql);
    },

    get_tobe_published_art(limit, offset) {
        const sql = `select a.article_id as article_id, a.article_title as article_title, c.category_name as category_name, w.nick_name as writer_alias
            from articles a, categories c, writers w, published_articles pa
            where is_published = true
            and w.writer_id = a.writer_id
            and pa.article_id = a.article_id
            and pa.time_published > now()
            and a.category_id = c.category_id
            limit ${limit}
            offset ${offset}`;

        return db.raw(sql);
    },

    get_submitted_art(limit, offset) {
        const sql = `select a.article_id as article_id, a.article_title as article_title, c.category_name as category_name, w.nick_name as writer_alias
            from articles a, categories c, writers w
            where is_submitted = true
            and w.writer_id = a.writer_id
            and a.category_id = c.category_id
            limit ${limit}
            offset ${offset}`;

        return db.raw(sql);
    },

    get_draft_art(limit, offset) {
        const sql = `select a.article_id as article_id, a.article_title as article_title, c.category_name as category_name, w.nick_name as writer_alias
            from articles a, categories c, writers w
            where is_draft = true
            and w.writer_id = a.writer_id
            and a.category_id = c.category_id
            limit ${limit}
            offset ${offset}`;

        return db.raw(sql);
    },

    get_rejected_art(limit, offset) {
        const sql = `select a.article_id as article_id, a.article_title as article_title, c.category_name as category_name, w.nick_name as writer_alias
            from articles a, categories c, writers w
            where is_rejected = true
            and w.writer_id = a.writer_id
            and a.category_id = c.category_id
            limit ${limit}
            offset ${offset}`;

        return db.raw(sql);
    },

    get_writer_id(){
        const sql = `select w.writer_id
        from users u, writers w
        where u.is_admin = true
        and w.user_id = u.user_id`;

        return db.raw(sql);
    }
}