import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        // Password is not required for Firebase/Google users
        return !this.firebaseUid;
      },
      validate: {
        validator: function (password) {
          // Skip validation if no password (Firebase users)
          if (!password) return true;
          // Password must contain at least one uppercase letter, one lowercase letter,
          // one number, and one special character
          return (
            /[A-Z]/.test(password) && // has uppercase letter
            /[a-z]/.test(password) && // has lowercase letter
            /[0-9]/.test(password) && // has number
            /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
          ); // has special char
        },
        message:
          'Password must have at least one uppercase letter, one lowercase letter, one number, and one special character',
      },
    },
    firebaseUid: {
      type: String,
      sparse: true, // Allows multiple null values
      unique: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'firebase', 'google'],
      default: 'local',
    },
    photoURL: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      enum: ['normal_user', 'operator', 'super_admin'],
      default: 'normal_user',
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    prescriptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription',
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  // Skip password hashing for Firebase users or if password hasn't changed
  if (!this.isModified('password') || !this.password) {
    next();
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
