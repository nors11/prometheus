import { extname } from 'path'

export const generateRandomFileName = (req, file, callback) => {
    const name = file.originalname.split('.')[0];
    const fileExtName = extname(file.originalname);
    const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
    callback(null, `${randomName}${fileExtName}`);
};

export const generateRandomFileNameSaint = (req, file, callback) => {
    var language = 'es';
    if(req.query.lang){
        language = req.query.lang;
    }
    var filename = 'saints_' + language;
    const fileExtName = extname(file.originalname);
    filename = filename + fileExtName;
    callback(null, filename);
};