const db = require('../utils/db')

module.exports =
{
    /**
     * @param published_article_id
     * @Return return information of an article with published_article_id = id.
     */
    load_published_article_by_id(published_article_id) {
        const sql_query = `                
        SELECT pa.time_published, a.article_title, a.article_abstract, a.article_content, c.category_id as subcate_id, c.category_name as sub_category, m_c.category_id as maincate_id, m_c.category_name as main_category, CONCAT('/categories/',m_c.category_id) as maincate_ref, CONCAT('/categories/',m_c.category_id,'/subs/',c.category_id) as subcate_ref, a.avatar_url,a.avatar_caption,a.is_premium, a.article_id
        from published_articles as pa, articles as a, categories as c, categories as m_c
        where pa.published_article_id=? and pa.article_id = a.article_id and a.category_id = c.category_id and c.parent_category_id = m_c.category_id;
        `
        return db.raw(sql_query, published_article_id);
    },

    /**
     * @param published_article_id
     * @Return return all tags of an article with published_article_id = id.
     */
    load_tags_by_published_article_id(published_article_id) {
        const sql_query = `
        SELECT T.tag_id,T.tag_name, CONCAT('/tags/',T.tag_id) as tag_link
        from tags as T, tag_links as TL, articles as A, published_articles as PA
        where PA.published_article_id=? and  PA.article_id = A.article_id and T.tag_id = TL.tag_id and TL.article_id =A.article_id;
        `
        return db.raw(sql_query, published_article_id);
    }
    ,

    /**
     * @param {published_article_id} int id of the published article
     * @param {limit_length} int length of lists of articles to load
     * @Return return lists of articles with the same category as the published_article_id
     */
    load_random_published_articles_with_same_category(published_article_id, limit_length) {
        const params =
        {
            p_id: published_article_id,
            lim: limit_length
        };
        const sql_query = `select CONCAT('/articles/',p.published_article_id) as ref, a.article_title, a.article_abstract, a.avatar_url
        from articles as a, published_articles as p, published_articles as p_ref, articles as a_ref
        where
            p_ref.published_article_id = :p_id
            and a_ref.article_id = p_ref.article_id
            and a_ref.category_id = a.category_id
            and p.article_id = a.article_id
            and p.published_article_id != :p_id
        order by rand()
        limit :lim`
        return db.raw(sql_query, params)
    },

     /**
     * @param {published_article_id} int id of the published article
     * @Return return lists of comments òf the published_article_id
     */
    load_comments_of_published_articles_by_id(published_article_id)
    {
        const sql_query = `select c.*, u.name
        from comments as c,users as u
        where c.published_article_id = ? and u.user_id = c.user_id
        order by c.time_comment asc;
        `;
        return db.raw(sql_query,published_article_id);
    },

    /**
     * @param {cat_id} int id of the parent category
     * @param {offset} int 
     * @Return return lists of articles with the parent category and related
     */
    find_by_cat_id(cat_id, offset, premium) {
        var params = { id: cat_id, offset: offset, premium: premium};
        const sql = `select articles.*, p.time_published, p.published_article_id, categories.category_name, c.category_name as name, c.category_id as id
        from articles, categories, categories as c, published_articles as p
        where categories.parent_category_id = :id
            and categories.category_id = articles.category_id
            and c.category_id = categories.parent_category_id
            and p.article_id = articles.article_id
            and articles.is_premium <= :premium
        order by articles.is_premium DESC, articles.article_id ASC
        limit 10 offset :offset`;
        return db.raw(sql, params);
    },

    /**
     * @param {art_id} int id of the published article
     * @Return return lists of tags of the article
     */
    find_tags_by_article_id(art_id) {
        const sql = `select distinct tags.tag_name, tags.tag_id
      from tag_links as tl, tags
      where tl.article_id = ?
          and tl.tag_id = tags.tag_id`;
        return db.raw(sql, art_id);
    },

    /**
     * @param {cat_id} int id of the parent category
     * @Return return total of articles of parent category 
     */
    count_by_cat_id(cat_id, premium) {
        const sql = `select count(*) as total
        from articles, categories
        where categories.parent_category_id = ${cat_id}
            and categories.category_id = articles.category_id
            and articles.is_premium <= ${premium}
        `;
        return db.raw(sql);
    },

    /**
     * @param {cat_id} int id of the sub category
     * @Return return total of articles of sub category 
     */
    count_by_subcat_id(subcat_id, premium) {
        const sql = `select count(*) as total
        from articles, categories
        where categories.category_id = articles.category_id
            and categories.category_id = ${subcat_id}
            and articles.is_premium <= ${premium}`;
        return db.raw(sql);
    },

    /**
     * @param {sub_id} int id of the subcategory
     * @param {offset} int 
     * @Return return lists of articles with the subcategory and related
     */
    find_by_subcat_id(sub_id, offset, premium) {
        var params = { id: sub_id, offset: offset, premium: premium};
        const sql = `select distinct articles.*, p.time_published, p.published_article_id, categories.category_name, c.category_name as name, c.category_id as id
        from articles, categories, published_articles as p, categories as c
        where categories.category_id = :id
            and articles.category_id = categories.category_id
            and p.article_id = articles.article_id
            and categories.parent_category_id = c.category_id
            and articles.is_premium <= :premium
        order by articles.is_premium DESC, articles.article_id ASC
        limit 10 offset :offset`;
        return db.raw(sql, params);
    },

    /**
     * @param {tag_id} int id of the tag 
     * @Return return total of articles with the tag
     */
    async count_by_tag_id(tag_id, premium) {
        const sql = `select count(*) as total
        from articles, tag_links as tl, published_articles as p, tags, categories as c
        where tl.tag_id = ${tag_id}
            and tl.tag_id = tags.tag_id
            and tl.article_id = p.article_id
            and articles.article_id = p.article_id
            and c.category_id = articles.category_id
            and articles.is_premium <= ${premium}`;
        
        return db.raw(sql, params);
    },

    /**
     * @param {tag_id} int id of the tag
     * @param {offset} int 
     * @Return return lists of articles with the tag and related
     */
    find_by_tag_id(tag_id, offset, premium) {
        var params = { id: tag_id, offset: offset, premium};
        const sql = `select articles.*, p.time_published, p.published_article_id, tags.tag_name, c.category_name, c.parent_category_id
        from articles, tag_links as tl, published_articles as p, tags, categories as c
        where tl.tag_id = :id
            and tl.tag_id = tags.tag_id
            and tl.article_id = p.article_id
            and articles.article_id = p.article_id
            and c.category_id = articles.category_id
            and articles.is_premium <= :premium
        order by articles.is_premium DESC, articles.article_id ASC
        limit 10 offset :offset`;
        return db.raw(sql, params);
    },

    hot_news() {
        const sql = `select a.article_title as article_title, a.article_id as article_id, a.category_id as category_id, c.category_name as category_name, pa.time_published as time_published,
        a.avatar_url as avatar_url
        from articles a, categories c, published_articles pa
        where a.category_id = c.category_id
        and a.category_id = pa.article_id
        limit 3`;
        return db.raw(sql);
    },

    latest_news() {
        const sql = `select a.article_title as article_title, a.article_id as article_id, a.category_id as category_id, c.category_name as category_name, pa.time_published as time_published,
        a.avatar_url as avatar_url
        from articles a, categories c, published_articles pa
        where a.category_id = c.category_id
        and a.category_id = pa.article_id
        limit 10`;
        return db.raw(sql);
    },

    most_news() {
        const sql = `select a.article_title as article_title, a.article_id as article_id, a.category_id as category_id, c.category_name as category_name, pa.time_published as time_published,
        a.avatar_url as avatar_url
        from articles a, categories c, published_articles pa
        where a.category_id = c.category_id
        and a.category_id = pa.article_id
        limit 10`;
        return db.raw(sql);
    },

    hot_categories() {
        const sql = `select a.article_title as article_title, a.article_id as article_id, a.category_id as category_id, c.category_name as category_name, pa.time_published as time_published,
        a.avatar_url as avatar_url
        from articles a, categories c, published_articles pa
        where a.category_id = c.category_id
        and a.category_id = pa.article_id
        limit 10`;
        return db.raw(sql);
    },

    add(article){
        return db('articles').insert(article);
    },
}