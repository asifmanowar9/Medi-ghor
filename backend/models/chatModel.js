import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: '', // Default to empty string
    },
    imageUrl: {
      type: String,
    },
    isAnalysis: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
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
    messages: [
      {
        sender: {
          type: String,
          required: true,
        },
        content: {
          type: String,
          default: '',
        },
        imageUrl: {
          type: String,
        },
        isAnalysis: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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
