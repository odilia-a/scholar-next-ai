const sendToHuggingFace = async ({ prompt, file }) => {
  try {
    console.log("📄 Routing to Hugging Face");

    return {
      provider: "huggingface",
      response: `Hugging Face handled document request`,
    };
  } catch (error) {
    throw new Error("HuggingFace service failed");
  }
};

module.exports = sendToHuggingFace;