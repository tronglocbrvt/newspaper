const db = require('../utils/db')

module.exports = {
    get_tags() {
        const sql = `select t.tag_name as tag_name, t.tag_id as tag_id
        from tags t
        order by t.tag_name`;
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
    },

    add(tag) {
        return db('tags').insert(tag);
    },

    patch(tag_id, tag_name) {
        return db('tags').where('tag_id', tag_id).update({tag_name: tag_name});
    },

    delete_tag(tag_id) {
        return db('tags').where('tag_id', tag_id).del();
    },

    delete_tag_link(tag_id) {
        return db('tag_links').where('tag_id', tag_id).del();
    },

    count_tag() {
        const sql = `select count(*) as total
        from tags`;
        return db.raw(sql);
    },

    get_list_tags(offset) {
        const sql = `select t.tag_name as tag_name, t.tag_id as tag_id
        from tags t
        limit 10 offset ?`;
        return db.raw(sql, offset);
    },

    search_by_tag_name(tag_name) {
        const sql = `select * from tags where tag_name = '${tag_name}'`;
        return db.raw(sql);
    }
}