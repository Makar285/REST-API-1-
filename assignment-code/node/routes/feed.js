const express = require('express');
const router = express.Router();

const isAuth = require('../middleware/is-auth');

const { body } = require('express-validator');

const feedController = require('../controllers/feed');

function length(value, { req }) {
  console.log(value);
  const str = value.trim()
  if(str.length >= 5 || str.length === 0) {
    return true;
  } else {
    return false;
  };
};

// GET /feed/posts
router.get('/posts',
  isAuth,
  feedController.getPosts
);

// POST /feed/post
router.post('/post',
  isAuth,
  body('title')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Название должно быть длинее 5 символом'),
  body('content')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Контент должно должен быть длинее 5 символом'),
  feedController.postCreatePost
);

router.get('/post/:postId',
  feedController.getPostById
);

// PUT /feed/post/:postId
router.put('/post/:postId',
  isAuth,
  body('title')
    .custom(length)
    .withMessage('Заголовок может быть или пустым(вы не хотите менять значение) или минимум 5 символов.'),
  body('content')
    .custom(length)
    .withMessage('Контент может быть или пустым(вы не хотите менять значение) или минимум 5 символов.'),
  feedController.updatePost
);

// DELETE /feed/post/:postId
router.delete('/post/:postId',
  isAuth,
  feedController.deletePost
);

// GET /feed/status
router.get('/status',
  isAuth,
  feedController.getStatus
);

// POST /feed/status
router.post('/status',
  isAuth,
  feedController.postStatus
);

// GET /feed/my
router.get('/my',
  isAuth,
  feedController.main
);

module.exports = router;