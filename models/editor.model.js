const db = require("../utils/db");

module.exports = {
    get_articles_by_editor_category(editor_id, category_id){
        const sql = `select a.article_title as article_title, w.nick_name as writer_alias, a.article_id as article_id, c.category_name as category_name
        from articles a, editor_category_links ecl, writers w, categories c
        where a.is_submitted = true
        and w.writer_id = a.writer_id
        and a.category_id = c.category_id
        and a.category_id in (select category_id from categories where parent_category_id = ${category_id})
        and ecl.category_id = ${category_id}
        and ecl.editor_id = ${editor_id}`;

        return db.raw(sql);
    },

    get_categories_by_editor(editor_id){
        const sql = `select category_id
        from editor_category_links
        where editor_id = ${editor_id}`;

        return db.raw(sql);
    },

    add_reject_article(article){
        return db('rejected_articles').insert(article);
    },

    add_publish_article(article){
        return db('published_articles').insert(article);
    },

    if_exist(editor_id){
        const sql = `select *
        from editors
        where editor_id = ${editor_id}`;

        return db.raw(sql);
    },

    if_article_belong_editor(editor_id, article_id){
        const sql = `select *
        from editor_category_links ecl, articles a, categories c
        where a.is_submitted = true
        and c.category_id = a.category_id
        and c.parent_category_id = ecl.category_id
        and ecl.editor_id = ${editor_id}
        and a.article_id = ${article_id}`;

        return db.raw(sql);
    }
}