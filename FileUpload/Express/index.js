const express = require('express');
const http2Express = require('http2-express-bridge');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('node:fs');
const { mkdir, unlink } = require('node:fs/promises');
const { pipeline } = require('node:stream/promises');
const { createHash } = require('node:crypto');
const { Transform } = require('node:stream');
const http2 = require('http2');

const app = http2Express(express);
const PORT = 3000;

const serverOptions = {
  key: fs.readFileSync(path.join(__dirname, 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert.pem')),
  allowHTTP1: true,
};


app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Digest');
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');    
});

app.post('/upload', fileUpload(), async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const uploadPath = path.join(__dirname, 'uploads');
    
    // Create directory if it doesn't exist
  await mkdir(uploadPath, { recursive: true });

  let uploadedFiles = req.files.files;

    // If only one file is uploaded, express-fileupload returns an object.
    // We convert it to an array so we can always loop through it.
    if (!Array.isArray(uploadedFiles)) {
        uploadedFiles = [uploadedFiles];
    }
  console.log('Received files:', req.files);
  const downloads = uploadedFiles.map((file) => saveToDisk(uploadPath, file));
  Promise.all(downloads).then(() => {
    res.send('Upload endpoint');
  });
});

app.post('/uploadZipped', async (req, res) => {
  console.log('Received zipped upload request');

  const uploadPath = path.join(__dirname, 'uploads');
  await mkdir(uploadPath, { recursive: true });

  const fileStream = fs.createWriteStream(path.join(uploadPath, `${Date.now()}_uploaded.zip`));

  try {
    await pipeline(req, fileStream);
    res.status(200).json({ message: 'Upload complete' });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to write file' });
  }
});

http2.createSecureServer(serverOptions, app).listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});


const saveToDisk = async (base, file) => {
  const uploadPath = path.join(base, file.name);
  return file.mv(uploadPath);
}