const mongoose = require("mongoose");

const zoomSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true,
  },
  secretToken: {
    type: String,
    required: true,
  },
  accountId: {
    type: String,
    required: true,
  },
  hostKey: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const gMeetSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true,
  },
  secretToken: {
    type: String,
    required: true,
  },
  accountId: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  tokenData: {
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    scope: {
      type: [String], // Explicitly defining it as an array of strings
      default: [],
    },
    tokenType: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: String,
      required: true,
    },
  },
});

const msTeamSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true,
  },
  secretToken: {
    type: String,
    required: true,
  },
  accountId: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const hostingDetailsSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    hostType: {
      type: String,
      enum: ["ZOOM", "GMEET", "MSTEAMS"],
      required: true,
      default: "ZOOM",
    },

    zoomCredentials: {
      type: zoomSchema,
      required: function () {
        return this.hostType === "ZOOM";
      },
    },
    gMeetCredentials: {
      type: gMeetSchema,
      required: function () {
        return this.hostType === "GMEET";
      },
    },
    msTeamCredentials: {
      type: msTeamSchema,
      required: function () {
        return this.hostType === "ZOOM";
      },
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const HostingDetails = mongoose.model("hostingdetails", hostingDetailsSchema);
module.exports = HostingDetails;
