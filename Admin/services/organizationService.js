const commonHelper = require("../../helpers/commonHelper");
//const emailTemplates = require("../emailSetUp/emailTemplates");
const emailTemplates = require("../../emailSetUp/dynamicEmailTemplate");
const emailService = require("../../services/emailService");
const emailConstants = require("../../constants/emailConstants");
const otpDemoLogs = require("../../models/otpDemoLogsModel");
const otpContactUsLogs = require("../../models/contactUsOtpLogs");
const DemoClient = require("../../models/demoClientsSchema");
const contactUs = require("../../models/contactUsModel");
const ObjectId = require("mongoose").Types.ObjectId;
const Organization = require("../../models/organizationModel");
const Employee = require ("../../models/employeeModel");
const AdminPanel = require("../models/adminPanelModel");
const authMiddleware = require("../../middlewares/authMiddleware");
//const authService = require("../services/authService")



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


module.exports ={
    organizationList,
}