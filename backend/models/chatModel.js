import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
      enum: ['user', 'ai', 'system'],
    },
    content: {
      type: String,
      default: '',
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'analysis', 'system'],
      default: 'text',
    },
    imageUrl: {
      type: String,
    },
    imageMetadata: {
      originalName: String,
      size: Number,
      mimeType: String,
      analysisStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
      },
    },
    analysisData: {
      model: String,
      confidence: Number,
      ocrText: String,
      findings: [String],
      recommendations: [String],
    },
    isAnalysis: {
      type: Boolean,
      default: false,
    },
    reactions: [
      {
        type: {
          type: String,
          enum: ['helpful', 'not_helpful', 'accurate', 'inaccurate'],
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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
    title: {
      type: String,
      default: 'New Medical Analysis',
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: [
        'blood_test',
        'urine_test',
        'x_ray',
        'mri',
        'ct_scan',
        'ultrasound',
        'ecg',
        'ai_chat',
        'other',
      ],
      default: 'ai_chat',
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'completed'],
      default: 'active',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    tags: [String],
    messages: [messageSchema],
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    imageCount: {
      type: Number,
      default: 0,
    },
    analysisCount: {
      type: Number,
      default: 0,
    },
    metadata: {
      patientAge: Number,
      patientGender: String,
      reportDate: Date,
      hospitalName: String,
      doctorName: String,
    },
    privacy: {
      isShared: {
        type: Boolean,
        default: false,
      },
      sharedWith: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          permission: {
            type: String,
            enum: ['view', 'comment', 'edit'],
            default: 'view',
          },
          sharedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
chatSchema.index({ user: 1, status: 1 });
chatSchema.index({ lastActivity: -1 });
chatSchema.index({ category: 1 });
chatSchema.index({ 'messages.sender': 1 });

// Middleware to update counts and lastActivity
chatSchema.pre('save', function (next) {
  if (this.isModified('messages')) {
    this.messageCount = this.messages.length;
    this.imageCount = this.messages.filter((msg) => msg.imageUrl).length;
    this.analysisCount = this.messages.filter((msg) => msg.isAnalysis).length;
    this.lastActivity = new Date();
  }
  next();
});

// Virtual for formatted last activity
chatSchema.virtual('formattedLastActivity').get(function () {
  const now = new Date();
  const diff = now - this.lastActivity;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return this.lastActivity.toLocaleDateString();
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
