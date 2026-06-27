const cloudinary = require('cloudinary').v2;
const fs =  require("fs");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {resource_type : "auto"});

        console.log("Cloudinary Response:", response);
        console.log("URL:", response.secure_url || response.url);

        return response;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        fs.unlinkSync(localFilePath);
        return null;
    }
}

module.exports = uploadCloudinary;