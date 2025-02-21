const Notification = require("../models/notificationModel");
const commonHelper = require("../helpers/commonHelper");
const ObjectId = require("mongoose").Types.ObjectId;

/**FUNC- CREATE NOTIFICATION */
const createNotification = async (data, ipAddress = "1000") => {
  const inputData = data;
  const notificationData = new Notification(inputData);
  const result = await notificationData.save();
  return result;
};
/**FUNC- EDIT NOTIFICATION */
const editNotification = async (id, data, userId, ipAddress = "1000") => {
  const notificationData = await Notification.findByIdAndUpdate(
    { _id: new ObjectId(id) },
    data,
    {
      new: true, 
    }
  );
  return notificationData;
};
/**FUNC- TO VIEW NOTIFICATION */
const viewNotification = async (bodyData, userId) => {;
  const { organizationId, searchKey } = bodyData;
  let query = {
    organizationId: new ObjectId(organizationId),
    isActive: true,
    isDelete: false,
  }
  if (bodyData?.isRead) {
    query["isRead"] = bodyData?.isRead;
  }
  if (bodyData?.isImportant) {
    query["isImportant"] = bodyData?.isImportant;
  }
  if (bodyData?.isRead==false) {
    query["isRead"] = false;
  }
  const totalCount = await Notification.countDocuments(query);
  const notificationDatas = await Notification.aggregate([
    {
      $match: query,
    },
    {
      $lookup: {
        from: "meetings",
        localField: "meetingId",
        foreignField: "_id",
        as: "meetingDetail",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "byUserId",
        foreignField: "_id",
        as: "byUserDetail",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "toUserId",
        foreignField: "_id",
        as: "toUserDetail",
      },
    },
    {
      $unwind: {
        path: "$meetingDetail",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$byUserDetail",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$toUserDetail",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        byUserId: 1,
        isRead: 1,
        organizationId: 1,
        isImportant: 1,
        isActive: 1,
        createdAt: 1,
        isDelete: 1,
        details: 1,
        allowedUsers: 1,
        toUserId: 1,
        typeId: 1,
        type: 1,
        meetingDetail: {
          title: 1,
          _id: 1,
        },
        byUserDetail: {
          name: 1,
          _id: 1,
        },
        toUserDetail: {
          name: 1,
          _id: 1,
        },
      },
    },
  ]).sort({ _id: -1 });
  const notificationList = notificationDatas.map((notification) => {
    const date = commonHelper.formatDateTimeFormat(
      notification.createdAt
    ).formattedDate;
    const time = commonHelper.formatDateTimeFormat(
      notification.createdAt
    ).formattedTime;
    const updateObject = {
      _id: notification._id,
      title: notification.title,
      date,
      toUserId: notification.toUserId,
      byUserId: notification.byUserId,
      typeId: notification.typeId,
      type: notification.type,
      organizationId: notification.organizationId,
      isRead: notification.isRead,
      isDelete: notification.isDelete,
      isImportant: notification.isImportant,
      isActive: notification.isActive,
      createdAt: notification.createdAt,
      details: notification?.details?.byDetails
        ? notification?.details?.byDetails + notification?.byUserDetail?.name
        : notification?.details?.toDetails + notification?.toUserDetail?.name,
      meetingTitle: notification?.meetingDetail?.title,
      userName: notification?.byUserDetail?.name,
      time,
      allowedUsers: notification?.allowedUsers?.map((user) => user.toString()),
    };
    return updateObject;
  });
  return {
    totalCount,
    notificationList,
  };
};
/**FUNC- DELETE NOTIFICATION */
const deleteNotification = async (userId, id, ipAddress = "1000") => {
  return await Notification.findByIdAndUpdate(
    { _id: new ObjectId(id) },
    { isActive: false },
    {
      new: true,
    }
  );
};
module.exports = {
  createNotification,
  editNotification,
  viewNotification,
  deleteNotification,
};
