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



const contactUsList = async (bodyData, queryData) => {
    const { order = "-1", sortBy = "createdAt" } = queryData; 
    let { searchKey = "", fromDate, toDate } = bodyData;
    searchKey = searchKey.trim();

    let query = {};

   
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


  module.exports = {
  
    contactUsList
  };