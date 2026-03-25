import cloudinary from "../config/cloudinary";

export const uploadImageToCloudinary = async (filePath: string) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "products"
  });

  return result.secure_url;
};