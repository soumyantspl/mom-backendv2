const commonHelper = require("../helpers/commonHelper");
//const emailTemplates = require("../emailSetUp/emailTemplates");
const emailTemplates = require("../emailSetUp/dynamicEmailTemplate");
const emailService = require("./emailService");
const emailConstants = require("../constants/emailConstants");
const otpDemoLogs = require("../models/otpDemoLogsModel");
const otpContactUsLogs = require("../models/contactUsOtpLogs");
const DemoClient = require("../models/demoClientsSchema");
const contactUs = require("../models/contactUsModel");

const Organization = require("../models/organizationModel");
const BASE_URL = process.env.BASE_URL;



// const contactUsList = async (params = {}, body = {}) => {
//     const { limit = 5, page = 1, order = -1 } = params; 
//     let { searchKey = "", fromDate, toDate } = body;
//     searchKey = searchKey.trim();

//     let query = {};

    
//     // if (searchKey.length > 0) {
//     //     query.$or = [
//     //         { name: { $regex: new RegExp(searchKey, "i") } },
//     //         { email: { $regex: new RegExp(searchKey, "i") } },
//     //         { phoneNo: { $regex: new RegExp(searchKey, "i") } },
//     //     ];
//     // }

//     if (!isNaN(searchKey) && searchKey.length > 0) {
       
//        // query.phoneNo = parseInt(searchKey);
//        query.$expr = {
//         $regexMatch: { input: { $toString: "$phoneNo" }, regex: searchKey, options: "i" }
//     };

//     } else if (searchKey.length > 0) {
        
//         query.$or = [
//             { name: { $regex: new RegExp(searchKey, "i") } },
//             { email: { $regex: new RegExp(searchKey, "i") } }
//         ];
//     }

    
//     if (fromDate && toDate) {
//         const from = new Date(fromDate);
//         const to = new Date(toDate);
//         query.createdAt = {
//             $gte: new Date(from.setDate(from.getDate())),
//             $lt: new Date(to.setDate(to.getDate() + 1)), 
//         };
//     } else if (fromDate) {
//         const from = new Date(fromDate);
//         query.createdAt = {
//             $gte: new Date(from.setDate(from.getDate())),
//         };
//     }

    
//     const totalCount = await contactUs.countDocuments(query);
//     const totalPages = Math.ceil(totalCount / limit);

    
//     const skip = (page - 1) * limit;
//     const options = { limit: parseInt(limit), skip, sort: { createdAt: order } };

//     const result = await contactUs.find(query, null, options);

//     return { totalCount, totalPages, currentPage: page, data:result };
// };

const contactUsList = async (bodyData, queryData) => {
    const { order = "-1", sortBy = "createdAt" } = queryData; 
    let { searchKey = "", fromDate, toDate } = bodyData;
    searchKey = searchKey.trim();

    let query = {};

    // Handle search key for name, email, and phone number
    if (searchKey.length > 0) {
        if (!isNaN(searchKey)) {
            query.$expr = {
                $regexMatch: { input: { $toString: "$phoneNo" }, regex: searchKey, options: "i" }
            };
        } else {
            query.$or = [
                { name: { $regex: new RegExp(searchKey, "i") } },
                { email: { $regex: new RegExp(searchKey, "i") } }
            ];
        }
    }

    
    if (fromDate || toDate) {
        query.createdAt = {};
        if (fromDate) {
            query.createdAt.$gte = new Date(fromDate);
        }
        if (toDate) {
            query.createdAt.$lt = new Date(new Date(toDate).setDate(new Date(toDate).getDate() + 1));
        }
    }

    const totalCount = await contactUs.countDocuments(query);

    
    const limit = parseInt(queryData.limit) || 5; 
    const page = parseInt(queryData.page) || 1; 
    const skip = (page - 1) * limit;

    
    const sortOrder = parseInt(order);
    const sortField = sortBy; 

    const options = {
        limit,
        skip,
        sort: { [sortField]: sortOrder } 
    };

    console.log("Query:", query);
    console.log("Sort options:", options.sort);

    const result = await contactUs.find(query, null, options);

    return { totalCount, data: result };
};

//Function to Cancel Lead
const cancelLead = async (contactId, data) => {
    const contact = await contactUs.findById(contactId);
    
    if (!contact) {
        return null;
    }
    
    contact.leadStatus.status = data.status;
    contact.leadStatus.reason = data.reason;
    contact.leadStatus.timeAndDate = new Date();
    
    await contact.save();
    return contact;
};



// Function to Close Lead
const closeLead = async (contactId, data) => {
    const contact = await contactUs.findById(contactId);
    
    if (!contact) {
        return null;
    }
    
    contact.leadStatus.status = data.status;
    contact.leadStatus.reason = data.reason;
    contact.leadStatus.timeAndDate = new Date();
    
    await contact.save();
    return contact;
};

// Function to Reject Lead
const rejectLead = async (contactId, data) => {
    const contact = await contactUs.findById(contactId);
    
    if (!contact) {
        return null;
    }
    
    contact.leadStatus.status = data.status;
    contact.leadStatus.reason = data.reason;
    contact.leadStatus.timeAndDate = new Date();
    
    await contact.save();
    return contact;
};





const organizationList = async (bodyData, queryData) => {
    const { limit, page, order = -1, sortBy = "createdAt" } = queryData;
    let { searchKey = "", fromDate, toDate } = bodyData;
    searchKey = searchKey.trim();

    let query = {};

   
    if (searchKey.length > 0) {
        query.$or = [
            { name: { $regex: new RegExp(searchKey, "i") } },
            { email: { $regex: new RegExp(searchKey, "i") } },
            { contactPersonName: { $regex: new RegExp(searchKey, "i") } }
        ];
    }

    
    if (fromDate || toDate) {
        query.createdAt = {};
        if (fromDate) {
            query.createdAt.$gte = new Date(fromDate);
        }
        if (toDate) {
            query.createdAt.$lt = new Date(new Date(toDate).setDate(new Date(toDate).getDate() + 1));
        }
    }

    
    const totalCount = await Organization.countDocuments(query);

    
    const validLimit = parseInt(limit) || 5; 
    const validPage = parseInt(page) || 1; 
    const skip = (validPage - 1) * validLimit;

    
    const result = await Organization.find(query)
        .sort({ [sortBy]: parseInt(order) })
        .skip(skip)
        .limit(validLimit);

    return { totalCount, data: result };
};







  module.exports = {
    organizationList,
    contactUsList,
    cancelLead,
    closeLead, 
    rejectLead 
  };
