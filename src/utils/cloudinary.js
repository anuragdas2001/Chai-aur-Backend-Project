import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


// console.log("Cloudinary Config:", {
//   cloudinary_url: process.env.CLOUDINARY_URL,
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });


// Configuration
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    console.log("Inside Cloudinary...!");
    // console.log("localFilePath", localFilePath);

    if (!localFilePath) {
      console.log("No file path provided");
      return null;
    }

    // Upload the file on Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      resource_type: "auto",
    });

    console.log("response", response);
    // console.log("File is uploaded on Cloudinary!", response.url);

    // Return the response
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // Remove the locally saved temporary file if the upload operation failed
    console.error("Error in Cloudinary upload", error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
