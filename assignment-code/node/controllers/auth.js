const Auth =require('../models/auth');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const helper = require('../helper');

const { validationResult } = require('express-validator');

module.exports.postSignup = (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = validationResult(req);
  console.log(errors);
  if(!errors.isEmpty()) {
    return res.status(422).json({ error: true, ...errors});
  };

  bcryptjs.hash(password, 12)
    .then(hashPassword => {
      console.log(hashPassword);
      return Auth.signup(name, email, hashPassword)
    })
    .then(notUserId => {
      const userId = notUserId.rows[0].id;

      console.log(userId);
      res.status(201).json({ message: "User Created", userId });
    })
    .catch(err=>{
      const error = new Error('Произошла ошибка на стороне сервера');
      error.statusCode = 500;
      next(error);
    });
};

module.exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;

  Auth.getUserByEmail(email)
    .then(data => {
      const user = data.rows[0];
      console.log(user);

      if(!user) {
        // пользователя с такой почтой не найден
        const error = new Error('Пользователь с такой почтой не найден.');
        error.statusCode = 401;
        return next(error);
      };

      loadedUser = user;
      return bcryptjs.compare(password, user.password);
    })
    .then(data => {
      console.log(data);
      if(!data) {
        // Неверный пароль
        const error = new Error('Неверный пароль.');
        error.statusCode = 401;
        next(error);
      } else {
        //  Пользоатель с такой почтой существует и пароль верный
        const token = jwt.sign({ userId: loadedUser.id }, helper.SECRET_KEY, { expiresIn: '1h' });
        console.log(token)
        res.status(200).json({ token, user: loadedUser });
      };
    })
    .catch(err => {
      const error = new Error('Произошла ошибка на стороне сервера');
      error.statusCode = 500;
      next(error);
    })
};