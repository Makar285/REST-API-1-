const jwt = require('jsonwebtoken');
const helper = require('../helper');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  console.log(authHeader);
  console.log(authHeader);
  console.log(authHeader);
  console.log(authHeader);

  if(authHeader) {
    const token = authHeader.split(' ')[1];
    let value;

    console.log(token, helper.SECRET_KEY);

    try {
      value = jwt.verify(token, helper.SECRET_KEY);
    } catch(err) {
      const error = new Error('Срок действия jwt токена истек.');
      error.statusCode = 401;
      next(error);
    };
  
    console.log('obj', value);

    if(value) {
      req.userId = value.userId;
      next();
    } else {
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      next(error);
    };
  } else {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    next(error);
  };
};