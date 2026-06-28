const fs = require('fs');
const path = require('path');

const Feed = require('../models/feed');
const Auth = require('../models/auth');

const { validationResult } = require('express-validator');

function deleteImage(fileName) {
  const filePath = path.join(__dirname, '..', fileName);
  fs.unlink(filePath, (err => console.log(err)));
}

module.exports.getPosts = (req, res, next) => {
  Feed.getAllPosts()
    .then(data => {
      const posts = data.rows;

      console.log(posts);

      if(posts.length === 0) {
        const error = new Error('Постов не найдено.');
        error.statusCode = 200;
        throw error;
        // return res.status(200).json({ msg: 'postsNotFound', message: 'Постов не найдено.' })
      };

      return res.status(200).json(posts);
    })
    .catch(err => {
      if(!err.sttausCode) {
        const error = new Error('Произошла ошибка на стороне сервера');
        error.statusCode = 500;
      };
      next(err);
    });
};

module.exports.postCreatePost = (req, res, next) => {
  console.log(req.body, req.file);
  console.log(req.body, req.file);
  console.log(req.body, req.file);

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.log({error: true, ...errors});
    console.log({error: true, ...errors});
    console.log({error: true, ...errors});
    console.log({error: true, ...errors});
    return res.status(422).json({error: true, ...errors});
  };

  if(!req.file) {
    const error = new Error('Изображения нет');
    error.statusCode = 422;
    next(error);
  };

  const { title, content } = req.body;
  const image_url = req.file.path;

  const creatorUserId = req.userId;
  const createdAt = new Date().toISOString();

  console.log(title, content, image_url, creatorUserId, createdAt);

  Feed.addPost(title, content, image_url, creatorUserId, createdAt)
    .then(data => {
      const postId = data.rows[0].id;
      console.log(postId)

      return Feed.getPostById(postId);
    })
    .then(data => {
      const post = data.rows[0];
      console.log(post);

      res.status(201).json({ message: "Success", post });
    })
    .catch(err => {
      const error = new Error('Произошла ошибка на стороне сервера');
      error.statusCode = 500;
      next(err);
    });
};

module.exports.getPostById = (req, res, next) => {
  const { postId } = req.params;

  Feed.getPostById(postId)
    .then(data => {
      const post = data.rows[0];

      if(!post) {
        return res.status(404).json({ error: true, message: "Такой Пост Не Найден", type: "postNotFound" });
      };

      console.log(post);
      res.status(200).json(post);
    })
    .catch(err => {
      const error = new Error('Произошла ошибка на стороне сервера');
      error.statusCode = 500;
      next(err);
    });
};

module.exports.updatePost = (req, res, next) => {
  const userIdLogin = req.userId;
  const { postId } = req.params;
  const { title, content } = req.body;

  let image_url;
  let sendFile = false;
  if(req.file) {
    sendFile = true;
    image_url = req.file.path;
  };


  console.log(postId, title, content, image_url, sendFile);

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.log({error: true, ...errors});
    console.log({error: true, ...errors});
    console.log({error: true, ...errors});
    console.log({error: true, ...errors});
    return res.status(422).json({error: true, ...errors});
  };

  Feed.getPostById(postId)
    .then(data => {
      const post = data.rows[0];

      if(!post) {
        const error = new Error('Такой Пост Не Найден');
        error.statusCode = 404;
        throw error;
        // return res.status(404).json({ error: true, type: "postNotFound", message: "Такой Пост Не Найден" });
      };

      console.log(userIdLogin, post.creator_user_id);

      if(userIdLogin!=post.creator_user_id) {
        const error = new Error('Вы хотите изменить не свой пост');
        error.statusCode = 403;
        throw error
      };

      if((post.image_url != image_url) && sendFile) {
        deleteImage(post.image_url);
      };

      return Feed.updatePostById(postId, title, content, image_url, sendFile);
    })
    .then(notPostId => {
      console.log(notPostId);
      console.log(notPostId);
      const post = notPostId.rows[0];


      if(post.type === "notUpdate") {
        const error = new Error('Изминения не было потому что вы не выбрали на что изминять значения');
        error.statusCode = 200;
        throw error;
      };

      const postId = post.id;

      console.log(postId);

      return Feed.getPostById(postId);
    })
    .then(data => {
      const post = data.rows[0];

      res.status(200).json({ message: "Post Updated", post });
    })
    .catch(err => {
      next(err);
    });
};

module.exports.deletePost = (req, res, next) => {
  const userIdLogin = req.userId;
  const { postId } = req.params;

  Feed.getPostById(postId)
    .then(data => {
      const post = data.rows[0];

      if(!post) {
        const error = new Error('Такой Пост Не Найден');
        error.statusCode = 404;
        throw error;
      };

      // Проверить этот ли пользователь который отправил запрос создал этот пост
      console.log('ududududud', userIdLogin, post.creator_user_id);

      if(userIdLogin!=post.creator_user_id) {
        const error = new Error('Вы хотите удалить не свой пост');
        error.statusCode = 403;
        throw error;
      };

      deleteImage(post.image_url);
      return Feed.deletePostById(postId);
    })
    .then(() => {
      return res.status(200).json({ message: "Post Deleted" });
    })
    .catch(err => {
      if(!err.statusCode) {
        err.message = 'Произошла ошибка на стороне сервера';
        err.statusCode = 500;
      };
      
      next(err);
    });
};

module.exports.getStatus = (req, res, next) => {
  const { userId } = req;
  console.log('userid;', userId);

  Auth.getUserById(userId)
    .then(data => {
      const user = data.rows[0];
      console.log('user', user);

      if(!user) {
        const error = new Error('Такой пользователь не найден.');
        error.statusCode = 401;
        throw error
      };

      return res.status(200).json({ status: user.status });
    })
    .catch(err => {
      next(err);
    });
};

module.exports.postStatus = (req, res, next) => {
  const { userId } = req;
  const { newStatus } = req.body;

  Auth.updateStatusUserById(userId, newStatus)
    .then(data => {
      const status = data.rows[0].status;
      console.log('status', status);

      res.status(200).json({ newStatus });
    })
    .catch(err=>next(err));
};

module.exports.main = (req, res, next) => {
  const { userId } = req;
  console.log(userId);

  Auth.getUserById(userId)
    .then(data => {
      const user = data.rows[0];
      console.log('user', user);

      if(!user) {
        const error = new Error('Пользователь с таким id не сущестувет.');
        error.statusCode = 404;
        throw error;
      };

      res.status(200).json({ user });
    })
    .catch(err => {
      next(err);
    });
};