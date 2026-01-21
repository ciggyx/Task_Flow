export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg', 'jpeg', 'png'];

    if (validExtensions.includes(fileExtension) || !file) {
        return callback(null, true)
    }

    callback(null, false);

}