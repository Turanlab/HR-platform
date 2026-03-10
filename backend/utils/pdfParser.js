const fs = require('fs');
const path = require('path');

const pdfParser = {
  async parsePDF(filePath) {
    try {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return {
        text: data.text || '',
        pageCount: data.numpages || 1,
        metadata: data.info || {}
      };
    } catch (err) {
      console.error('PDF parse error:', err.message);
      return { text: '', pageCount: 0, metadata: {}, error: err.message };
    }
  },

  async parseDocx(filePath) {
    try {
      // mammoth provides accurate DOCX text extraction.
      // Install with: npm install mammoth
      // Without mammoth, falls back to a basic binary text extraction which may produce imperfect results.
      let text = '';
      try {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ path: filePath });
        text = result.value || '';
      } catch {
        // If mammoth not installed, read raw bytes and try to extract ASCII text
        const buffer = fs.readFileSync(filePath);
        text = buffer.toString('utf8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s{3,}/g, '\n').trim();
      }
      return { text, pageCount: 1, metadata: {} };
    } catch (err) {
      console.error('DOCX parse error:', err.message);
      return { text: '', pageCount: 0, metadata: {}, error: err.message };
    }
  },

  async parseFile(filePath, mimeType) {
    const ext = path.extname(filePath).toLowerCase();
    const isPdf = mimeType === 'application/pdf' || ext === '.pdf';
    const isDocx = mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === '.docx';
    const isDoc = mimeType === 'application/msword' || ext === '.doc';

    if (isPdf) return this.parsePDF(filePath);
    if (isDocx || isDoc) return this.parseDocx(filePath);

    // Generic text fallback
    try {
      const text = fs.readFileSync(filePath, 'utf8');
      return { text, pageCount: 1, metadata: {} };
    } catch (err) {
      return { text: '', pageCount: 0, metadata: {}, error: err.message };
    }
  }
};

module.exports = pdfParser;
