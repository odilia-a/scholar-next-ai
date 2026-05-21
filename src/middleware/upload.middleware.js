const multer = require("multer");
const path = require("path");

const storage =
  multer.memoryStorage();


const fileFilter =
  (
    req,
    file,
    cb
  ) => {

    const allowed =
      [
        ".pdf",
        ".docx",
      ];

    const ext =
      path.extname(
        file.originalname
      ).toLowerCase();

    if (
      allowed.includes(
        ext
      )
    ) {
      return cb(
        null,
        true
      );
    }

    cb(
      new Error(
        "Only PDF and DOCX files allowed"
      )
    );
  };


const upload =
  multer({
    storage,
    fileFilter,

    limits: {
      fileSize:
        20 *
        1024 *
        1024,
    },
  });


module.exports =
  upload;