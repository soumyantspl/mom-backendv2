const Logs = require("../models/logsModel");
const ObjectId = require("mongoose").Types.ObjectId;
const commonHelper = require("../helpers/commonHelper");
/**FUNC- CREATE LOG */
const createLog = async (data) => {
  const logData = await Logs.findOne({}).sort({ createdAt: -1 });
  data.serialNumber = logData ? logData.serialNumber + 1 : 1;
  const newLogs = new Logs(data);
  return await newLogs.save();
};
/**FUNC- LIST ALL LOG */
const viewLogs = async (bodyData, queryData) => {
  const { order } = queryData;
  const { searchKey } = bodyData;
  const organizationId = new ObjectId(bodyData.organizationId);
  let query = {
    organizationId,
  };
  if (searchKey) {
    query.$or = [
      { details: { $regex: searchKey, $options: "i" } },
    ];
  }
  const limit = parseInt(queryData.limit);
  const skip = (parseInt(queryData.page) - 1) * parseInt(limit);
  const totalCount = await Logs.countDocuments(query);
  const logsDatas = await Logs.aggregate([
    {
      $match: query,
    },
    {
      $lookup: {
        from: "employees",
        localField: "userId",
        foreignField: "_id",
        as: "userDetail",
      },
    },
    {
      $project: {
        moduleName: 1,
        serialNumber: 1,
        action: 1,
        ipAddress: 1,
        details: 1,
        subDetails: 1,
        createdAt: 1,
        updatedAt: 1,
        userDetail: {
          name: 1,
          _id: 1,
        },
      },
    },
    { $unwind: "$userDetail" },
  ])
    .sort({ createdAt: parseInt(order) })
    .skip(skip)
    .limit(limit);
  const formattedLogsData = logsDatas.map((t) => {
    const { formattedTime, formattedDate } = commonHelper.formatDateTimeFormat(
      t.updatedAt
    );
    return {
      ...t,
      formattedDate,
      formattedTime,
    };
  });
  return {
    totalCount,
    logsDatas: formattedLogsData,
  };
};

module.exports = {
  createLog,
  viewLogs,
};
