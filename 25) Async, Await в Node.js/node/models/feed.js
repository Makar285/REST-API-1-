const pool = require('../util/db');

module.exports = class Feed {
  static addPost(title, content, imageUrl, creator_user_id, created_at) {
    return pool.query(` INSERT INTO posts (title, content, image_url, creator_user_id, created_at)
                        VALUES
                          ($1, $2, $3, $4, $5)
                        RETURNING id;`, [title, content, imageUrl, creator_user_id, created_at]);
  };

  static getPostById(postId) {
    return pool.query(` SELECT p.*, u.name, u.email, u.password, u.status FROM posts p
                        INNER JOIN users u ON p.creator_user_id = u.id
                        WHERE p.id = $1;`, [postId]);
  };

  static updatePostById(postId, title, content, image_url, sendFile) {
    console.log(postId, title, content, image_url, sendFile);

    if(sendFile) {
      if(title) {
        if(content) {
          return pool.query(` UPDATE posts
                              SET title = $2, content = $3, image_url = $4
                              WHERE id = $1
                              RETURNING id;`, [postId, title, content, image_url]);
        } else {
          return pool.query(` UPDATE posts
                              SET title = $2, image_url = $3
                              WHERE id = $1
                              RETURNING id;`, [postId, title, image_url]);
        }
      } else {
        if(content) {
          return pool.query(` UPDATE posts
                              SET content = $2, image_url = $3
                              WHERE id = $1
                              RETURNING id;`, [postId, content, image_url]);
        } else {
          return pool.query(` UPDATE posts
                              SET image_url = $2
                              WHERE id = $1
                              RETURNING id;`, [postId, image_url]);
        };
      };
    } else {
      if(title) {
        if(content) {
          return pool.query(` UPDATE posts
                              SET title = $2, content = $3
                              WHERE id = $1
                              RETURNING id;`, [postId, title, content]);
        } else {
          return pool.query(` UPDATE posts
                              SET title = $2
                              WHERE id = $1
                              RETURNING id;`, [postId, title]);
        }
      } else {
        if(content) {
          return pool.query(` UPDATE posts
                              SET content = $2
                              WHERE id = $1
                              RETURNING id;`, [postId, content]);
        } else {
          // return pool.query(` UPDATE posts
          //                     SET
          //                     WHERE id = $1
          //                     RETURNING id;`, [postId]);
          return Promise.resolve({ rows: [{ id: postId, type: "notUpdate" }] });
        };
      };
    };
  };

  static deletePostById(postId) {
    return pool.query(` DELETE FROM posts
                        WHERE id = $1;`, [postId]);
  };

  static getAllPosts() {
    return pool.query(` SELECT p.*, u.name, u.email, u.password, u.status FROM posts p
                        INNER JOIN users u ON p.creator_user_id = u.id
                        ORDER BY p.id;`);
  };
};