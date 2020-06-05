import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

export default {
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..', '..', 'uploads'),
    filename(request, file, cb) { 
      const hash = crypto.randomBytes(6).toString('hex');

      const fileName = `${hash}-${file.originalname}`

      cb(null, fileName); // null é se eu tivese um try com erro pra passar
      // mando filename feito com hash
    }
  }),
  limits: {
    fileSize: 2*1024 *1024,
  },
  fileFilter: (req, file, cb)=>{
    const allowedMimes = [ //tipos formato permitidos
        'image/jpeg',
        'image/pjpeg',
        "image/png",
    ];
    if (allowedMimes.includes(file.mimetype)) { //checa se o tipo esta na minha array
        cb(null, true);
    } else {
        cb(new Error("Invalid file type."))
    }
  }
};
