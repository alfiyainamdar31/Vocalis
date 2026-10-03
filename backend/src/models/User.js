// server/src/models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    // Permanently active TOTP secret
    twoFactorSecret: {
      type: String,
      default: "",
    },

    // Temporary secret while user is setting up 2FA
    twoFactorPendingSecret: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,

      transform: (_doc, ret) => {
        ret.id = ret._id.toString();

        delete ret._id;
        delete ret.__v;

        // Never expose password or TOTP secrets to frontend
        delete ret.passwordHash;
        delete ret.twoFactorSecret;
        delete ret.twoFactorPendingSecret;

        return ret;
      },
    },
  },
);

module.exports = mongoose.model("User", userSchema);
