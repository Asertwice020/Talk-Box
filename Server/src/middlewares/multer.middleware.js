import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/assets_temp");
  },
  filename: function (req, file, cb) {
    const now = new Date();
    const uniqueSuffix = `[${now.getSeconds()}-${now.getMinutes()}-${now.getHours() % 12 || 12}-${now.getHours() >= 12 ? "PM" : "AM"}-${now.getDate()}-${now.getMonth() + 1}]`;
    cb(null, `${file.originalname}-${uniqueSuffix}`);
  },
});

const upload = multer({ storage });
export { upload }