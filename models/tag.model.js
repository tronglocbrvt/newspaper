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

    delete_tag(tag){
        return db('tag_links')
            .where({
                'tag_id': tag.tag_id,
                'article_id': tag.article_id})
            .del()
    },
    
    get_tags_by_id(id){
        const sql = `select t.tag_id as tag_id, t.tag_name as tag_name
        from tag_links tl, tags t
        where article_id = ?
        and t.tag_id = tl.tag_id`;
        return db.raw(sql, id);
    },

    async get_name_tag_by_tag_id(id) {
        const name = await db('tags').where({"tag_id": id}).select('tag_name');
        return name[0];
    }
}