const pdf =
  require(
    "pdf-parse"
  );

const mammoth =
  require(
    "mammoth"
  );


const parseDocument =
  async (
    file
  ) => {

    if (
      !file
    ) {
      return "";
    }


    // PDF
    if (
      file.mimetype ===
      "application/pdf"
    ) {

      const result =
        await pdf(
          file.buffer
        );

      return result.text;
    }


    // DOCX
    if (
      file.mimetype.includes(
        "word"
      )
    ) {

      const result =
        await mammoth.extractRawText({
          buffer:
            file.buffer,
        });

      return result.value;
    }


    throw new Error(
      "Unsupported file type"
    );
  };


module.exports =
  parseDocument;