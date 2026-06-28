const express = require('express');
const router = express.Router();

const { body } = require('express-validator');

const authController = require('../controllers/auth');
const Auth = require('../models/auth');

function emailAlreadyExists(value, { req, location, path }) {
  // req это большой объект app.use((req, res, next) => req тут и который передался в эту функцию emailAlreadyExists одинаковые)
  // location — откуда пришло поле ('body', 'query', 'params', 'cookies', 'headers')
  // path — имя проверяемого поля (строка), body(отсюда)

  return Auth.getUserByEmail(value)
    .then(data => {
      const user = data.rows[0];
      if(user) {
        return Promise.reject('Пользователь с такой почтой уже существует.');
      } else {
        return true;
      };
    });
};

function min8(value) {
  // 1. Минимальная длина
  if (value.length < 8) {
    throw new Error('Пароль должен быть не менее 8 символов');
  };

  return true;
};

function oneSmall(value) {
  // 2. Хотя бы одна строчная буква (латиница или кириллица)
  if (!/(?=.*[a-zа-яё])/.test(value)) {
    throw new Error('Пароль должен содержать минимум одну строчную букву');
  };

  return true;
};

function oneBig(value) {
  // 3. Хотя бы одна заглавная буква (латиница или кириллица)
  if (!/(?=.*[A-ZА-ЯЁ])/.test(value)) {
    throw new Error('Пароль должен содержать минимум одну заглавную букву');
  };

  return true;
};

function oneDigit(value) {
  // 4. Хотя бы одна цифра
  if (!/(?=.*\d)/.test(value)) {
    throw new Error('Пароль должен содержать минимум одну цифру');
  };

  return true;
};

function oneSymvol(value) {
  // 5. Хотя бы один спецсимвол
  if (!/(?=.*[-#!$@%^&*()_+|~=`{}[\]:";'<>?,./ ])/.test(value)) {
    throw new Error('Пароль должен содержать минимум один спецсимвол');
  };

  return true;
};

// POST /auth/signup
router.post('/signup',
  [
    body('name')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Имя не может быть короче 2 двух символов.'),
    body('email')
      .trim()
      .custom(emailAlreadyExists)
      .notEmpty()
      .withMessage('Email не может быть пустым')
      .isEmail()
      .withMessage('Невалидная почта'),
    body('password')
      .trim()
      .custom(min8)
      .custom(oneSmall)
      .custom(oneBig)
      .custom(oneDigit)
      .custom(oneSymvol)
  ],
  authController.postSignup
);

// POST /auth/login
router.post('/login',
  authController.postLogin
);

module.exports = router;