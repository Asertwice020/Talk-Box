import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/assets_temp");
  },
  filename: function (req, file, cb) {
    const now = new Date();
    const uniqueSuffix = `[${now.getSeconds()}-${now.getMinutes()}-${now.getHours() % 12 || 12}-${now.getHours() >= 12 ? "PM" : "AM"}-${now.getDate()}-${now.getMonth() + 1}]`;
// FIXME: IF THERE IS STILL AN ISSUE TO STORE THE IMAGES WITH THE DATE IN CLOUDINARY SO JUST EXPEND THE ORIGINAL NAME AND PASS THE UNIQUE SUFFIX TO THE ORIGINAL NAME. IT WILL WORKS
    cb(null, `${file.originalname}-${uniqueSuffix}`);
  },
});

const upload = multer({ storage });
export { upload }
