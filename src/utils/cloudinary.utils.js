import { v2 as cloudinary } from 'cloudinary'
import { DeleteLocalSaveImgFile } from "../utils/DeleteLocalSaveImageFile.utils.js"



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})



const File_UploadToCloudinary = async (localFilePath, FolderPath_WhereToSave) => {
    try {
        const CloudinaryResponse = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: "auto",
                folder: `BookVault/${FolderPath_WhereToSave}`
            })
        return { ImageUrl: CloudinaryResponse?.secure_url, ImagePublicId: CloudinaryResponse?.public_id }
    } catch (error) {
        return error?.message || error?.code
    } finally {
        DeleteLocalSaveImgFile(localFilePath)
    }
}


const File_DeleteToCloudinary = async (PublicID) => {
    try {
        const CloudinaryResponse = await cloudinary.uploader.destroy
            (
                PublicID,
                {
                    resource_type: "image"
                }
            )
        return CloudinaryResponse
    } catch (error) {
        return error?.message || error?.code
    }
}



export { File_UploadToCloudinary, File_DeleteToCloudinary }