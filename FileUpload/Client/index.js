const fileUpload = {
  dropZone: null,
  fileInput: null,
  fileList: null,
  uploadButton: null,
  chooseButton: null,
  status: null,
  selectedFiles: [],

  init() {
    this.dropZone = document.getElementById('dropZone');
    this.fileInput = document.getElementById('fileInput');
    this.fileList = document.getElementById('fileList');
    this.uploadButton = document.getElementById('uploadButton');
    this.zipAndChunkButton = document.getElementById('zipAndChunkButton');
    this.chooseButton = document.getElementById('chooseButton');
    this.status = document.getElementById('status');

    this.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.dropZone.addEventListener('dragleave', () => this.handleDragLeave());
    this.dropZone.addEventListener('drop', (e) => this.handleDrop(e));
    this.dropZone.addEventListener('click', (e) => {
      if (e.target !== this.chooseButton) this.fileInput.click();
    });
    this.chooseButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.fileInput.click();
    });
    this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    this.uploadButton.addEventListener('click', () => this.upload());
    this.zipAndChunkButton.addEventListener('click', () => {  this.uploadZippedAndChunked(); });
  },

  handleDragOver(e) {
    e.preventDefault();
    this.dropZone.classList.add('dragover');
  },

  handleDragLeave() {
    this.dropZone.classList.remove('dragover');
  },

  handleDrop(e) {
    e.preventDefault();
    this.dropZone.classList.remove('dragover');
    this.selectedFiles = Array.from(e.dataTransfer.files);
    this.renderFileList();
  },

  handleFileSelect(e) {
    this.selectedFiles = Array.from(e.target.files);
    this.renderFileList();
  },

  renderFileList() {
    this.fileList.innerHTML = '';
    this.status.textContent = '';
    this.status.className = '';

    this.selectedFiles.forEach((file) => {
      const li = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = file.name;
      const size = document.createElement('span');
      size.className = 'file-size';
      size.textContent = this.formatSize(file.size);
      li.appendChild(name);
      li.appendChild(size);
      this.fileList.appendChild(li);
    });

    this.uploadButton.disabled = this.selectedFiles.length === 0;
    this.zipAndChunkButton.disabled = this.selectedFiles.length === 0;
  },

  formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },

  async upload() {
    if (this.selectedFiles.length === 0) return;

    this.uploadButton.disabled = true;
    this.zipAndChunkButton.disabled = this.selectedFiles.length === 0;
    this.status.textContent = 'Uploading...';
    this.status.className = '';

    const formData = new FormData();
    this.selectedFiles.forEach((file) => formData.append('files', file));

    try {
      const response = await fetch('https://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        this.status.textContent = 'Upload successful!';
        this.status.className = 'success';
        this.selectedFiles = [];
        this.fileList.innerHTML = '';
        this.fileInput.value = '';
      } else {
        this.status.textContent = `Upload failed: ${response.status} ${response.statusText}`;
        this.status.className = 'error';
      }
    } catch (err) {
      this.status.textContent = `Upload failed: ${err.message}`;
      this.status.className = 'error';
    } finally {
      this.uploadButton.disabled = this.selectedFiles.length === 0;
      this.zipAndChunkButton.disabled = this.selectedFiles.length === 0;
    }
  },
  async uploadZippedAndChunked() {
    if (this.selectedFiles.length === 0) return;
    let me = this;

    this.uploadButton.disabled = true;
    this.zipAndChunkButton.disabled = true;
    this.status.textContent = 'Uploading zipped and chunked...';
    this.status.className = '';

    const totalSize = this.selectedFiles.reduce((sum, f) => sum + f.size, 0);
    let uploadedBytes = 0;

    const progressTracker = new TransformStream({
      transform(chunk, controller) {
        uploadedBytes += chunk.byteLength
        const progress = (uploadedBytes / Number(totalSize)) * 100        
        me.status.textContent = `Upload progress: ${progress.toFixed(2)}%`;
        
        // Pass the chunk through to the request body
        controller.enqueue(chunk)
      }
    })

    try {

          const files = Array.from(this.selectedFiles);
  
        if (files.length === 0) return;

        // 1. Prepare file metadata and streams for the ZIP
        const zipInput = files.map(file => ({
          name: file.name,
          lastModified: file.lastModified,
          input: file.stream() // Streams the individual file data
        }));

        // 2. Generate a single ReadableStream for the ZIP archive
        const zippedStream = downloadZip(zipInput);
        const body = zippedStream.body.pipeThrough(progressTracker)

      
      const response = await fetch('https://localhost:3000/uploadZipped', {
        method: 'POST',
        headers: { 'Content-Type': 'application/zip' },
        body: body,
        // Required for streaming request bodies in modern browsers
        duplex: 'half' 
      });

      if (response.ok) {
        this.status.textContent = 'Upload successful!';
        this.status.className = 'success';
        this.selectedFiles = [];
        this.fileList.innerHTML = '';
        this.fileInput.value = '';
      } else {
        this.status.textContent = `Upload failed: ${response.status} ${response.statusText}`;
        this.status.className = 'error';
      }
    } catch (err) {
      this.status.textContent = `Upload failed: ${err.message}`;
      this.status.className = 'error';
    } finally {
      this.uploadButton.disabled = this.selectedFiles.length === 0;
      this.zipAndChunkButton.disabled = this.selectedFiles.length === 0;
    }
  },
};

document.addEventListener('DOMContentLoaded', () => {
  fileUpload.init();
});
