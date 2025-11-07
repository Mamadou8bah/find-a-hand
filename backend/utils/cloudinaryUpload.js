const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

function uploadBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'find-a-hand',
      resource_type: options.resource_type || 'image'
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });

    streamifier.createReadStream(buffer).pipe(stream);
  });
}

module.exports = { uploadBuffer };
