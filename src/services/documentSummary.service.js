const chunkText =
  require(
    "./textChunker.service"
  );

const sendToHuggingFace =
  require(
    "./huggingface.service"
  );


const summarizeDocument =
  async (
    text
  ) => {

    const chunks =
      chunkText(
        text
      );

    const summaries =
      [];

    for (
      const chunk of chunks
    ) {

      const summary =
        await sendToHuggingFace(
          chunk
        );

      summaries.push(
        summary
      );
    }

    return summaries.join(
      "\n\n"
    );
  };

const extractKeyPoints =
  (
    text
  ) => {

    return text
      .split(".")
      .filter(
        (line) =>
          line.trim()
      )
      .slice(
        0,
        10
      );
  };
module.exports = {
  summarizeDocument,
  extractKeyPoints,
};