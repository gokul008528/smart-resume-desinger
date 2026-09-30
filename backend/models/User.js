const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    profileImage: { type: String, default: '' },
    phone: { type: String, default: '', maxlength: 30 },
    location: { type: String, default: '', maxlength: 120 },
    professionalTitle: { type: String, default: '', maxlength: 120 },
    bio: { type: String, default: '', maxlength: 1000 },
    linkedin: { type: String, default: '', maxlength: 255 },
    github: { type: String, default: '', maxlength: 255 },
    portfolio: { type: String, default: '', maxlength: 255 },
    skills: { type: [String], default: [] },
    yearsOfExperience: { type: Number, default: 0, min: 0, max: 60 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
