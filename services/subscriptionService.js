const Subscription = require("../models/subscriptionModel");

const addSubscription = async (data) => {
    const newSubscription = new Subscription({
        planType: data.planType,
        participantLimit: data.participantLimit,
        meetingCount: data.meetingCount,
        meetingDuration: data.meetingDuration,
        price: data.price,
        billingCycle: data.billingCycle,
        validity: data.validity,
        isActive: true, 
    });

    return await newSubscription.save();
};

module.exports = {
    addSubscription,
};
