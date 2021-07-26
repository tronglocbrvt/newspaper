const db = require("../utils/db");

module.exports = {
    get_articles_by_editor_category(editor_id, category_id){
        const sql = `select a.article_title as article_title, w.nick_name as writer_alias, a.article_id as article_id
        from articles a, editor_category_links ecl, writers w
        where a.is_submitted = true
        and w.writer_id = a.writer_id
        and a.category_id = ${category_id}
        and ecl.category_id = ${category_id}
        and ecl.editor_id = ${editor_id}`;

        return db.raw(sql);
    }
}