const Chat = require("../../models/Chat");

const getChatHistory = async (userId) => {
  let chat = await Chat.findOne({ user: userId });

  if (!chat) {
    chat = await Chat.create({
      user: userId,
      messages: [],
    });
  }

  return chat;
};

const addMessage = async (userId, role, content) => {
  let chat = await Chat.findOne({ user: userId });

  if (!chat) {
    chat = await Chat.create({
      user: userId,
      messages: [],
    });
  }

  chat.messages.push({ role, content, timestamp: new Date() });

  if (chat.messages.length > 50) {
    chat.messages = chat.messages.slice(-50);
  }

  await chat.save();
  return chat;
};

module.exports = {
  getChatHistory,
  addMessage,
};