const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
  {
    templateId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'professional' },
    isAtsFriendly: { type: Boolean, default: true },
    configuration: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Template', templateSchema);
