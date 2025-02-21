const mongoose = require("mongoose");
const rolesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default:true
    },
    permission: {
      read: {
        type: Boolean,
        required: true,
        default: true,
      },
      write: {
        type: Boolean,
        required: true,
        default: false,
      },
      edit: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Roles = mongoose.model("roles", rolesSchema);

module.exports = Roles;
