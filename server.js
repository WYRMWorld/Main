const express           = require('express');
const path              = require('path');
const fs                = require('fs');
const basicAuth         = require('express-basic-auth');
const multer            = require('multer');

const app = express();

// 0) Strip any CSP header sent by the host
app.use((req, res, next) => {
  res.removeHeader('Content-Security-Policy');
  next();
});

// 1) Body parsing
app.use(express.urlencoded({ extended: true }));

// 2) Multer file uploads
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
const upload = multer({ dest: UPLOAD_DIR });

// 3) Admin Basic Auth
app.use(['/admin', '/admin.html'], basicAuth({
  users: { 'WYRMWorld': 'Bigcbigc33' },
  challenge: true,
  realm: 'WYRMWorldAdmin'
}));

// Serve admin.html on both routes
app.get('/admin',        (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/admin.html',   (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// 4) Submission endpoint
let submissions = [];
app.post('/submit', upload.single('track'), (req, res) => {
  const { name, type } = req.body;
  const originalName   = req.file ? req.file.originalname : '';
  const storedName     = req.file ? req.file.filename : '';
  submissions.push({ name, originalName, storedName, type });
  res.redirect('/submit.html');
});

// 5) Submissions API
app.get('/submissions', (req, res) => {
  res.json(submissions);
});

// 6) Listen page routes
app.get('/listen',      (req, res) => res.sendFile(path.join(__dirname, 'public', 'listen.html')));
app.get('/listen.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'listen.html')));

// 7) Serve uploads
app.use('/uploads', express.static(UPLOAD_DIR));

// 8) Static assets
app.use(express.static(path.join(__dirname, 'public')));

// 9) Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));