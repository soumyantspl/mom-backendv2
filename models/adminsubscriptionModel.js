const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }, // Plan Name (Basic, Pro, Business)
    price: {
        monthly: { type: Number, default: 0 }, // Monthly price
        yearly: { type: Number, default: 0 }, // Yearly price
    },
    userLimit: {
        type: String,
        required: true
    }, // Number of users (e.g., "1 user", "1-99 users")
    features: {
        meetingDuration: {
            type: String,
            required: true
        }, // e.g., "40 minutes", "30 hours"
        participantLimit: {
            type: Number,
            required: true
        }, // e.g., 100, 300
        teamChat: {
            type: Boolean,
            default: false
        },
        clips: {
            type: String,
            required: true
        }, // e.g., "Basic - 5 videos", "Unlimited videos"
        mailCalendar: {
            type: String,
            required: true
        }, // e.g., "Client", "Client & Service"
        cloudStorage: {
            type: String,
            default: "None"
        }, // e.g., "5GB", "Unlimited"
        docs: {
            type: String,
            required: true
        }, // e.g., "Basic - 10 docs", "Unlimited"
        notes: {
            type: Boolean,
            default: false
        },
        whiteboard: {
            type: String,
            required: true
        }, // e.g., "Basic - 3 boards", "Unlimited boards"
        scheduler: {
            type: Boolean,
            default: false
        },
        extras: {
            type: String,
            default: ""
        }, // e.g., "SSO, managed domains & more"
        aiCompanion: {
            type: Boolean,
            default: false
        },
        essentialApps: {
            type: Boolean,
            default: false
        }, // Free premium apps for 1 year
    },
    billingCycle: {
        type: String,
        enum: ["monthly", "yearly"],
        default: "monthly",
    }, // Default to Monthly
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
