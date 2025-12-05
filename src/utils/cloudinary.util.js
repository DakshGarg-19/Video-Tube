import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload an image on to cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // successful upload of file on cloudinary
    console.log("File has been uploaded to Cloudinary", response);
    // console.log("File has been uploaded to Cloudinary, Image URL:", response.url);
    fs.unlinkSync(localFilePath); // removes the locally saved temporary file as the file got successfully upload
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // removes the locally saved temporary file as the upload operation failed
    return null;
  }
};

export { uploadOnCloudinary };
