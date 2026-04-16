import fs from "fs"


const DeleteLocalSaveImgFile = (path) => {
    try {
        if (path && fs.existsSync(path)) {
            fs.unlinkSync(path)
        }
    } catch (error) {
        return error.message || error.code
    }
}

export { DeleteLocalSaveImgFile }