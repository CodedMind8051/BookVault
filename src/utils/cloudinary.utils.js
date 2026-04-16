import { v2 as cloudinary } from 'cloudinary'
import { DeleteLocalSaveImgFile } from "../utils/DeleteLocalSaveImageFile.utils.js"



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})



const File_UploadToCloudinary = async (localFilePath) => {
    try {
        const CloudinaryResponse = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: "auto",
            })
        return CloudinaryResponse?.secure_url
    } catch (error) {
        return error?.message || error?.code
    } finally {
        DeleteLocalSaveImgFile(localFilePath)
    }
}


export { File_UploadToCloudinary }