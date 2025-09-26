import mongoose from 'mongoose';

const healthConditionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const HealthCondition = mongoose.model(
  'HealthCondition',
  healthConditionSchema
);

export default HealthCondition;
