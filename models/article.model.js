const db = require('../utils/db')

module.exports=
{
    find_by_id(id){
        prams = {id:id};
        const sql_query = `

        SELECT pa.time_published, a.article_title, a.article_abstract, c.category_id as subcate_id, c.category_name as sub_category, m_c.category_id as maincate_id, m_c.category_name as main_category
        from published_articles as pa, articles as a, categories as c, categories as m_c
        where pa.published_article_id=? and pa.article_id = a.article_id and a.category_id = c.category_id and c.parent_category_id = m_c.category_id`
        return db.raw(sql_query,id);
    },

    find_by_cat_id (cat_id) {
        //  return db.select('*')
        //     .from('articles').join('categories', function() {
        //     this.on('articles.category_id', '=', 'categories.category_id').onIn('categories.parent_category_id', [cat_id])
        //   })
        const sql = `select articles.*, p.time_published, categories.category_name, c.category_name as name
        from articles, categories, categories as c, published_articles as p
        where categories.parent_category_id = ?
            and categories.category_id = articles.category_id
            and c.category_id = categories.parent_category_id
            and p.article_id = articles.article_id`;
        return db.raw(sql, cat_id);    
    },

    find_tags_by_article_id(art_id) {
      const sql = `select distinct tags.tag_name
      from tag_links as tl, tags
      where tl.article_id = ?
          and tl.tag_id = tags.tag_id`;
      return db.raw(sql, art_id);    
    },

    hot_news(){
        const sql=`select a.article_title as article_title, a.article_id as article_id, a.category_id as category_id, c.category_name as category_name, pa.time_published as time_published
        from articles a, categories c, published_articles pa
        where a.category_id = c.category_id
        and a.category_id = pa.article_id
        limit 3`;
        return db.raw(sql); 
    },

    latest_news(){
        const sql=`select a.article_title as article_title, a.article_id as article_id, a.category_id as category_id, c.category_name as category_name, pa.time_published as time_published
        from articles a, categories c, published_articles pa
        where a.category_id = c.category_id
        and a.category_id = pa.article_id
        limit 10`;
        return db.raw(sql); 
    },

    most_news(){
        const sql=`select a.article_title as article_title, a.article_id as article_id, a.category_id as category_id, c.category_name as category_name, pa.time_published as time_published
        from articles a, categories c, published_articles pa
        where a.category_id = c.category_id
        and a.category_id = pa.article_id
        limit 10`;
        return db.raw(sql); 
    },

    hot_categories(){
        const sql=`select a.article_title as article_title, a.article_id as article_id, a.category_id as category_id, c.category_name as category_name, pa.time_published as time_published
        from articles a, categories c, published_articles pa
        where a.category_id = c.category_id
        and a.category_id = pa.article_id
        limit 10`;
        return db.raw(sql); 
    }
}
