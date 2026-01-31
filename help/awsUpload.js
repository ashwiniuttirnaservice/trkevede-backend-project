// import FormData from "form-data";
// import fs from "fs";
// import axios from "axios";

// async function uploadToAws({ file, fileName, folderName, fileExtension }) {
//   try {
//     if (!file?.path) throw new Error("No file path provided");

//     const dataFile = fs.readFileSync(file.path);
//     const formData = new FormData();

//     formData.append("fileName", fileName);
//     formData.append("folderName", `aplaneta/${folderName}`);
//     formData.append("fileExtension", fileExtension);
//     formData.append("uploadFile", dataFile, {
//       filename: file.originalname || `${fileName}.${fileExtension}`,
//       contentType: file.mimetype || "application/octet-stream",
//     });
//     formData.append("extras", JSON.stringify({ appId: 1 }));

//     const headers = formData.getHeaders();

//     const _resp = await axios.post(
//       "https://aws-upload.uttirna.in/api/aws/upload",
//       formData,
//       { headers }
//     );

//     return _resp.data?.data;
//   } catch (error) {
//     console.error("AWS Upload Error:", error.response?.data || error.message);
//     throw new Error("Failed to upload file to AWS");
//   }
// }

// export default uploadToAws;
// const FormData = require("form-data");


const fs = require("fs");
const path = require("path");

const mimeToExt = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
  "application/zip": "zip",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "video/mp4": "mp4",
};

async function uploadToAws({ file, fileName, folderName }) {
  try {
    if (!file?.path) throw new Error("No file path provided");

    const detectedExt =
      mimeToExt[file.mimetype] ||
      path.extname(file.originalname || "").replace(".", "") ||
      "bin";

    const buffer = fs.readFileSync(file.path);
    const formData = new FormData();

    formData.append("fileName", fileName);
    formData.append("folderName", `uploads/${folderName}`);
    formData.append("fileExtension", detectedExt);

    formData.append(
      "uploadFile",
      new Blob([buffer], { type: file.mimetype || "application/octet-stream" }),
      file.originalname || `${fileName}.${detectedExt}`
    );

    formData.append("extras", JSON.stringify({ appId: 1 }));

    const response = await fetch(
      "https://aws-upload.uttirna.in/api/aws/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText);
    }

    const result = await response.json();
    return result?.data;
  } catch (error) {
    console.error("AWS Upload Error:", error.message);
    throw new Error("Failed to upload file to AWS");
  }
}

module.exports = uploadToAws;
