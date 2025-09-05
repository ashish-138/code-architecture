import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./public/temp")
    },
    filename: function(req, file, cb){
        const ext = path.extname(file.originalname)
        const basename = path.basename(file.originalname, ext)
        const uniqueName = `${basename}-${Date.now()}${ext}`
        // cb(null, file.originalname)
        cb(null, uniqueName)
    }
})

const upload = multer({
    storage
})

export { upload }