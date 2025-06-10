const express = require('express');
const path = require('path');
const fs = require('fs');
const basicAuth = require('express-basic-auth');
const multer = require('multer');

const app = express();
app.use(express.urlencoded({ extended: true }));

// Setup upload directory
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
const upload = multer({ dest: UPLOAD_DIR });

// Basic Auth for Admin
app.use(['/admin', '/admin.html'], basicAuth({
  users: { 'WYRMWorld': 'Bigcbigc33' },
  challenge: true,
  realm: 'WYRMWorldAdmin'
}));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// In-memory submissions
let submissions = [];

// Handle submission
app.post('/submit', upload.single('track'), (req, res) => {
  const { name, type } = req.body;
  const originalName = req.file ? req.file.originalname : '';
  const storedName = req.file ? req.file.filename : '';
  submissions.push({ name, originalName, storedName, type });
  res.redirect('/submit.html');
});

// API for submissions
app.get('/submissions', (req, res) => {
  res.json(submissions);
});

// Serve uploads
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/listen', (req, res) => res.sendFile(path.join(__dirname, 'public', 'listen.html')));
// Serve static assets
app.get(['/listen', '/listen.html'], (req, res) => res.sendFile(path.join(__dirname, 'public', 'listen.html')));
// Serve listen page
app.get('/listen', (req, res) => res.sendFile(path.join(__dirname, 'public', 'listen.html')));
app.get('/listen.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'listen.html')));
app.use(express.static(path.join(__dirname, 'public')));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
