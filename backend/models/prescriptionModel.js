import mongoose from 'mongoose';

const prescriptionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    image: {
      type: String,
      required: true,
    },
    doctorName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    hospitalName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    prescriptionDate: {
      type: Date,
    },
    validUntil: {
      type: Date,
    },
    medications: [
      {
        name: {
          type: String,
          trim: true,
        },
        dosage: {
          type: String,
          trim: true,
        },
        frequency: {
          type: String,
          trim: true,
        },
        duration: {
          type: String,
          trim: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
