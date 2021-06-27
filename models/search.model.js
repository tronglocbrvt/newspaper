const db = require('../utils/db')

module.exports={
    get_articles_from_search(keyword, type_search, offset){
        //const params = { kw: keyword, type: type_search };
        const sql = `select distinct a.*, p.published_article_id, p.time_published, c.parent_category_id
        from articles as a, published_articles as p, categories as c
        where p.article_id = a.article_id
            and c.category_id = a.category_id
            and MATCH(a.${type_search}) AGAINST('${keyword}' IN NATURAL LANGUAGE MODE)
        limit 10 offset ${offset}`;

        return db.raw(sql);
    },

    count_result_from_search(keyword, type_search){
        const sql = `select distinct count(*) as total
        from articles as a, published_articles as p, categories as c
        where p.article_id = a.article_id
            and c.category_id = a.category_id
            and MATCH(a.${type_search}) AGAINST('${keyword}' IN NATURAL LANGUAGE MODE)`;

            return db.raw(sql);
    }
}