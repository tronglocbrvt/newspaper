const db = require("../utils/db");

module.exports = {
    get_articles_by_editor_category(editor_id, category_id, limit, offset, is_total = false) {
        var limit_offset = "";
        var cat_constraint = "";
        if (is_total === false)
            limit_offset = `limit ${limit}
                            offset ${offset}`;

        if (category_id !== -1)
            cat_constraint = `and ecl.category_id = ${category_id}`;

        const sql = `select a.article_title as article_title, w.nick_name as writer_alias, a.article_id as article_id, c.category_name as category_name
        from articles a, editor_category_links ecl, writers w, categories c
        where a.is_submitted = true
        and w.writer_id = a.writer_id
        and a.category_id = c.category_id
        and ecl.category_id in (select parent_category_id from categories where category_id = a.category_id)
        and ecl.editor_id = ${editor_id} ${cat_constraint}
        order by a.article_id asc
        ${limit_offset}`;

        return db.raw(sql);
    },

    get_rejected_articles_by_editor(editor_id, category_id, limit, offset, is_total = false) {
        var limit_offset = "";
        var cat_constraint = "";
        if (is_total === false)
            limit_offset = `limit ${limit}
                            offset ${offset}`;

        if (category_id !== -1)
            cat_constraint = `and c.parent_category_id = ${category_id}`;

        const sql = `select a.article_id as article_id, article_title, category_name, nick_name as writer_alias, rejected_time
        from rejected_articles r, articles a, categories c, writers w
        where r.article_id = a.article_id
        and c.category_id = a.category_id
        and w.writer_id = a.writer_id
        and editor_id = ${editor_id} ${cat_constraint}
        order by rejected_time desc
        ${limit_offset}`;

        return db.raw(sql);
    },

    get_accepted_articles_by_editor(editor_id, category_id, limit, offset, is_total = false) {
        var limit_offset = "";
        var cat_constraint = "";
        if (is_total === false)
            limit_offset = `limit ${limit}
                            offset ${offset}`;

        if (category_id !== -1)
            cat_constraint = `and c.parent_category_id = ${category_id}`;

        const sql = `select a.article_id as article_id, article_title, category_name, nick_name as writer_alias, time_published
        from published_articles pa, articles a, categories c, writers w
        where pa.article_id = a.article_id
        and c.category_id = a.category_id
        and w.writer_id = a.writer_id
        and pa.editor_id = ${editor_id} ${cat_constraint}
        order by time_published desc
        ${limit_offset}`;

        return db.raw(sql);
    },

    if_category_belong_editor(editor_id, category_id) {
        const sql = `select *
        from editor_category_links
        where editor_id = ${editor_id}
        and category_id = ${category_id}`;

        return db.raw(sql);
    },


    get_categories_by_editor(editor_id) {
        const sql = `select c.category_id as category_id, category_name
        from editor_category_links tl, categories c
        where tl.editor_id = ${editor_id}
        and c.category_id = tl.category_id`;

        return db.raw(sql);
    },

    add_reject_article(article) {
        return db('rejected_articles').insert(article);
    },

    add_publish_article(article) {
        return db('published_articles').insert(article);
    },

    if_exist(editor_id) {
        const sql = `select *
        from editors
        where editor_id = ${editor_id}`;

        return db.raw(sql);
    },

    if_article_belong_editor(editor_id, article_id) {
        const sql = `select *
        from editor_category_links ecl, articles a, categories c
        where c.category_id = a.category_id
        and c.parent_category_id = ecl.category_id
        and ecl.editor_id = ${editor_id}
        and a.article_id = ${article_id}`;

        return db.raw(sql);
    },

    get_editorid_by_userid(user_id) {
        const sql = `select editor_id
        from editors
        where user_id = ${user_id}`;

        return db.raw(sql);
    }
}