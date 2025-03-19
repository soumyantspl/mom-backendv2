const Subscription = require("../models/subscriptionModel");

const addSubscription = async (data) => {
    
    const existingSubscription = await Subscription.findOne({ planType: data.planType });

    if (existingSubscription) {
        return { existingSubscription:true };
    }

    
    const newSubscription = new Subscription({
        planType: data.planType,
        participantLimit: data.participantLimit,
        meetingCount: data.meetingCount,
        meetingDuration: data.meetingDuration,
        price: data.price,
        billingCycle: data.billingCycle,
        validity: data.validity,
    });

    return await newSubscription.save();
};

// SUBSCRIPTION LIST 

const subscriptionList = async () => {
    
    const totalCount = await Subscription.countDocuments();
    const result = await Subscription.find().sort({ createdAt: 1 });

    return { totalCount,  result };
};

const updateSubscription = async (id, data) => {
 

    const existingSubscription = await Subscription.findById(id);
    if (!existingSubscription) {
        return  false ;
    }

    if (data.planType) {
        const duplicatePlan = await Subscription.findOne({ 
            planType: data.planType, 
            _id: { $ne: id }  
        });

        if (duplicatePlan) {
            return { existingSubscription: true };
        }
    }

    const updatedSubscription = await Subscription.findByIdAndUpdate(id, data, { new: true });
    return updatedSubscription;
};

const deleteSubscription = async (id) => {
    const deletedSubscription = await Subscription.findByIdAndDelete(id);

    if (!deletedSubscription) {
        return  null;
    }

    return deletedSubscription;  
};

const getSubscriptionById = async (id) => {
    const subscription = await Subscription.findById(id);
    
    if (!subscription) {
        return null;
    }

    return subscription;
};

module.exports = {
    addSubscription,
    subscriptionList,
    updateSubscription,
    deleteSubscription,
    getSubscriptionById
};
