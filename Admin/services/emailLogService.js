const commonHelper = require("../../helpers/commonHelper");
const EmailLogs = require("../../models/emailLogsModel");



const emailLogList = async (bodyData, queryData) => {
    const { limit, page, order = -1, sortBy = "createdAt" } = queryData;
    let { searchKey = "", fromDate, toDate } = bodyData;
    searchKey = searchKey.trim();

    let query = {};

    
    if (searchKey.length > 0) {
        query.$or = [
            { emailType: { $regex: new RegExp(searchKey, "i") } },
            { emailTo: { $regex: new RegExp(searchKey, "i") } },
            { subject: { $regex: new RegExp(searchKey, "i") } },
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

    
    const totalCount = await EmailLogs.countDocuments(query);

    
    const validLimit = parseInt(limit) || 10;
    const validPage = parseInt(page) || 1;
    const skip = (validPage - 1) * validLimit;

    
    const result = await EmailLogs.find(query)
        .sort({ [sortBy]: parseInt(order) })
        .skip(skip)
        .limit(validLimit);

    
    const formattedResult = result.map(item => ({
        ...item._doc,
        createdAt: commonHelper.formatTimeFormat(item.createdAt.toISOString())
    }));

    return { totalCount, data: formattedResult };
};

module.exports = { emailLogList };
