const db = require('../utils/db');

module.exports = {
    get_articles_by_filter(limit, offset, tab, writer_id, main_cat, sub_cat, tag_id, is_total = false) {
        var limit_offset = "";
        var writer_constraint = "";
        var category_constraint = "";
        var tag_constraint = "";

        if (is_total === false)
            limit_offset = `limit ${limit}
                            offset ${offset}`;
        if (writer_id !== 0)
            writer_constraint = `and w.writer_id = ${writer_id}`;
        if (main_cat !== 0)
            category_constraint = `and a.category_id in (select c1.category_id from categories c1 where c1.parent_category_id = ${main_cat})`;
        if (sub_cat !== 0)
            category_constraint = `and a.category_id = ${sub_cat}`;
        if (tag_id !== 0)
            tag_constraint = `and a.article_id in (select t.article_id from tag_links t where t.tag_id = ${tag_id})`;

        var sql;
        switch (tab) {
            case 0:
                sql = `select a.article_id as article_id, a.article_title as article_title, 
                c.category_name as category_name, w.nick_name as writer_alias, time_published
                from articles a, categories c, writers w, published_articles pa
                where is_published = true
                and w.writer_id = a.writer_id
                and pa.article_id = a.article_id
                and pa.time_published <= now()
                and a.category_id = c.category_id ${writer_constraint} ${category_constraint} ${tag_constraint}
                order by pa.time_published desc
                ${limit_offset}`;
                break;
            case 1:
                sql = `select a.article_id as article_id, a.article_title as article_title, 
                c.category_name as category_name, w.nick_name as writer_alias, time_published
                from articles a, categories c, writers w, published_articles pa
                where is_published = true
                and w.writer_id = a.writer_id
                and pa.article_id = a.article_id
                and pa.time_published > now()
                and a.category_id = c.category_id ${writer_constraint} ${category_constraint} ${tag_constraint}
                order by pa.time_published desc
                ${limit_offset}`;
                break;
            case 2:
                sql = `select a.article_id as article_id, a.article_title as article_title, c.category_name as category_name, w.nick_name as writer_alias
                from articles a, categories c, writers w
                where is_submitted = true
                and w.writer_id = a.writer_id
                and a.category_id = c.category_id ${writer_constraint} ${category_constraint} ${tag_constraint}
                order by a.article_id desc
                ${limit_offset}`;
                break;
            case 3:
                sql = `select a.article_id as article_id, a.article_title as article_title, c.category_name as category_name, w.nick_name as writer_alias
                from articles a, categories c, writers w
                where is_draft = true
                and w.writer_id = a.writer_id
                and a.category_id = c.category_id ${writer_constraint} ${category_constraint} ${tag_constraint}
                order by a.article_id desc
                ${limit_offset}`;
                break;
            case 4:
                sql = `select a.article_id as article_id, a.article_title as article_title, c.category_name as category_name, w.nick_name as writer_alias
                from articles a, categories c, writers w
                where is_rejected = true
                and w.writer_id = a.writer_id
                and a.category_id = c.category_id ${writer_constraint} ${category_constraint} ${tag_constraint}
                order by a.article_id desc
                ${limit_offset}`;
                break;
            default:
                sql = "";
                break;
        }
        return db.raw(sql);
    },

    get_writer_id() {
        const sql = `select w.writer_id
        from users u, writers w
        where u.is_admin = true
        and w.user_id = u.user_id`;

        return db.raw(sql);
    }
}