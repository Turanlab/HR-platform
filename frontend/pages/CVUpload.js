import React, { useState } from 'react';

const CVUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [category, setCategory] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('cv', file);
    formData.append('category', category);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload'); // Replace with your API endpoint
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = (event.loaded / event.total) * 100;
        setUploadProgress(percentage);
      }
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        setUploadedFiles([...uploadedFiles, { fileName: file.name, category }]);
        setFile(null);
        setCategory('');
        setUploadProgress(0);
      } else {
        console.error('Upload failed');
      }
    };
    xhr.send(formData);
  };

  return (
    <div>
      <h2>Upload Your CV</h2>
      <input type="file" onChange={handleFileChange} />
      <select value={category} onChange={handleCategoryChange}>
        <option value="">Select Category</option>
        <option value="Job Application">Job Application</option>
        <option value="Internship">Internship</option>
      </select>
      <button onClick={handleUpload}>Upload</button>
      <div>
        <progress value={uploadProgress} max="100" />
        <span>{uploadProgress}%</span>
      </div>
      <h3>Uploaded CVs:</h3>
      <ul>
        {uploadedFiles.map((uploadedFile, index) => (
          <li key={index}>{uploadedFile.fileName} - {uploadedFile.category}</li>
        ))}
      </ul>
    </div>
  );
};

export default CVUpload;