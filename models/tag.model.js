const db = require('../utils/db')

module.exports = {
    get_tags() {
        const sql = `select t.tag_name as tag_name
        from tags t`;
        return db.raw(sql);
    },

    add_tag(tag) {
        return db('tag_links').insert(tag);
    },

    async get_name_tag_by_tag_id(id) {
        const name = await db('tags').where({"tag_id": id}).select('tag_name');
        return name[0];
    }
}