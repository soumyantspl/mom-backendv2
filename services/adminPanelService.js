const commonHelper = require("../helpers/commonHelper");
//const emailTemplates = require("../emailSetUp/emailTemplates");
const emailTemplates = require("../emailSetUp/dynamicEmailTemplate");
const emailService = require("./emailService");
const emailConstants = require("../constants/emailConstants");
const otpDemoLogs = require("../models/otpDemoLogsModel");
const otpContactUsLogs = require("../models/contactUsOtpLogs");
const DemoClient = require("../models/demoClientsSchema");
const contactUs = require("../models/contactUsModel");
const ObjectId = require("mongoose").Types.ObjectId;
const Organization = require("../models/organizationModel");
const Employee = require ("../models/employeeModel");
const AdminPanel = require("../models/adminPanelModel");
const authMiddleware = require("../middlewares/authMiddleware");
const authService = require("../services/authService")

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

   // let query = {};
   let query = { isDelete: false };

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

     // Format createdAt field in 12-hour format
     const formattedResult = result.map(item => ({
        ...item._doc,
        createdAt: commonHelper.formatTimeFormat(item.createdAt.toISOString()), 
    
        // Convert leadStatus.timeAndDate to 12-hour format if it exists
        leadStatus: item.leadStatus
            ? {
                ...item.leadStatus,
                timeAndDate: commonHelper.formatTimeFormat(new Date(item.leadStatus.timeAndDate).toISOString())
            }
            : null
    }));
    

    return { totalCount, data: formattedResult };
};

//Function to Cancel Lead
const cancelLead = async (contactId, data) => {
    const contact = await contactUs.findOne({ _id: contactId });
    
    if (!contact) {
        return false;
    }
    
    if (contact.leadStatus.status === "cancelled") {
        return { alreadyCancelled: true };
    }

    contact.leadStatus.status = "cancelled";
    contact.leadStatus.reason = data.reason;
    contact.leadStatus.timeAndDate = new Date();
    
    contact.isDelete = true;
    await contact.save();
    return contact;
};



// Function to Close Lead
const closeLead = async (contactId, data) => {
    const contact = await contactUs.findById({ _id: contactId });
    
    if (!contact) {
        return false;
    }

    if (contact.leadStatus.status === "closed") {
        return { alreadyClosed: true };
    }
    
    contact.leadStatus.status = "closed";
    contact.leadStatus.reason = data.reason;
    contact.leadStatus.timeAndDate = new Date();
    
    await contact.save();
    return contact;
};

// Function to Reject Lead
const rejectLead = async (contactId, data) => {
    const contact = await contactUs.findById({ _id: contactId });
    
    if (!contact) {
        return false;
    }
    if (contact.leadStatus.status === "rejected") {
        return { alreadyRejected: true };
    }
    
    contact.leadStatus.status = "rejected";
    contact.leadStatus.reason = data.reason;
    contact.leadStatus.timeAndDate = new Date();
    
    await contact.save();
    return contact;
};



// const forwardLead = async (contactId, data) => {

//     const contact = await contactUs.findById({ _id: contactId });
//     if (contact) {

//         const forwardedUser = await Employee.findById(data.forwardedTo);
//         if (!forwardedUser) {
//             return false;
//         }
//         console.log("employeeeeee---", forwardedUser);

//         contact.leadStatus.status = "forwarded";
//         contact.leadStatus.reason = data.reason;
//         contact.leadStatus.forwardedTo = data.forwardedTo;
//         contact.leadStatus.forwardedUserName = forwardedUser.name,
     
    
//         contact.leadStatus.timeAndDate = new Date();
    
//         await contact.save();
//         return  contact ;

        
//     }
//     return false;

// };

