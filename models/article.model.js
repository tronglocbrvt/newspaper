const db = require('../utils/db')

module.exports=
{
    /**
     * @param published_article_id
     * @Return return information of an article with published_article_id = id.
     */
    load_published_article_by_id(published_article_id){
        const sql_query = `                
        SELECT pa.time_published, a.article_title, a.article_abstract, a.article_content, c.category_id as subcate_id, c.category_name as sub_category, m_c.category_id as maincate_id, m_c.category_name as main_category, CONCAT('/categories/',m_c.category_id) as maincate_ref, CONCAT('/categories/',c.category_id) as subcate_ref, a.avatar_url,a.avatar_caption,a.is_premium
        from published_articles as pa, articles as a, categories as c, categories as m_c
        where pa.published_article_id=? and pa.article_id = a.article_id and a.category_id = c.category_id and c.parent_category_id = m_c.category_id;
        `
        return db.raw(sql_query,published_article_id);
    },

    /**
     * @param published_article_id
     * @Return return all tags of an article with published_article_id = id.
     */
    load_tags_by_published_article_id(published_article_id)
    {
        const sql_query = `
        SELECT T.tag_id,T.tag_name, CONCAT('/tags/',T.tag_id) as tag_link
        from tags as T, tag_links as TL, articles as A, published_articles as PA
        where PA.published_article_id=? and  PA.article_id = A.article_id and T.tag_id = TL.tag_id and TL.article_id =A.article_id;
        `
        return db.raw(sql_query,published_article_id);
    }
    ,
    
    /**
     * @param {published_article_id} int id of the published article
     * @param {limit_length} int length of lists of articles to load
     * @Return return lists of articles with the same category as the published_article_id
     */
    load_random_published_articles_with_same_category(published_article_id,limit_length)
    {
        const params =
        {
            p_id : published_article_id,
            lim : limit_length
        };
        const sql_query = `select CONCAT('/articles/',p.published_article_id) as ref, a.article_title, a.article_abstract, a.avatar_url
        from articles as a, published_articles as p, published_articles as p_ref, articles as a_ref
        where
            p_ref.article_id = :p_id
            and a_ref.article_id = p_ref.article_id
            and a_ref.category_id = a.category_id
            and p.article_id = a.article_id
            and p.published_article_id != :p_id
        order by rand()
        limit :lim`
        return db.raw(sql_query,params)
    },

    find_by_cat_id (cat_id, offset) {
        //  return db.select('*')
        //     .from('articles').join('categories', function() {
        //     this.on('articles.category_id', '=', 'categories.category_id').onIn('categories.parent_category_id', [cat_id])
        //   })
        var params = {id : cat_id, offset : offset};
        const sql = `select articles.*, p.time_published, categories.category_name, c.category_name as name
        from articles, categories, categories as c, published_articles as p
        where categories.parent_category_id = :id
            and categories.category_id = articles.category_id
            and c.category_id = categories.parent_category_id
            and p.article_id = articles.article_id
        limit 10 offset :offset`;
        return db.raw(sql, params);    
    },

    find_tags_by_article_id(art_id)
    {
      const sql = `select distinct tags.tag_name
      from tag_links as tl, tags
      where tl.article_id = ?
          and tl.tag_id = tags.tag_id`;
      return db.raw(sql, art_id);    
    },

    count_by_cat_id (cat_id) {
        //  return db.select('*')
        //     .from('articles').join('categories', function() {
        //     this.on('articles.category_id', '=', 'categories.category_id').onIn('categories.parent_category_id', [cat_id])
        //   })
        const sql = `select count(*) as total
        from articles, categories
        where categories.parent_category_id = ?
            and categories.category_id = articles.category_id
        `;
        return db.raw(sql, cat_id);    
    }
}
