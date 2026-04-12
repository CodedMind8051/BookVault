import multer from "multer";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/incomingTempFile')
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}.${file?.mimetype.replace("image/","")}`)
    }
})

function fileFilter(req, file, cb) {

    const allowedTypes=['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

    if (allowedTypes.includes(file?.mimetype)) {
        cb(null, true)
    } else {
        cb(`Only this file types in allowed ${allowedTypes.join(" , ").replaceAll("image/","")}`, false)
    }
}



const upload = multer({ storage: storage, fileFilter: fileFilter , limits:{fileSize:7 * 1024 * 1024} })


export { upload }