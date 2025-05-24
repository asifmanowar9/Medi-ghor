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
      required: true,
      validate: {
        validator: function (password) {
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
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