const forwardLead = async (contactId, data, userData) => {
    
    const contact = await contactUs.findById(contactId);
    if (contact) {

        const forwardedUser = await Employee.findById(data.forwardedTo);

    if (!forwardedUser) {
        return false;
    }

    console.log("forwardedUser---", forwardedUser);

    contact.leadStatus = {
        status: "forwarded",
        reason: data.reason,
        forwardedTo: data.forwardedTo,
        forwardedUserName : forwardedUser.name,
        timeAndDate: new Date(),
    };

    
    await contact.save();

    console.log("userData---", userData);
    const logo = process.env.LOGO;

    
    const mailData = await emailTemplates.forwardLeadEmailTemplate({
        contact,
        forwardedUser,
        userData,
        logo,
        reason: data.reason,
    });

    
    await emailService.sendEmail(
        forwardedUser.email,
        "Lead Forwarded Notification",
        mailData.subject,
        mailData.mailBody
    );
    
    return contact ;
     
    }
 
    return false;
};



const viewSingleLeadById = async (contactId) => {
    const lead = await contactUs.findOne({ _id: contactId, isDelete: false });

    if (!lead) {
        return null;
    }

    return lead;
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

        const formattedResult = result.map(item => ({
            ...item._doc,
            createdAt: commonHelper.formatTimeFormat(item.createdAt.toISOString()) // Convert Date to String
        }));

    return { totalCount, data: formattedResult };
};


const loginByPassword = async (bodyData) => {
    const { email, password } = bodyData;

   
    const user = await AdminPanel.findOne({ email });

    console.log("User Found:", user); 

    
    if (!user) {
        return false; 
    }

     const decrypPassword = await commonHelper.decryptWithAES(password);
    const passwordIsValid = await commonHelper.verifyPassword(decrypPassword, user.password);

    if (!passwordIsValid) {
        return "invalidPassword"; 
    }
    const token = await authMiddleware.generateUserToken({
        userId: user._id,
        name: user.name,
      });
      delete user.password;
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
    };
};


// const setPassword = async (bodyData) => {
//     const { email, newPassword } = bodyData;

    
//     const user = await AdminPanel.findOne({ email });

//     if (!user) {
//         return false; 
//     }

//     const hashedPassword = await commonHelper.generetHashPassword(newPassword);
//     user.password = hashedPassword;
//     await user.save();

//     return true; 
// };

const setPassword = async (bodyData) => {
    const { email, newPassword ,otp} = bodyData;
    const user = await AdminPanel.findOne({ email });

    if (user) {

        const otpData = {
            email: email,
            otp: otp,
        };
       // const isOtpVerified = await getOtpLogs(otpData);
       const isOtpVerified = await authService.getOtpLogs(otpData);
    
        if (isOtpVerified.length !== 0) {
           
        const decryptedPassword = await commonHelper.decryptWithAES(newPassword);
            console.log("Decrypted Password---",decryptedPassword);
        
        const hashedPassword = await commonHelper.generetHashPassword(newPassword);
    
        // // Log the password change event
        // const logData = {
        //     moduleName: logMessages.authModule.moduleName,
        //     userId: user._id,
        //     action: logMessages.authModule.setPassword,
        //     ipAddress,
        //     details: logMessages.authModule.setPasswordDetails,
        //     organizationId: user.organizationId,
        // };
        // await logService.createLog(logData);
    
       
        user.password = hashedPassword;
        await user.save();
        return true;
        }
    
        return { isInValidOtp: true };
  
    }

    return false;
   
};


const addAdmin = async (bodyData) => {
    const { name, email, password } = bodyData;

    
    const existingAdmin = await AdminPanel.findOne({ email });
    if (existingAdmin) {
        return  null ;
    }

    const hashedPassword = await commonHelper.generetHashPassword(password);

    const newAdmin = new AdminPanel({ name, email, password: hashedPassword });

    const savedAdmin = await newAdmin.save();

    return  savedAdmin ;
};






  module.exports = {
    organizationList,
    contactUsList,
    cancelLead,
    closeLead, 
    rejectLead ,
    forwardLead,
    viewSingleLeadById,
    loginByPassword,
    setPassword,
    addAdmin
  };
