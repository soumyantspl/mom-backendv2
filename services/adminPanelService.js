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
//     const { limit = 10, page = 1, order = -1 } = params; 
//     let { searchKey = "", fromDate, toDate } = body;
//     searchKey = searchKey.trim();

//     let query = {};

    
//     if (searchKey.length > 0) {
//         query.$or = [
//             { name: { $regex: new RegExp(searchKey, "i") } },
//             { email: { $regex: new RegExp(searchKey, "i") } },
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

   
//     const skip = (page - 1) * limit;
//     const options = { limit: parseInt(limit), skip, sort: { createdAt: order } };

//     const result = await contactUs.find(query, null, options);
//     const totalCount = await contactUs.countDocuments(query);

//     return { totalCount, result };
// };

const contactUsList = async (params = {}, body = {}) => {
    const { limit = 5, page = 1, order = -1 } = params; 
    let { searchKey = "", fromDate, toDate } = body;
    searchKey = searchKey.trim();

    let query = {};

    
    // if (searchKey.length > 0) {
    //     query.$or = [
    //         { name: { $regex: new RegExp(searchKey, "i") } },
    //         { email: { $regex: new RegExp(searchKey, "i") } },
    //         { phoneNo: { $regex: new RegExp(searchKey, "i") } },
    //     ];
    // }

    if (!isNaN(searchKey) && searchKey.length > 0) {
       
        query.phoneNo = parseInt(searchKey);
    } else if (searchKey.length > 0) {
        
        query.$or = [
            { name: { $regex: new RegExp(searchKey, "i") } },
            { email: { $regex: new RegExp(searchKey, "i") } }
        ];
    }

    
    if (fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        query.createdAt = {
            $gte: new Date(from.setDate(from.getDate())),
            $lt: new Date(to.setDate(to.getDate() + 1)), 
        };
    } else if (fromDate) {
        const from = new Date(fromDate);
        query.createdAt = {
            $gte: new Date(from.setDate(from.getDate())),
        };
    }

    
    const totalCount = await contactUs.countDocuments(query);
   // const totalPages = Math.ceil(totalCount / limit);

    
    const skip = (page - 1) * limit;
    const options = { limit: parseInt(limit), skip, sort: { createdAt: order } };

    const result = await contactUs.find(query, null, options);

    return { 
        totalCount, 
      //  totalPages, 
        currentPage: page, 
        data:result };
};




  module.exports = {
  
    contactUsList
  };