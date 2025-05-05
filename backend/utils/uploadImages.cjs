const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garante que a pasta existe
const pastaUploads = path.join(__dirname, '../uploads');
if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, pastaUploads);
  },
  filename: function (req, file, cb) {
    const nomeUnico = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, nomeUnico);
  }
});

const upload = multer({ storage });

module.exports = upload;