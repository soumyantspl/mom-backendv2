const commonHelper = require("../helpers/commonHelper");
const emailTemplates = require("../emailSetUp/dynamicEmailTemplate");
const emailService = require("./emailService");
const contactUs = require("../models/contactUsModel");
const Employee = require("../models/employeeModel")
const Organization = require("../models/organizationModel");


const contactUsList = async (bodyData, queryData) => {
    const { order = "-1", sortBy = "createdAt" } = queryData; 
    let { searchKey = "", fromDate, toDate } = bodyData;
    searchKey = searchKey.trim();

   // let query = {};
   let query = { isDelete: false };

   
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
//     if (!contact) {
//         return false;
//     }

//     // Find employee details using the provided ID
//     const employee = await Employee.findById(data.forwardedTo);
//     if (!employee) {
//         return false;
//     }
// console.log("employeeeeee---", employee);
//     // Update lead status
//     contact.leadStatus.status = "forwarded";
//     contact.leadStatus.reason = data.reason;
//     contact.leadStatus.forwardedTo = data.forwardedTo;
 

//     contact.leadStatus.timeAndDate = new Date();

//     await contact.save();
//     return  contact ;
// };

// const forwardLead = async (contactId, data) => {
//     const contact = await contactUs.findById({ _id: contactId });
//     if (!contact) {
//         return false;
//     }

    
//     const employee = await Employee.findById(data.forwardedTo);
//     if (!employee) {
//         return false;
//     }
//     console.log("employeeeeee---", employee);
//     // Update lead status
//     contact.leadStatus.status = "forwarded";
//     contact.leadStatus.reason = data.reason;
//     contact.leadStatus.forwardedTo = data.forwardedTo;
 

//     contact.leadStatus.timeAndDate = new Date();

//     await contact.save();
//     return  contact ;
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

const OrganizationStatusById =  async(orgId, data) => {
    const updatedOrganization = await Organization.findByIdAndUpdate(
        orgId,
        { isActive: data.isActive },
        { new: true }
    );
    return updatedOrganization;
}

  module.exports = {
    organizationList,
    contactUsList,
    cancelLead,
    closeLead,
    rejectLead,
    forwardLead,
    viewSingleLeadById,
    OrganizationStatusById
  };