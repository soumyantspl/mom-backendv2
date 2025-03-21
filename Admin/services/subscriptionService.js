const Subscription = require("../models/subscriptionModel");
const ObjectId = require("mongoose").Types.ObjectId;


const addSubscription = async (data) => {
    
    // const existingSubscription = await Subscription.findOne({ planType: data.planType });

    // if (existingSubscription) {
    //     return { existingSubscription:true };
    // }

    
    const newSubscription = new Subscription({
        planType: data.planType,
        participantLimit: data.participantLimit,
        meetingCount: data.meetingCount,
        meetingDuration: data.meetingDuration,
        price: parseFloat(data.price),
        billingCycle: data.billingCycle,
        validity: data.validity,
    });

    return await newSubscription.save();
};

// SUBSCRIPTION LIST 
// const subscriptionList = async (bodyData, queryData) => {
//     const { limit, page, order = -1, sortBy = "createdAt" } = queryData;
//     let { searchKey = "", fromDate, toDate } = bodyData;
//     searchKey = searchKey.trim();

//     let query = {};

   
//     if (searchKey.length > 0) {
//         query.$or = [
//             { planType: { $regex: new RegExp(searchKey, "i") } }
//         ];
//     }

    
//     if (fromDate || toDate) {
//         query.createdAt = {};
//         if (fromDate) {
//             query.createdAt.$gte = new Date(fromDate);
//         }
//         if (toDate) {
//             query.createdAt.$lt = new Date(new Date(toDate).setDate(new Date(toDate).getDate() + 1));
//         }
//     }

    
//     const totalCount = await Subscription.countDocuments(query);

    
//     const validLimit = parseInt(limit) || 5;
//     const validPage = parseInt(page) || 1;
//     const skip = (validPage - 1) * validLimit;

    
//     const result = await Subscription.find(query)
//         .sort({ [sortBy]: parseInt(order) })
//         .skip(skip)
//         .limit(validLimit);

//     return { totalCount, data: result };
// };

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
