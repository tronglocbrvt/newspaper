const db = require('../utils/db')

module.exports={
    /**
     * @param {keyword} string keyword from user input
     * @param {type_search} string criteria search: article_title / article_abstract / article_content
     * @param offset 
     * @Return return lists of articles with the keyword and type_search, using full-text search of MySQL
     */
    get_articles_from_search(keyword, type_search, offset, premium, time){
        //const params = { kw: keyword, type: type_search };
        const sql = `select distinct a.*, p.published_article_id, p.time_published, c.parent_category_id, c.category_name, p.views_numbers,
        MATCH(a.${type_search}) AGAINST('${keyword}' IN NATURAL LANGUAGE MODE) as relevance
        from articles as a, published_articles as p, categories as c
        where p.article_id = a.article_id
            and c.category_id = a.category_id
            and MATCH(a.${type_search}) AGAINST('${keyword}' IN NATURAL LANGUAGE MODE)
            and a.is_premium <= ${premium}
            and unix_timestamp(p.time_published) <= ${time}
        order by a.is_premium DESC, relevance DESC, p.time_published DESC, a.article_id ASC
        limit 10 offset ${offset}`;

        return db.raw(sql);
    },

    /**
     * @param {keyword} string keyword from user input
     * @param {type_search} string criteria search: article_title / article_abstract / article_content
     * @Return return total of articles with the keyword and type_search, using full-text search of MySQL
     */
    count_result_from_search(keyword, type_search, premium, time){
        const sql = `select distinct count(*) as total
        from articles as a, published_articles as p, categories as c
        where p.article_id = a.article_id
            and c.category_id = a.category_id
            and MATCH(a.${type_search}) AGAINST('${keyword}' IN NATURAL LANGUAGE MODE)
            and a.is_premium <= ${premium}
            and unix_timestamp(p.time_published) <= ${time}`;
            return db.raw(sql);
    }
}