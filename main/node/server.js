const multer = require('multer');

const path = require('path');

const express = require('express');
const app = express();

const feed = require('./routes/feed');
const auth = require('./routes/auth');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },

  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + Buffer.from(decodeURIComponent(file.originalname), 'latin1').toString('utf8'));
  }
});

const fileFilter = (req, file, cb) => {
  console.log(file);
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  };
};

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feed);
app.use('/auth', auth);


app.use((err, req, res, next) => {
  console.log('ВСЯ ОШИБКА', err);
  console.log('Статус ошибки', err.statusCode);
  console.log('Сообщение ошибки', err.message);
  console.log('вывод информации об ошибке закончен', 11111111111111);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Ошибка сервера';
  res.status(statusCode).json({ type: "text", result: message });
});

app.listen(8080);