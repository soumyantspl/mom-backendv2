const commonHelper = require("../helpers/commonHelper");
//const emailTemplates = require("../emailSetUp/emailTemplates");
const emailTemplates = require("../emailSetUp/dynamicEmailTemplate");
const emailService = require("./emailService");
const emailConstants = require("../constants/emailConstants");
const otpDemoLogs = require("../models/otpDemoLogsModel");
const otpContactUsLogs = require("../models/contactUsOtpLogs");
const DemoClient = require("../models/demoClientsSchema");
const contactUs = require("../models/contactUsModel");
const AdminPanel = require("../models/adminPanelModel");
const authMiddleware = require("../middlewares/authMiddleware");


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


const setPassword = async (bodyData) => {
    const { email, newPassword } = bodyData;

    
    const user = await AdminPanel.findOne({ email });

    if (!user) {
        return false; 
    }

    const hashedPassword = await commonHelper.generetHashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    return true; 
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
    addAdmin,
    loginByPassword,
    setPassword
  };