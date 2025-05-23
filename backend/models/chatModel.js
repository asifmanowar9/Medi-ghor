import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
      enum: ['user', 'ai'],
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const chatSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    messages: [messageSchema],
    title: {
      type: String,
      default: 'New Test Report Analysis',
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
