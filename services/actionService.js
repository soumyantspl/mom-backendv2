const ActionComments = require("../models/commentsModel");
const Minutes = require("../models/minutesModel");
const Meeting = require("../models/meetingModel");
const MeetingActionReassignDetails = require("../models/meetingActionReassignDetails");
const Employee = require("../models/employeeModel");
const ActionActivities = require("../models/actionActivitiesModel");
const employeeService = require("./employeeService");
const notificationService = require("./notificationService");
const ObjectId = require("mongoose").Types.ObjectId;
const logMessages = require("../constants/logsConstants");
const logService = require("./logsService");
const commonHelper = require("../helpers/commonHelper");
const emailConstants = require("../constants/emailConstants");
//const emailTemplates = require("../emailSetUp/emailTemplates");
const emailTemplates = require("../emailSetUp/dynamicEmailTemplate");
const emailService = require("./emailService");
const meetingService = require("../services/meetingService");
const { pipeline } = require("nodemailer/lib/xoauth2");
//FUCNTION TO CREATE COMMENTS
const comments = async (userId, id, data, ipAddress = "1000") => {
  const inputData = {
    actionId: id,
    userId: userId,
    commentDescription: data.commentDescription,
  };
  const commentData = new ActionComments(inputData);
  const result = await commentData.save();
  return result;
};
/**FUNC-VIEW ACTION COMMENT */
const viewActionComment = async (id) => {
  const viewActionCommentList = await ActionComments.findById(id);
  return {
    viewActionCommentList,
  };
};
/**FUNC- ACTION REASSIGN REQUEST */
const actionReassignRequest = async (
  userId,
  id,
  data,
  userData,
  ipAddress = "1000"
) => {
  const updateData = {
    userId,
    dateTime: new Date(),
    requestDetails: data.requestDetails,
  };
  const result = await Minutes.findOneAndUpdate(
    {
      _id: new ObjectId(id),
      assignedUserId: new ObjectId(userId),
    },
    {
      $push: { reassigneRequestDetails: updateData },
      isRequested: true,
      isPending: true,
      actionStatus: "REQUESTFORREASSIGN",
    }
  );
  if (result) {
    const assignedUserDetail = await Employee.findOne(
      { _id: new ObjectId(userId) },
      { _id: 1, email: 1, name: 1 }
    );
    const actionActivityObject = {
      activityDetails: data.requestDetails,
      activityTitle: "ACTION FORWARD REQUESTED",
      minuteId: id,
      userId,
      status: "REQUESTFORREASSIGN",
      actionId: result?.minuteId,
    };
    "activityObject-->", actionActivityObject;
    const actionActivitiesResult = await createActionActivity(
      actionActivityObject
    );
    "actionActivitiesResult------------", actionActivitiesResult;
    const meetingDetails = await meetingService.viewMeeting(
      result?.meetingId,
      userId
    );
    meetingDetails;
    const allowedUsers = [
      new ObjectId(userId),
      result?.createdById,
      meetingDetails?.createdById,
    ];
    const notificationData = {
      title: "ACTION FORWARD REQUESTED",
      organizationId: new ObjectId(result.organizationId),
      meetingId: result?.meetingId,
      details: {
        byDetails: `Title: ${result?.title} is requested for forward by `,
        toDetails: null,
      },
      allowedUsers,
      byUserId: userId,
    };
    const addNotification = await notificationService.createNotification(
      notificationData
    );
    console.log("meetingDetails rr-->", meetingDetails);
    console.log("userData-->", userData.name);
    if (meetingDetails) {
      const logo = process.env.LOGO;
      const mailData = await emailTemplates.actionReassignRequestEmailTemplate(
        meetingDetails,
        logo,
        data.requestDetails,
        userData,
        result,


      );
      // const emailSubject = await emailConstants.reassignRequestSubject(
      //   meetingDetails
      // );
      const { emailSubject, mailData: mailBody } = mailData;
      "sendOtpEmailTemplate-----------------------maildata", mailData;
      "sendOtpEmailTemplate-----------------------emailSubject", emailSubject;
      emailService.sendEmail(
        meetingDetails?.createdByDetail?.email,
        "Reassign Requested",
        emailSubject,
        mailBody,
        // mailData
      );
    }
    //////////////////////LOGER START
    const logData = {
      moduleName: logMessages.Action.moduleName,
      userId,
      action: logMessages.Action.actionReassignRequested,
      ipAddress,
      details:
        "Action forward requested by <strong>" +
        commonHelper.convertFirstLetterOfFullNameToCapital(
          assignedUserDetail?.name
        ) +
        " (" +
        assignedUserDetail?.email +
        ") </strong>",
      subDetails: `
      Action : ${result?.title}</br>
      Meeting Title: ${meetingDetails.title} (${meetingDetails.meetingId})`,
      organizationId: result?.organizationId,
    };
    "logData-------------------", logData;
    await logService.createLog(logData);
    ///////////////////// LOGER END
  }
  return result;
};
/**FUNC- TO VIEW ALL ACTIONS */
const viewAllAction = async (bodyData, queryData) => {
  const { order } = queryData;
  const { organizationId, searchKey } = bodyData;
  let query = searchKey
    ? {
      organizationId: new ObjectId(organizationId),
      title: { $regex: searchKey, $options: "i" },
      isActive: true,
      isAction: true,
    }
    : {
      organizationId: new ObjectId(organizationId),
      isActive: true,
      isAction: true,
    };
  var limit = parseInt(queryData.limit);
  var skip = (parseInt(queryData.page) - 1) * parseInt(limit);
  const totalCount = await Minutes.countDocuments(query);
  const actionDatas = await Minutes.aggregate([
    {
      $match: query,
    },

    {
      $lookup: {
        from: "employees",
        localField: "assignedUserId",
        foreignField: "_id",
        as: "userDetail",
      },
    },
    {
      $project: {
        description: 1,
        isComplete: 1,
        isReopened: 1,
        isApproved: 1,
        dueDate: 1,
        userDetail: {
          name: 1,
          _id: 1,
        },
      },
    },
    { $unwind: "$userDetail" },
  ])
    .sort({ _id: parseInt(order) })
    .skip(skip)
    .limit(limit);
  return {
    totalCount,
    actionDatas,
  };
};

/**FUNC- TO VIEW ALL USER ACTIONS */
const viewUserAllAction = async (bodyData, queryData, userId, userData) => {
  const { order } = queryData;
  const { organizationId, searchKey } = bodyData;
  let query = null;

  if (userData.isAdmin) {
    query = searchKey
      ? {
        organizationId: new ObjectId(organizationId),
        title: { $regex: searchKey, $options: "i" },
        isActive: true,
        isAction: true,
      }
      : {
        organizationId: new ObjectId(organizationId),
        isActive: true,
        isAction: true,
      };

    if (bodyData.fromDate && bodyData.toDate) {
      const fromDate = new Date(bodyData.fromDate);
      const toDate = new Date(bodyData.toDate);
      query.dueDate = {
        $gte: new Date(fromDate.setDate(fromDate.getDate())),
        $lt: new Date(toDate.setDate(toDate.getDate() + 1)),
      };
    }
    if (bodyData.fromDate && !bodyData.toDate) {
      const fromDate = new Date(bodyData.fromDate);
      query.dueDate = {
        $gte: new Date(fromDate.setDate(fromDate.getDate())),
      };
    }
    if (!bodyData.fromDate && bodyData.toDate) {
      const toDate = new Date(bodyData.toDate);
      query.dueDate = {
        $lt: new Date(toDate.setDate(toDate.getDate() + 1)),
      };
    }
    if (bodyData.createdById) {
      query["createdById"] = new ObjectId(bodyData.createdById);
      // delete query.assignedUserId;
    }
    if (bodyData.assignedUserId) {
      query["assignedUserId"] = new ObjectId(bodyData.assignedUserId);
      // delete query.assignedUserId;
    }
    if (bodyData.actionStatus && bodyData.actionStatus == "PENDING") {
      // query["actionStatus"] = "PENDING";
      query["actionStatus"] = {
        $in: ["PENDING", "REQUESTFORREASSIGN", "REOPENED"],
      }; // Equivalent to OR condition
    }
    if (bodyData.actionStatus && bodyData.actionStatus == "COMPLETED") {
      // query["actionStatus"] = "COMPLETED";
      query["actionStatus"] = {
        $in: ["APPROVED", "COMPLETED"],
      }; // Equivalent to OR condition

    }
    if (
      bodyData.actionStatus &&
      bodyData.actionStatus == "REQUESTFORREASSIGN"
    ) {
      query["actionStatus"] = "REQUESTFORREASSIGN";
    }
    if (bodyData.actionStatus && bodyData.actionStatus == "REASSIGNED") {
      query["actionStatus"] = "REASSIGNED";
    }
    if (bodyData.actionStatus && bodyData.actionStatus == "REOPENED") {
      query["actionStatus"] = "REOPENED";
    }
    if (bodyData.actionStatus && bodyData.actionStatus == "APPROVED") {
      query["actionStatus"] = "APPROVED";
    }
    if (bodyData.actionStatus && bodyData.actionStatus == "CANCELLED") {
      query["actionStatus"] = "CANCELLED";
    }
    if (bodyData.meetingId) {
      query["meetingId"] = new ObjectId(bodyData.meetingId);
    }
  } else {
    query = searchKey
      ? {
        organizationId: new ObjectId(organizationId),
        title: { $regex: searchKey, $options: "i" },
        isActive: true,
        isAction: true,
        //  assignedUserId: userId,
      }
      : {
        organizationId: new ObjectId(organizationId),
        isActive: true,
        isAction: true,
        // assignedUserId: userId,
      };

    if (bodyData.fromDate && bodyData.toDate) {
      const fromDate = new Date(bodyData.fromDate);
      const toDate = new Date(bodyData.toDate);
      query.dueDate = {
        $gte: new Date(fromDate.setDate(fromDate.getDate())),
        $lt: new Date(toDate.setDate(toDate.getDate() + 1)),
      };
    }

    if (bodyData.fromDate && !bodyData.toDate) {
      const fromDate = new Date(bodyData.fromDate);
      query.dueDate = {
        $gte: new Date(fromDate.setDate(fromDate.getDate())),
      };
    }

    if (!bodyData.fromDate && bodyData.toDate) {
      const toDate = new Date(bodyData.toDate);
      query.dueDate = {
        $lt: new Date(toDate.setDate(toDate.getDate() + 1)),
      };
    }

    if (bodyData.assignedUserId) {
      query["assignedUserId"] = new ObjectId(bodyData.assignedUserId);
      // delete query.assignedUserId;
    }

    if (bodyData.createdById) {
      query["createdById"] = new ObjectId(bodyData.createdById);
      // delete query.assignedUserId;
    }
    if (bodyData.actionStatus && bodyData.actionStatus == "PENDING") {
      query["actionStatus"] = {
        $in: ["PENDING", "REQUESTFORREASSIGN", "REOPENED"],
      }; // Equivalent to OR condition
    }
    // query["$or"] = [
    //   // { assignedUserId: new ObjectId(userId) },
    //   { createdById: new ObjectId(userId) },
    //   { meetingId: { $in: [...meetingsIds, ...meetingIds] } },
    // ];
    if (bodyData.actionStatus && bodyData.actionStatus == "COMPLETED") {
      //  query["actionStatus"] = "COMPLETED";
      query["actionStatus"] = {
        $in: ["APPROVED", "COMPLETED"],
      }; // Equivalent to OR condition
    }
    if (
      bodyData.actionStatus &&
      bodyData.actionStatus == "REQUESTFORREASSIGN"
    ) {
      query["actionStatus"] = "REQUESTFORREASSIGN";
    }
    if (bodyData.actionStatus && bodyData.actionStatus == "REASSIGNED") {
      query["actionStatus"] = "REASSIGNED";
    }

    if (bodyData.actionStatus && bodyData.actionStatus == "REOPENED") {
      query["actionStatus"] = "REOPENED";
    }
    if (bodyData.actionStatus && bodyData.actionStatus == "APPROVED") {
      query["actionStatus"] = "APPROVED";
    }
    if (bodyData.actionStatus && bodyData.actionStatus == "CANCELLED") {
      query["actionStatus"] = "CANCELLED";
    }
    if (bodyData.meetingId) {
      query["meetingId"] = new ObjectId(bodyData.meetingId);
    }
    if (bodyData.meetingId) {
      query["meetingId"] = new ObjectId(bodyData.meetingId);
    }
  }
  var limit = parseInt(queryData.limit);
  var skip = (parseInt(queryData.page) - 1) * parseInt(limit);
  console.log("query==============================", query);
  let pipeLine = [
    {
      $match: query,
    },
    {
      $addFields: {
        completedDate: {
          $cond: {
            if: {
              $and: [
                { $gt: [{ $arrayElemAt: ["$isCompleteDetails", -1] }, null] },
                { $eq: ["$isReopened", false] },
              ],
            },
            then: { $arrayElemAt: ["$isCompleteDetails.dateTime", -1] }, // Use last element of the array
            //  then: { $arrayElemAt: ["$isCompleteDetails.dateTime", -1] }, // Use last element of the array
            else: "$$NOW", // Set to null or a default value
          },
        },
      },
    },
    {
      $addFields: {
        completedDate: {
          $dateTrunc: {
            date: "$completedDate",
            unit: "day",
          },
        },
      },
    },
    {
      $addFields: {
        delayCountInDays: {
          $dateDiff: {
            startDate: "$completedDate",
            endDate: "$mainDueDate",
            unit: "day",
          },
        },
        isDelayed: {
          $gt: [
            {
              $dateDiff: {
                startDate: "$mainDueDate",
                endDate: "$completedDate",
                unit: "day",
              },
            },
            0,
          ],
        },
      },
    },
    // {
    //   $addFields: {
    //     isDelayed: {
    //       $cond: {
    //         if: { $eq: ["$isReopened", false] },
    //         then: "$isDelayed", // Use last element of the array
    //         else: true, // Set to null or a default value
    //       },
    //     },
    //   },
    // },
    {
      $lookup: {
        from: "employees",
        localField: "createdById",
        foreignField: "_id",
        as: "userDetail",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "assignedUserId",
        foreignField: "_id",
        as: "assignedUserDetails",
      },
    },
    {
      $lookup: {
        from: "meetings",
        localField: "meetingId",
        foreignField: "_id",
        as: "meetingDetails",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "meetingDetails.attendees._id",
        foreignField: "_id",
        as: "attendeesDetail",
      },
    },
    {
      $project: {
        createdById: 1,
        completedDate: 1,
        delayCountInDays: 1,
        isDelayed: 1,
        dueDate: 1,
        isComplete: 1,
        description: 1,
        title: 1,
        meetingId: 1,
        priority: 1,
        isActive: 1,
        updatedAt: 1,
        isReopened: 1,
        isRequested: 1,
        isPending: 1,
        minuteId: 1,
        isApproved: 1,
        assignedUserId: 1,
        organizationId: 1,
        isAction: 1,
        reassignDetails: 1,
        reassigneRequestDetails: 1,
        isCompleteDetails: 1,
        actionStatus: 1,
        mainDueDate: 1,
        isCancelled: 1,
        userDetail: {
          name: 1,
          _id: 1,
        },
        meetingDetails: {
          title: 1,
          meetingId: 1,
          _id: 1,
          attendees: 1,
          date: 1,
          createdById: 1,
        },
        assignedUserDetails: {
          name: 1,
          _id: 1,
          email: 1,
        },
        attendeesDetail: {
          name: 1,
          _id: 1,
          email: 1,
        },
      },
    },
    { $unwind: "$meetingDetails" },
    { $unwind: "$assignedUserDetails" },
    // {
    //   $match: {
    //     $expr: {
    //       $gt: [
    //         {
    //           $dateDiff: {
    //             // startDate: "$$NOW",
    //             // endDate: "$dueDate",
    //             startDate: "$$NOW",
    //             endDate: "$mainDueDate",
    //             unit: "day",
    //           },
    //         },
    //         0,
    //       ],
    //     },
    //   },
    // },
    {
      $sort: { _id: -1 },
    },
    {
      $group: {
        _id: "$minuteId",
        latestEntry: { $first: "$$ROOT" },
      },
    },
    {
      $replaceRoot: { newRoot: "$latestEntry" },
    },
  ];
  console.log("userData============================>>>>>>>>>>", userData);

  if (userData.isAdmin == false) {
    const meetingIds = await meetingService.getMeetingIdsOfCreatedById(userId);
    console.log("meetingIds============================>>>>>>>>>>", meetingIds);
    pipeLine.push({
      $match: {
        ...query,
        // isCancelled: false,
        isActive: true,
        $or: [
          { assignedUserId: new ObjectId(userId) },
          { createdById: new ObjectId(userId) },
          { meetingId: { $in: meetingIds } },
        ],
      },
    });
  }
  if (userData.isAdmin == true) {
    pipeLine.push({
      $match: {
        ...query,
        isActive: true,
      },
    });
  }

  if (bodyData.actionStatus && bodyData.actionStatus == "NOTDELAYED") {
    pipeLine.push({
      $match: {
        ...query,
        actionStatus: { $ne: "CANCELLED" },
        isDelayed: false,
        // $expr: {
        //   $gt: [
        //     {
        //       $dateDiff: {
        //         // startDate: "$$NOW",
        //         // endDate: "$dueDate",
        //         startDate: "$$NOW",
        //         endDate: "$mainDueDate",
        //         unit: "day",
        //       },
        //     },
        //     0,
        //   ],
        // },
      },
    });
  }

  if (bodyData.delayStatus == "NOTDELAYED") {
    pipeLine.push({
      $match: {
        ...query,
        actionStatus: { $ne: "CANCELLED" },
        isDelayed: false,
        // $expr: {
        //   $gt: [
        //     {
        //       $dateDiff: {
        //         // startDate: "$$NOW",
        //         // endDate: "$dueDate",
        //         startDate: "$$NOW",
        //         endDate: "$mainDueDate",
        //         unit: "day",
        //       },
        //     },
        //     0,
        //   ],
        // },
      },
    });
  }

  if (bodyData.delayStatus == "DELAYED") {
    pipeLine.push({
      $match: {
        ...query,
        actionStatus: { $ne: "CANCELLED" },
        isDelayed: true,
        // $expr: {
        //   $gt: [
        //     {
        //       $dateDiff: {
        //         // startDate: "$$NOW",
        //         // endDate: "$dueDate",
        //         startDate: "$$NOW",
        //         endDate: "$mainDueDate",
        //         unit: "day",
        //       },
        //     },
        //     0,
        //   ],
        // },
      },
    });
  }

  if (bodyData.actionStatus && bodyData.actionStatus == "DELAYED") {
    pipeLine.push({
      $match: {
        ...query,
        actionStatus: { $ne: "CANCELLED" },
        isDelayed: true,
        // $expr: {
        //   $gt: [
        //     {
        //       $dateDiff: {
        //         // startDate: "$$NOW",
        //         // endDate: "$dueDate",
        //         startDate: "$mainDueDate",
        //         endDate: "$$NOW",
        //         unit: "day",
        //       },
        //     },
        //     0,
        //   ],
        // },
      },
    });
  }
  console.log(pipeLine);

  console.log("query========================", query);
  let totalCount = await Minutes.aggregate(pipeLine);
  let actionDatas = await Minutes.aggregate(pipeLine)
    .sort({ updatedAt: parseInt(order) })
    .skip(skip)
    .limit(limit);

  console.log("actionDatas---------", actionDatas);
  // fffffffffff;
  actionDatas.map(async (action) => {
    let delayCount = action?.delayCountInDays;
    let dayCount = Math.abs(delayCount) > 1 ? "days" : "day";

    console.log("dayCount-------------", dayCount);
    console.log("delayCount-------------", delayCount);
    console.log(" action.isDelayed-------------", action.isDelayed);
    console.log(" action.isComplete-------------", action.isComplete);

    if (action?.isComplete == true) {
      // ggggggggggg;
      if (delayCount > 0 && action.isDelayed == false) {
        //  action["isDelayed"] = false;
        // action["delayCountInDays"] = delayCount;
        action["completionStatus"] =
          "Before " + Math.abs(delayCount) + " " + dayCount;
      }
      if (delayCount == 0 && action.isDelayed == false) {
        //  action["isDelayed"] = false;
        //  action["delayCountInDays"] = delayCount;
        action["completionStatus"] = "On time";
      }
      if (delayCount > 0 && action.isDelayed == true) {
        //  action["isDelayed"] = true;
        //  action["delayCountInDays"] = delayCount;
        action["completionStatus"] =
          "Delayed by " + Math.abs(delayCount) + " " + dayCount;
      }
      if (delayCount < 0 && action.isDelayed == true) {
        //  action["isDelayed"] = true;
        //  action["delayCountInDays"] = delayCount;
        action["completionStatus"] =
          "Delayed by " + Math.abs(delayCount) + " " + dayCount;
      }
    } else {
      console.log("dayCount-------------", dayCount);
      // const mainDueDate = action?.mainDueDate;

      // const currentDate = new Date();

      // const newCurrentDate =
      //   currentDate.getMonth() +
      //   1 +
      //   "/" +
      //   currentDate.getDate() +
      //   "/" +
      //   currentDate.getFullYear();

      // const newMainDueDate =
      //   mainDueDate.getMonth() +
      //   1 +
      //   "/" +
      //   mainDueDate.getDate() +
      //   "/" +
      //   mainDueDate.getFullYear();

      // const delayCount = commonHelper.getDaysDiiference(
      //   newMainDueDate,
      //   newCurrentDate
      // );

      // const dayCount = Math.abs(delayCount) > 1 ? "days" : "day";
      if (delayCount > 0 && action?.isDelayed == false) {
        // action["isDelayed"] = false;
        //  action["delayCountInDays"] = delayCount;
        action["completionStatus"] =
          "Remaining " + Math.abs(delayCount) + " " + dayCount;
      } else if (delayCount == 0) {
        //  action["isDelayed"] = false;
        //  action["delayCountInDays"] = delayCount;
        action["completionStatus"] = "Due today";
      } else {
        //action["isDelayed"] = true;
        // action["delayCountInDays"] = delayCount;
        action["completionStatus"] =
          "Delayed by " + Math.abs(delayCount) + " " + dayCount;
      }
    }
    action.dueDate = commonHelper.formatDateTimeFormat(
      action.dueDate
    ).formattedDate;

    action.mainDueDate = commonHelper.formatDateTimeFormat(
      action.mainDueDate
    ).formattedDate;
    return action;
  });

  // if (bodyData.actionStatus && bodyData.actionStatus == "NOTDELAYED") {
  //   actionDatas = actionDatas.filter((action) => !action.isDelayed);
  // }
  // if (bodyData.actionStatus && bodyData.actionStatus == "DELAYED") {
  //   actionDatas = actionDatas.filter((action) => action.isDelayed);
  // }
  // console.log("final--------------", actionDatas);
  return {
    totalCount: totalCount.length,
    actionDatas,
    type: bodyData.actionStatus,
  };
};

/**FUNC- TO RE-ASSIGN ACTIONS */
const reAssignAction = async (data, actionId, userId, userData, ipAddress) => {
  let reassignedUserId = [];

  if (Array.isArray(data.attendeeData)) {
    // If attendeeData is an array, process each attendee
    for (const attendee of data.attendeeData) {
      const empData = await employeeService.createAttendee(
        attendee.name,
        attendee.email,
        attendee.organizationId,
        attendee.designation,
        attendee.companyName
      );

      if (empData.isDuplicate) {
        reassignedUserId.push(empData.duplicateUserId);
      } else {
        reassignedUserId.push(empData._id);
      }
    }
  } else if (data.attendeeData) {
    // If attendeeData is a single object, process it as a single reassigned user
    const empData = await employeeService.createAttendee(
      data.attendeeData.name,
      data.attendeeData.email,
      data.attendeeData.organizationId,
      data.attendeeData.designation,
      data.attendeeData.companyName
    );

    reassignedUserId = empData.isDuplicate ? empData.duplicateUserId : empData._id;
  }

  // Ensure reassignedUserId is stored correctly in the update object
  const reassignDetails = {
    userId,
    reAssignReason: data.reAssignReason,
    newDueDate: data.dueDate,
    reAssignedUserId: Array.isArray(reassignedUserId)
      ? reassignedUserId.map((id) => new ObjectId(id))
      : new ObjectId(reassignedUserId),
    priority: data?.priority || "LOW",
  };

  const updateData = {
    $push: { reassignDetails },
    isRequested: false,
    isPending: true,
    actionStatus: "REASSIGNED",
    assignedUserId: Array.isArray(reassignedUserId)
      ? reassignedUserId.map((id) => new ObjectId(id))
      : new ObjectId(reassignedUserId),
  };

  const result = await Minutes.findOneAndUpdate(
    { _id: new ObjectId(actionId) },
    updateData,
    { isNew: false }
  );

  const minuteDetails = await Minutes.findOne({ _id: new ObjectId(actionId) });

  console.log("Assigned User IDs:", updateData.assignedUserId);

  let userIndex = 0;
  const newRequestDetails = minuteDetails.reassigneRequestDetails.map(
    (item, index) => {
      if (Array.isArray(result?.assignedUserId)) {
        if (result?.assignedUserId.includes(item.userId.toString())) {
          userIndex = index;
        }
      } else if (item.userId.toString() === result?.assignedUserId?.toString()) {
        userIndex = index;
      }

      if (index === minuteDetails.reassigneRequestDetails.length - 1) {
        minuteDetails.reassigneRequestDetails[userIndex].isAccepted = true;
        minuteDetails.reassigneRequestDetails[userIndex].actionDateTime = new Date();
        minuteDetails.reassigneRequestDetails[userIndex].reAssignReason = data.reAssignReason;
        return item;
      }
      return item;
    }
  );

  minuteDetails.reassigneRequestDetails = newRequestDetails;
  console.log("Updated Minute Details:", minuteDetails);

  const minuteData = new Minutes(minuteDetails);
  const newMinutes = await minuteData.save();

  // Assign the updated values to data
  data = {
    ...data,
    isActive: true,
    createdById: new ObjectId(userId),
    priority: data.priority || "LOW",
    dueDate: new Date(data.dueDate),
    mainDueDate: new Date(result.mainDueDate),
    assignedUserId: reassignedUserId.length ? reassignedUserId : new ObjectId(userId),
    actionId,
    agendaId: result.agendaId,
    meetingId: result.meetingId,
    organizationId: result.organizationId,
    parentMinuteId: actionId,
    minuteId: minuteDetails.minuteId,
    description: minuteDetails.description,
    title: minuteDetails.title,
    attendees: minuteDetails.attendees,
    isAction: true,
    status: result?.status,
    sequence: result?.sequence,
  };

  console.log("Final Data Before Saving:", data);

  const actionData = new Minutes(data);
  await actionData.save();

  if (data?.lastActionActivityId) {
    await ActionActivities.findByIdAndUpdate(
      { _id: new ObjectId(data.lastActionActivityId) },
      { isRead: true }
    );
  }

  const actionActivityObject = {
    activityDetails: data.reAssignReason,
    activityTitle: "ACTION FORWARDED",
    minuteId: actionId,
    reassignedUserId,
    userId,
    status: "REASSIGNED",
    actionId: minuteDetails.minuteId,
    isRead: true
  };

  await createActionActivity(actionActivityObject);

  const meetingDetails = await meetingService.viewMeeting(result?.meetingId, userId);
  console.log("Meeting Details:", meetingDetails);

  const assignedUserDetail = await Employee.find(
    { _id: { $in: reassignedUserId.map((id) => new ObjectId(id)) } },
    { _id: 1, email: 1, name: 1 }
  );

  console.log("Assigned Users:", assignedUserDetail);

  const oldAssignedUserDetail = await Employee.findOne(
    { _id: new ObjectId(result?.assignedUserId) },
    { _id: 1, email: 1, name: 1 }
  );

  console.log("Old Assigned User:", oldAssignedUserDetail);

  const allowedUsers = [
    new ObjectId(userId),
    result?.createdById,
    meetingDetails?.createdById,
    ...reassignedUserId.map((id) => new ObjectId(id)),
  ];

  console.log("Allowed Users:", allowedUsers);

  const notificationData = {
    title: "ACTION FORWARDED",
    organizationId: new ObjectId(result.organizationId),
    meetingId: result?.meetingId,
    details: {
      byDetails: `${result?.title}: is forwarded by `,
      toDetails: `${result?.title}: is forwarded to `,
    },
    allowedUsers,
    byUserId: userId,
    toUserId: reassignedUserId,
  };

  await notificationService.createNotification(notificationData);

  if (meetingDetails) {
    const logo = process.env.LOGO;

    const mailData = await emailTemplates.actionReassignEmailTemplate(
      meetingDetails,
      logo,
      assignedUserDetail,
      data.reAssignReason,
      userData,
      result
    );

    const { emailSubject, mailData: mailBody } = mailData;

    assignedUserDetail.forEach((user) => {
      emailService.sendEmail(user.email, "Action Forwarded", emailSubject, mailBody);
    });

    const mailOldData = await emailTemplates.actionReassignEmailToOlAssignedUserTemplate(
      meetingDetails,
      logo,
      assignedUserDetail,
      data.reAssignReason,
      result,
      userData,
      oldAssignedUserDetail
    );

    const { oldemailSubject, mailOldData: oldmailBody } = mailOldData;

    emailService.sendEmail(
      oldAssignedUserDetail?.email,
      "Action Forwarded",
      oldemailSubject,
      oldmailBody
    );

    const logData = {
      moduleName: logMessages.Action.moduleName,
      userId,
      action: logMessages.Action.reassignAction,
      ipAddress,
      details: `Action forwarded from <strong>${oldAssignedUserDetail?.name} (${oldAssignedUserDetail?.email})</strong> to <strong>${assignedUserDetail.map(u => `${u.name} (${u.email})`).join(', ')}</strong>`,
      subDetails: `Action: ${result?.title}<br/>Meeting Title: ${meetingDetails.title} (${meetingDetails.meetingId})`,
      organizationId: result?.organizationId,
    };
    await logService.createLog(logData);
  }

  return result;
};


/**FUNC- TO VIEW SINGLE ACTION DETAILS */
const viewSingleAction2 = async (id) => {
  const actionData = await Minutes.aggregate([
    {
      $match: {
        _id: new ObjectId(id),
        isActive: true,
        isAction: true,
      },
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
        from: "agendas",
        localField: "agendaId",
        foreignField: "_id",
        as: "agendaDetail",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "meetingDetail.attendees._id",
        foreignField: "_id",
        as: "attendeesDetail",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "assignedUserId",
        foreignField: "_id",
        as: "assignedUserDetail",
      },
    },
    {
      $project: {
        meetingId: 1,
        description: 1,
        isComplete: 1,
        isActive: 1,
        assignedUserId: 1,
        isReopened: 1,
        isApproved: 1,
        parentMinuteId: 1,
        dueDate: 1,
        priority: 1,
        isPending: 1,
        isRequested: 1,
        isCancelled: 1,
        reassigneRequestDetails: 1,
        isAction: 1,
        actionStatus: 1,
        mainDueDate: 1,
        isCompleteDetails: 1,
        agendaDetail: {
          title: 1,
          _id: 1,
        },
        attendeesDetail: {
          name: 1,
          _id: 1,
          email: 1,
        },
        meetingDetail: {
          title: 1,
          date: 1,
          _id: 1,
        },
        assignedUserDetail: {
          name: 1,
          _id: 1,
          email: 1,
        },
      },
    },
    { $unwind: "$agendaDetail" },
    { $unwind: "$meetingDetail" },
    { $unwind: "$assignedUserDetail" },
  ]);
  actionData.map((action) => {
    if (action?.isComplete == true) {
      const mainDueDate = action?.mainDueDate;
      "mainDueDate1", mainDueDate, action._id;
      const completedDate =
        action?.isCompleteDetails[action?.isCompleteDetails?.length - 1]
          ?.dateTime;
      "completedDate", completedDate;
      const newCompletedDate =
        completedDate.getMonth() +
        1 +
        "/" +
        completedDate.getDate() +
        "/" +
        completedDate.getFullYear();
      "newCompletedDate", newCompletedDate;
      const newMainDueDate =
        mainDueDate.getMonth() +
        1 +
        "/" +
        mainDueDate.getDate() +
        "/" +
        mainDueDate.getFullYear();
      "newMainDueDate", newMainDueDate;
      const delayCount = commonHelper.getDaysDiiference(
        newMainDueDate,
        newCompletedDate
      );
      const dayCount = Math.abs(delayCount) > 1 ? "days" : "day";
      if (delayCount < 0) {
        action["isDelayed"] = false;
        action["delayCountInDays"] = delayCount;
        action["completionStatus"] =
          "Before " + Math.abs(delayCount) + " " + dayCount;
      } else if (delayCount == 0) {
        action["isDelayed"] = false;
        action["delayCountInDays"] = delayCount;
        action["completionStatus"] = "On time";
      } else {
        action["isDelayed"] = true;
        action["delayCountInDays"] = delayCount;
        action["completionStatus"] =
          "Delayed by " + Math.abs(delayCount) + " " + dayCount;
      }
    } else {
      const mainDueDate = action?.mainDueDate;
      "mainDueDate1", mainDueDate, action._id;
      const currentDate = new Date();
      "currentDate", currentDate;
      const newCurrentDate =
        currentDate.getMonth() +
        1 +
        "/" +
        currentDate.getDate() +
        "/" +
        currentDate.getFullYear();
      "newCurrentDate", newCurrentDate;
      const newMainDueDate =
        mainDueDate.getMonth() +
        1 +
        "/" +
        mainDueDate.getDate() +
        "/" +
        mainDueDate.getFullYear();
      "newMainDueDate", newMainDueDate;
      const delayCount = commonHelper.getDaysDiiference(
        newMainDueDate,
        newCurrentDate
      );
      const dayCount = Math.abs(delayCount) > 1 ? "days" : "day";
      if (delayCount < 0) {
        action["isDelayed"] = false;
        action["delayCountInDays"] = delayCount;
        action["completionStatus"] =
          "Remaining " + Math.abs(delayCount) + " " + dayCount;
      } else if (delayCount == 0) {
        action["isDelayed"] = false;
        action["delayCountInDays"] = delayCount;
        action["completionStatus"] = "Due today";
      } else {
        action["isDelayed"] = true;
        action["delayCountInDays"] = delayCount;
        action["completionStatus"] =
          "Delayed by " + Math.abs(delayCount) + " " + dayCount;
      }
    }
    action.meetingDetail.date = commonHelper.formatDateTimeFormat(
      action.meetingDetail.date
    ).formattedDate;
    action.dueDate = commonHelper.formatDateTimeFormat(
      action.dueDate
    ).formattedDate;
    action.mainDueDate = commonHelper.formatDateTimeFormat(
      action.mainDueDate
    ).formattedDate;

    return actionData;
  });
  return actionData;
};

const viewSingleAction = async (id) => {
  const actionData = await Minutes.aggregate([
    {
      $match: {
        _id: new ObjectId(id),
        isActive: true,
        isAction: true,
      },
    },
    {
      $addFields: {
        completedDate: {
          $cond: {
            if: {
              $and: [
                { $gt: [{ $arrayElemAt: ["$isCompleteDetails", -1] }, null] },
                { $eq: ["$isReopened", false] },
              ],
            },
            then: { $arrayElemAt: ["$isCompleteDetails.dateTime", -1] }, // Use last element of the array
            //  then: { $arrayElemAt: ["$isCompleteDetails.dateTime", -1] }, // Use last element of the array
            else: "$$NOW", // Set to null or a default value
          },
        },
      },
    },
    {
      $addFields: {
        completedDate: {
          $dateTrunc: {
            date: "$completedDate",
            unit: "day",
          },
        },
      },
    },
    {
      $addFields: {
        delayCountInDays: {
          $dateDiff: {
            startDate: "$completedDate",
            endDate: "$mainDueDate",
            unit: "day",
          },
        },
        isDelayed: {
          $gt: [
            {
              $dateDiff: {
                startDate: "$mainDueDate",
                endDate: "$completedDate",
                unit: "day",
              },
            },
            0,
          ],
        },
      },
    },
    // {
    //   $addFields: {
    //     delayCountInDays: {
    //       $dateDiff: {
    //         startDate: "$$NOW",
    //         endDate: "$mainDueDate",
    //         unit: "day",
    //       },
    //     },
    //     isDelayed: {
    //       $gt: [
    //         {
    //           $dateDiff: {
    //             startDate: "$mainDueDate",
    //             endDate: "$$NOW",
    //             unit: "day",
    //           },
    //         },
    //         0,
    //       ],
    //     },
    //   },
    // },
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
        from: "agendas",
        localField: "agendaId",
        foreignField: "_id",
        as: "agendaDetail",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "meetingDetail.attendees._id",
        foreignField: "_id",
        as: "attendeesDetail",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "assignedUserId",
        foreignField: "_id",
        as: "assignedUserDetail",
      },
    },
    {
      $project: {
        isDelayed: 1,
        completedDate: 1,
        delayCountInDays: 1,
        meetingId: 1,
        title: 1,
        description: 1,
        isComplete: 1,
        isActive: 1,
        assignedUserId: 1,
        isReopened: 1,
        isApproved: 1,
        parentMinuteId: 1,
        dueDate: 1,
        priority: 1,
        isPending: 1,
        isRequested: 1,
        isCancelled: 1,
        reassigneRequestDetails: 1,
        isAction: 1,
        actionStatus: 1,
        mainDueDate: 1,
        isCompleteDetails: 1,
        agendaDetail: {
          title: 1,
          _id: 1,
        },
        attendeesDetail: {
          name: 1,
          _id: 1,
          email: 1,
        },
        meetingDetail: {
          title: 1,
          date: 1,
          _id: 1,
          createdById: 1,
        },
        assignedUserDetail: {
          name: 1,
          _id: 1,
          email: 1,
        },
      },
    },
    { $unwind: "$agendaDetail" },
    { $unwind: "$meetingDetail" },
    { $unwind: "$assignedUserDetail" },
  ]);

  actionData.map(async (action) => {
    let delayCount = action?.delayCountInDays;
    let dayCount = Math.abs(delayCount) > 1 ? "days" : "day";

    console.log("dayCount-------------", dayCount);
    // if (action?.isComplete == true) {
    //   console.log("dayCount-------------", dayCount);
    //   // const mainDueDate = action?.mainDueDate;

    //   // const completedDate =
    //   //   action?.isCompleteDetails[action?.isCompleteDetails?.length - 1]
    //   //     ?.dateTime;

    //   // const newCompletedDate =
    //   //   completedDate.getMonth() +
    //   //   1 +
    //   //   "/" +
    //   //   completedDate.getDate() +
    //   //   "/" +
    //   //   completedDate.getFullYear();

    //   // const newMainDueDate =
    //   //   mainDueDate.getMonth() +
    //   //   1 +
    //   //   "/" +
    //   //   mainDueDate.getDate() +
    //   //   "/" +
    //   //   mainDueDate.getFullYear();

    //   // const delayCount = commonHelper.getDaysDiiference(
    //   //   newMainDueDate,
    //   //   newCompletedDate
    //   // );

    //   if (delayCount < 0 && action.isDelayed == false) {
    //     //  action["isDelayed"] = false;
    //     // action["delayCountInDays"] = delayCount;
    //     action["completionStatus"] =
    //       "Before " + Math.abs(delayCount) + " " + dayCount;
    //   } else if (delayCount == 0) {
    //     //  action["isDelayed"] = false;
    //     //  action["delayCountInDays"] = delayCount;
    //     action["completionStatus"] = "On time";
    //   } else {
    //     //  action["isDelayed"] = true;
    //     //  action["delayCountInDays"] = delayCount;
    //     action["completionStatus"] =
    //       "Delayed by " + Math.abs(delayCount) + " " + dayCount;
    //   }
    // } else {
    //   console.log("dayCount-------------", dayCount);
    //   // const mainDueDate = action?.mainDueDate;

    //   // const currentDate = new Date();

    //   // const newCurrentDate =
    //   //   currentDate.getMonth() +
    //   //   1 +
    //   //   "/" +
    //   //   currentDate.getDate() +
    //   //   "/" +
    //   //   currentDate.getFullYear();

    //   // const newMainDueDate =
    //   //   mainDueDate.getMonth() +
    //   //   1 +
    //   //   "/" +
    //   //   mainDueDate.getDate() +
    //   //   "/" +
    //   //   mainDueDate.getFullYear();

    //   // const delayCount = commonHelper.getDaysDiiference(
    //   //   newMainDueDate,
    //   //   newCurrentDate
    //   // );

    //   // const dayCount = Math.abs(delayCount) > 1 ? "days" : "day";
    //   if (delayCount < 0 && action?.isDelayed == false) {
    //     // action["isDelayed"] = false;
    //     //  action["delayCountInDays"] = delayCount;
    //     action["completionStatus"] =
    //       "Remaining " + Math.abs(delayCount) + " " + dayCount;
    //   } else if (delayCount == 0) {
    //     //  action["isDelayed"] = false;
    //     //  action["delayCountInDays"] = delayCount;
    //     action["completionStatus"] = "Due today";
    //   } else {
    //     //action["isDelayed"] = true;
    //     // action["delayCountInDays"] = delayCount;
    //     action["completionStatus"] =
    //       "Delayed by " + Math.abs(delayCount) + " " + dayCount;
    //   }
    // }

    console.log("dayCount-------------", dayCount);
    console.log("delayCount-------------", delayCount);
    console.log(" action.isDelayed-------------", action.isDelayed);
    console.log(" action.isComplete-------------", action.isComplete);

    if (action?.isComplete == true) {
      // ggggggggggg;
      if (delayCount > 0 && action.isDelayed == false) {
        //  action["isDelayed"] = false;
        // action["delayCountInDays"] = delayCount;
        action["completionStatus"] =
          "Before " + Math.abs(delayCount) + " " + dayCount;
      }
      if (delayCount == 0 && action.isDelayed == false) {
        //  action["isDelayed"] = false;
        //  action["delayCountInDays"] = delayCount;
        action["completionStatus"] = "On time";
      }
      if (delayCount > 0 && action.isDelayed == true) {
        //  action["isDelayed"] = true;
        //  action["delayCountInDays"] = delayCount;
        action["completionStatus"] =
          "Delayed by " + Math.abs(delayCount) + " " + dayCount;
      }
      if (delayCount < 0 && action.isDelayed == true) {
        //  action["isDelayed"] = true;
        //  action["delayCountInDays"] = delayCount;
        action["completionStatus"] =
          "Delayed by " + Math.abs(delayCount) + " " + dayCount;
      }
    } else {
      console.log("dayCount-------------", dayCount);
      // const mainDueDate = action?.mainDueDate;

      // const currentDate = new Date();

      // const newCurrentDate =
      //   currentDate.getMonth() +
      //   1 +
      //   "/" +
      //   currentDate.getDate() +
      //   "/" +
      //   currentDate.getFullYear();

      // const newMainDueDate =
      //   mainDueDate.getMonth() +
      //   1 +
      //   "/" +
      //   mainDueDate.getDate() +
      //   "/" +
      //   mainDueDate.getFullYear();

      // const delayCount = commonHelper.getDaysDiiference(
      //   newMainDueDate,
      //   newCurrentDate
      // );

      // const dayCount = Math.abs(delayCount) > 1 ? "days" : "day";
      if (delayCount > 0 && action?.isDelayed == false) {
        // action["isDelayed"] = false;
        //  action["delayCountInDays"] = delayCount;
        action["completionStatus"] =
          "Remaining " + Math.abs(delayCount) + " " + dayCount;
      } else if (delayCount == 0) {
        //  action["isDelayed"] = false;
        //  action["delayCountInDays"] = delayCount;
        action["completionStatus"] = "Due today";
      } else {
        //action["isDelayed"] = true;
        // action["delayCountInDays"] = delayCount;
        action["completionStatus"] =
          "Delayed by " + Math.abs(delayCount) + " " + dayCount;
      }
    }
    action.dueDate = commonHelper.formatDateTimeFormat(
      action.dueDate
    ).formattedDate;

    action.mainDueDate = commonHelper.formatDateTimeFormat(
      action.mainDueDate
    ).formattedDate;
    return action;
  });

  return actionData;
};

//   actionData.map((action) => {
//     if (action?.isComplete == true) {
//       const mainDueDate = action?.mainDueDate;
//       "mainDueDate1", mainDueDate, action._id;
//       const completedDate =
//         action?.isCompleteDetails[action?.isCompleteDetails?.length - 1]
//           ?.dateTime;
//       "completedDate", completedDate;
//       const newCompletedDate =
//         completedDate.getMonth() +
//         1 +
//         "/" +
//         completedDate.getDate() +
//         "/" +
//         completedDate.getFullYear();
//       "newCompletedDate", newCompletedDate;
//       const newMainDueDate =
//         mainDueDate.getMonth() +
//         1 +
//         "/" +
//         mainDueDate.getDate() +
//         "/" +
//         mainDueDate.getFullYear();
//       "newMainDueDate", newMainDueDate;
//       const delayCount = commonHelper.getDaysDiiference(
//         newMainDueDate,
//         newCompletedDate
//       );
//       const dayCount = Math.abs(delayCount) > 1 ? "days" : "day";
//       if (delayCount < 0) {
//         action["isDelayed"] = false;
//         action["delayCountInDays"] = delayCount;
//         action["completionStatus"] =
//           "Before " + Math.abs(delayCount) + " " + dayCount;
//       } else if (delayCount == 0) {
//         action["isDelayed"] = false;
//         action["delayCountInDays"] = delayCount;
//         action["completionStatus"] = "On time";
//       } else {
//         action["isDelayed"] = true;
//         action["delayCountInDays"] = delayCount;
//         action["completionStatus"] =
//           "Delayed by " + Math.abs(delayCount) + " " + dayCount;
//       }
//     } else {
//       const mainDueDate = action?.mainDueDate;
//       "mainDueDate1", mainDueDate, action._id;
//       const currentDate = new Date();
//       "currentDate", currentDate;
//       const newCurrentDate =
//         currentDate.getMonth() +
//         1 +
//         "/" +
//         currentDate.getDate() +
//         "/" +
//         currentDate.getFullYear();
//       "newCurrentDate", newCurrentDate;
//       const newMainDueDate =
//         mainDueDate.getMonth() +
//         1 +
//         "/" +
//         mainDueDate.getDate() +
//         "/" +
//         mainDueDate.getFullYear();
//       "newMainDueDate", newMainDueDate;
//       const delayCount = commonHelper.getDaysDiiference(
//         newMainDueDate,
//         newCurrentDate
//       );
//       const dayCount = Math.abs(delayCount) > 1 ? "days" : "day";
//       if (delayCount < 0) {
//         action["isDelayed"] = false;
//         action["delayCountInDays"] = delayCount;
//         action["completionStatus"] =
//           "Remaining " + Math.abs(delayCount) + " " + dayCount;
//       } else if (delayCount == 0) {
//         action["isDelayed"] = false;
//         action["delayCountInDays"] = delayCount;
//         action["completionStatus"] = "Due today";
//       } else {
//         action["isDelayed"] = true;
//         action["delayCountInDays"] = delayCount;
//         action["completionStatus"] =
//           "Delayed by " + Math.abs(delayCount) + " " + dayCount;
//       }
//     }
//     action.meetingDetail.date = commonHelper.formatDateTimeFormat(
//       action.meetingDetail.date
//     ).formattedDate;
//     action.dueDate = commonHelper.formatDateTimeFormat(
//       action.dueDate
//     ).formattedDate;
//     action.mainDueDate = commonHelper.formatDateTimeFormat(
//       action.mainDueDate
//     ).formattedDate;

//     return actionData;
//   });
//   return actionData;
// };

/**FUNC- UPDATE ACTION */
const updateAction = async (id, data, userId, userData, ipAddress) => {
  const isCompleteDetails = {
    updatedById: userId,
    comment: data.comment,
    isComplete: data.isComplete,
    dateTime: commonHelper.convertIsoFormat(new Date()),
  };
  const result = await Minutes.findByIdAndUpdate(
    {
      _id: new ObjectId(id),
    },
    {
      $push: { isCompleteDetails },
      isComplete: data.isComplete,
      isRequested: false,
      isPending: false,
      actionStatus: "COMPLETED",
    }
  );
  if (result) {
    const actionActivityObject = {
      activityDetails: data.comment,
      activityTitle: "ACTION COMPLETED",
      minuteId: id,
      userId,
      status: "COMPLETED",
      actionId: result?.minuteId,
    };
    const actionActivitiesResult = await createActionActivity(
      actionActivityObject
    );
    const meetingDetails = await meetingService.viewMeeting(
      result?.meetingId,
      userId
    );
    const assignedUserDetail = await Employee.findOne(
      { _id: new ObjectId(userId) },
      { _id: 1, email: 1, name: 1 }
    );
    const allowedUsers = [
      new ObjectId(userId),
      result?.createdById,
      meetingDetails?.createdById,
    ];
    const notificationData = {
      title: "ACTION COMPLETED",
      organizationId: new ObjectId(result.organizationId),
      meetingId: result?.meetingId,
      byUserId: userId,
      details: {
        byDetails: `${result?.title}: is completed by `,
        toDetails: null,
      },
      allowedUsers,
    };

    if (meetingDetails) {
      const logo = process.env.LOGO;


      const mailData = await emailTemplates.actionCompleteEmailTemplate(
        meetingDetails,
        logo,
        assignedUserDetail,
        data.comment,
        userData,
        result
      );
      const { emailSubject, mailData: mailBody } = mailData;
      // const emailSubject = await emailConstants.actionCompleteSubject(result);
      // emailSubject;
      emailService.sendEmail(
        meetingDetails?.createdByDetail?.email,
        "Action Completed",
        emailSubject,
        mailBody
      );
      ////////////////////LOGER START
      const logData = {
        moduleName: logMessages.Action.moduleName,
        userId,
        action: logMessages.Action.completeAction,
        ipAddress,
        details:
          "Action completed by <strong>" +
          commonHelper.convertFirstLetterOfFullNameToCapital(
            assignedUserDetail?.name
          ) +
          " (" +
          assignedUserDetail?.email +
          ") </strong>",
        subDetails: `
      Action : ${result?.title}</br>
      Meeting Title: ${meetingDetails.title} (${meetingDetails.meetingId})`,
        organizationId: result?.organizationId,
      };
      "logData-------------------", logData;
      await logService.createLog(logData);
      /////////////////// LOGER END
    }
    const addNotification = await notificationService.createNotification(
      notificationData
    );
  }
  return result;
};
/**FUNC- ACTION ACTIVITY CREATE FUNCTION*/
const createActionActivity = async (data) => {
  const inputData = {
    activityTitle: data.activityTitle,
    activityDetails: data.activityDetails,
    minuteId: data.minuteId,
    userId: data.userId,
    actionId: data.actionId,
    isRead: data.isRead
  };
  if (data.status) {
    inputData["status"] = data.status;
  }
  if (data.reassignedUserId) {
    inputData["reassignedUserId"] = data.reassignedUserId;
  }
  const actionActivitiesData = new ActionActivities(inputData);
  const newMinutesActivities = await actionActivitiesData.save();
  return newMinutesActivities;
};
//FUNCTION TO FETCH ACTION ACTIVITIES LIST
const viewActionActivity = async (id) => {
  "checkid", id;
  const minuteResult = await Minutes.findOne(
    { _id: new ObjectId(id) },
    { minuteId: 1, _id: 1 }
  );
  "minuteResult", minuteResult;
  const result = await ActionActivities.aggregate([
    {
      $match: {
        actionId: new ObjectId(minuteResult?.minuteId),
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "userId",
        foreignField: "_id",
        as: "employeeDetails",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "reassignedUserId",
        foreignField: "_id",
        as: "reAssignedUserDetails",
      },
    },
    {
      $project: {
        _id: 1,
        activityTitle: 1,
        minuteId: 1,
        userId: 1,
        activityDetails: 1,
        createdAt: 1,
        updatedAt: 1,
        actionId: 1,
        isActive: 1,
        isRead: 1,
        employeeDetails: {
          _id: 1,
          name: 1,
          email: 1,
        },
        reAssignedUserDetails: {
          _id: 1,
          name: 1,
          email: 1,
        },
      },
    },
    { $unwind: "$employeeDetails" },
  ]).sort({ _id: -1 });
  "res1", result;
  ("check");
  const modifiedResult = result.map((item) => {
    item["date"] = `${commonHelper.formatDateTimeFormat(item.createdAt).formattedDate
      },${commonHelper.formatDateTimeFormat(item.createdAt).formattedTime}`;
    return item;
  });
  return modifiedResult;
};
/**FUNC- TO APPROVE ACTIONS */
const approveAction = async (actionId, data, userId, ipAddress, userData) => {
  actionId;
  const updateData = {
    isApproved: true,
    isReopened: false,
    actionStatus: "APPROVED",
    isApprovedDetails: {
      remark: data.remark ? data.remark : "NA",
      approvedById: userId,
      dateTime: new Date(),
    },
  };
  const result = await Minutes.findOneAndUpdate(
    {
      _id: new ObjectId(actionId),
      isActive: true,
    },
    updateData
  );
  if (result) {
    const actionActivityObject = {
      activityTitle: "ACTION APPROVED",
      minuteId: actionId,
      reassignedUserId: result.reassignedUserId,
      userId,
      activityDetails: data.remark,
      status: "APPROVED",
      actionId: result?.minuteId,
    };
    const actionActivitiesResult = await createActionActivity(
      actionActivityObject
    );
    const meetingDetails = await meetingService.viewMeeting(
      result?.meetingId,
      userId
    );
    const notificationData = {
      title: "ACTION APPROVED",
      organizationId: new ObjectId(result.organizationId),
      meetingId: result?.meetingId,
      details: {
        byDetails: `${result?.title}: is approved by `,
        toDetails: null,
      },
      byUserId: new ObjectId(userId),
    };
    const addNotification = await notificationService.createNotification(
      notificationData
    );
    if (meetingDetails) {
      const logo = process.env.LOGO;
      const mailData = await emailTemplates.actionApproveEmailTemplate(
        meetingDetails,
        logo,
        data.assignedUserDetails,
        data.remark,
        result
      );
      // const emailSubject = await emailConstants.actionApproveSubject(result);
      const { emailSubject, mailData: mailBody } = mailData;
      "actionApproveEmailTemplate-----------------------maildata", mailData;
      "actionApproveEmailTemplate-----------------------emailSubject",
        emailSubject;
      emailService.sendEmail(
        data?.assignedUserDetails?.email,
        "Action Approved",
        emailSubject,
        mailBody,
        // mailData
      );
      ////////////////////LOGER START
      const logData = {
        moduleName: logMessages.Action.moduleName,
        userId,
        action: logMessages.Action.approveAction,
        ipAddress,
        details:
          "Action is approved by <strong>" +
          commonHelper.convertFirstLetterOfFullNameToCapital(userData?.name) +
          " (" +
          userData?.email +
          ") </strong>",
        subDetails: `
    Action : ${result?.title}</br>
    Meeting Title: ${meetingDetails.title} (${meetingDetails.meetingId})`,
        organizationId: result?.organizationId,
      };
      await logService.createLog(logData);
      /////////////////// LOGER END
    }
  }

  return result;
};
/**FUNC- TO REOPEN ACTIONS */
const reOpenAction = async (actionId, data, userId, ipAddress, userData) => {
  actionId;
  "userId------------", userId;
  const reopenDetails = {
    remark: data.remark,
    reOpenedById: userId,
  };
  const result = await Minutes.findOneAndUpdate(
    {
      _id: new ObjectId(actionId),
      isActive: true,
    },
    {
      isComplete: false,
      isReopened: true,
      isPending: true,
      isApproved: false,
      $push: { reopenDetails },
      actionStatus: "REOPENED",
    }
  );
  const actionActivityObject = {
    activityDetails: data.remark,
    activityTitle: "ACTION REOPENED",
    minuteId: actionId,
    userId,
    status: "REOPENED",
    actionId: result?.minuteId,
  };
  const actionActivitiesResult = await createActionActivity(
    actionActivityObject
  );
  const meetingDetails = await meetingService.viewMeeting(
    result?.meetingId,
    userId
  );
  const notificationData = {
    title: "ACTION REOPENED",
    organizationId: new ObjectId(result.organizationId),
    meetingId: result?.meetingId,
    byUserId: new ObjectId(userId),
    details: {
      byDetails: `${result?.title}: is reopened by `,
      toDetails: null,
    },
  };
  const addNotification = await notificationService.createNotification(
    notificationData
  );

  if (meetingDetails) {
    const logo = process.env.LOGO;
    const mailData = await emailTemplates.actionReOpenEmailTemplate(
      meetingDetails,
      logo,
      data.assignedUserDetails,
      data.remark,
      result
    );
    // const emailSubject = await emailConstants.reOpenSubject(result);
    const { emailSubject, mailData: mailBody } = mailData;
    emailSubject;
    emailService.sendEmail(
      data?.assignedUserDetails?.email,
      "Action Reopened",
      emailSubject,
      mailBody
    );
    ////////////////////LOGER START
    const logData = {
      moduleName: logMessages.Action.moduleName,
      userId,
      action: logMessages.Action.reopenAction,
      ipAddress,
      details:
        "Action is reopened by <strong>" +
        commonHelper.convertFirstLetterOfFullNameToCapital(userData?.name) +
        " (" +
        userData?.email +
        ") </strong>",
      subDetails: `
      Action : ${result?.title}</br>
      Meeting Title: ${meetingDetails.title} (${meetingDetails.meetingId})`,
      organizationId: result?.organizationId,
    };
    "logData-------------------", logData;
    await logService.createLog(logData);
    /////////////////// LOGER END
  }
  return result;
};
/**FUNC- TO REJECT REASSIGN REQUEST ACTIONS */
const rejectReasignRequest = async (
  actionId,
  data,
  userId,
  ipAddress,
  userData
) => {
  actionId;
  const minuteDetails = await Minutes.findOne({
    _id: new ObjectId(actionId),
    isActive: true,
  });
  console.log("minuteDetails====================", minuteDetails);
  let userIndex = 0;
  const newRequestDetails = minuteDetails.reassigneRequestDetails.map(
    (item, index) => {
      if (
        item.userId.toString() === minuteDetails?.assignedUserId?.toString() &&
        item.isRejected == false
      ) {
        userIndex = index;
      }
      if (index === minuteDetails.reassigneRequestDetails.length - 1) {
        minuteDetails.reassigneRequestDetails[userIndex].isRejected = true;
        minuteDetails.reassigneRequestDetails[userIndex].actionDateTime =
          new Date();
        minuteDetails.reassigneRequestDetails[userIndex].rejectDetails =
          data.rejectDetails;
        return item;
      }
      return item;
    }
  );

  newRequestDetails;
  minuteDetails.reassigneRequestDetails = newRequestDetails;
  minuteDetails.isPending = true;
  minuteDetails.isRequested = false;
  minuteDetails.actionStatus = "PENDING";
  minuteDetails.title = minuteDetails.title;
  const minuteData = new Minutes(minuteDetails);
  const result = await minuteData.save();
  if (result) {
    const assignedUserDetail = await Employee.findOne(
      { _id: new ObjectId(data.assignedUserId) },
      { _id: 1, email: 1, name: 1 }
    );
    "assignedUserDetail-------------", assignedUserDetail;

    const updateLatActivity = await ActionActivities.findByIdAndUpdate(
      {
        _id: new ObjectId(data.lastActionActivityId),
      },
      { isRead: true }
    );
    const actionActivityObject = {
      activityDetails: data.rejectDetails,
      activityTitle: "ACTION FORWARD REQUEST REJECTED",
      minuteId: actionId,
      userId,
      actionId: result?.minuteId,
      isRead: true,
    };
    "activityObject-->", actionActivityObject;
    const actionActivitiesResult = await createActionActivity(
      actionActivityObject
    );
    "actionActivitiesResult------------", actionActivitiesResult;
    const meetingDetails = await meetingService.viewMeeting(
      result?.meetingId,
      userId
    );
    const allowedUsers = [
      new ObjectId(userId),
      new ObjectId(data.assignedUserId),
      result?.createdById,
      meetingDetails?.createdById,
    ];
    const notificationData = {
      title: "ACTION FORWARD REQUEST REJECTED",
      isRead: true,
      organizationId: new ObjectId(result.organizationId),
      meetingId: result?.meetingId,
      byUserId: new ObjectId(userId),
      details: {
        byDetails: `${result?.title}'s forward request is rejected by `,
        toDetails: null,
      },
      allowedUsers,
    };
    const addNotification = await notificationService.createNotification(
      notificationData
    );

    if (meetingDetails) {
      const logo = process.env.LOGO;
      const mailData =
        await emailTemplates.actionReassignRequestRejectEmailTemplate(
          meetingDetails,
          logo,
          assignedUserDetail,
          data.rejectDetails,
          result
        );

      // const emailSubject = await emailConstants.rejectReassignRequestSubject(
      //   result
      // );
      const { emailSubject, mailData: mailBody } = mailData;
      "actionReassignRequestRejectEmailTemplate-----------------------maildata",
        mailData;
      "actionReassignRequestRejectEmailTemplate-----------------------emailSubject",
        emailSubject;
      emailService.sendEmail(
        assignedUserDetail?.email,
        "Action Reassign Request Rejected",
        emailSubject,
        mailBody,
        // mailData
      );
      ////////////////////LOGER START
      const logData = {
        moduleName: logMessages.Action.moduleName,
        userId,

        action: logMessages.Action.actionReassignRequestRejected,
        ipAddress,
        details:
          "Action forward request rejected by <strong>" +
          commonHelper.convertFirstLetterOfFullNameToCapital(userData?.name) +
          " (" +
          userData?.email +
          ") </strong>",
        subDetails: `
      Action : ${result?.title}</br>
      Meeting Title: ${meetingDetails.title} (${meetingDetails.meetingId})`,
        organizationId: result?.organizationId,
      };
      "logData-------------------", logData;
      await logService.createLog(logData);

      /////////////////// LOGER END
    }
  }
  return result;
};

/**FUNC- TO CANCEL ACTIONS */
const cancelAction = async (actionId, userId, data, ipAddress, userData) => {
  actionId;
  "userId------------", userId;
  const cancelDetails = {
    cancelById: userId,
    dateTime: new Date(),
  };
  const result = await Minutes.findOneAndUpdate(
    {
      _id: new ObjectId(actionId),
      isActive: true,
    },

    {
      // isComplete: false,
      // isReopened: false,
      // isApproved: false,
      isCancelled: true,
      isCancelDetails: cancelDetails,
      actionStatus: "CANCELLED",
    }
  );
  "result----&&&>>>", result;

  const actionActivityObject = {
    activityDetails: "Action cancelled",
    activityTitle: "ACTION CANCELLED",
    minuteId: actionId,
    userId,
    status: "CANCELLED",
    actionId: result?.minuteId,
  };
  "activityObject-->", actionActivityObject;
  const actionActivitiesResult = await createActionActivity(
    actionActivityObject
  );
  "actionActivitiesResult------------", actionActivitiesResult;

  const meetingDetails = await meetingService.viewMeeting(
    result?.meetingId,
    userId
  );
  const allowedUsers = [
    new ObjectId(userId),
    result?.createdById,
    meetingDetails?.createdById,
  ];
  const notificationData = {
    title: "ACTION CANCELLED",
    organizationId: new ObjectId(result.organizationId),
    meetingId: result?.meetingId,
    byUserId: new ObjectId(userId),
    details: {
      byDetails: `${result?.title}: is cancelled by `,
      toDetails: null,
    },
    allowedUsers,
    // actionId,
  };

  "result----&&&>>>", result;

  const addNotification = await notificationService.createNotification(
    notificationData
  );

  if (meetingDetails) {
    //  ("attendeesEmails-------------------------", attendeesEmails);
    const logo = process.env.LOGO;
    const mailData = await emailTemplates.actionCancelEmailTemplate(
      meetingDetails,
      logo,
      data.assignedUserDetails,
      result
      // data.remark,
      // result
    );
    //const mailData = await emailTemplates.signInByOtpEmail(userData, data.otp);
    const { emailSubject, mailData: mailBody } = mailData;
    "actionCancelEmailTemplate-----------------------maildata", mailData;
    "actionCancelEmailTemplate-----------------------emailSubject", emailSubject;

    emailService.sendEmail(
      // meetingDetails?.createdByDetail?.email,
      data?.assignedUserDetails?.email,
      "Action Cancelled",
      emailSubject,
      mailBody
    );

    ////////////////////LOGER START

    const logData = {
      moduleName: logMessages.Action.moduleName,
      userId,
      action: logMessages.Action.cancelAction,
      ipAddress,
      details:
        "Action is cancelled by <strong>" +
        commonHelper.convertFirstLetterOfFullNameToCapital(userData?.name) +
        " (" +
        userData?.email +
        ") </strong>",
      subDetails: `
    Action : ${result?.title}</br>
    Meeting Title: ${meetingDetails.title} (${meetingDetails.meetingId})`,
      organizationId: result?.organizationId,
    };
    "logData-------------------", logData;
    await logService.createLog(logData);

    ///////////////// LOGER END
  }

  return result;
};
/**FUNC- TO VIEW ALL USER ACTIONS */
const totalActionList = async (organizationId, userId, userData) => {
  let query = null;
  if (userData.isAdmin) {
    query = {
      organizationId: new ObjectId(organizationId),
      isActive: true,
      isAction: true,
    };
  } else {
    const meetingIds = await meetingService.getMeetingIdsOfCreatedById(userId);
    console.log("meetingIds============================>>>>>>>>>>", meetingIds);
    query = {
      organizationId: new ObjectId(organizationId),
      isActive: true,
      isAction: true,
      $or: [
        { assignedUserId: new ObjectId(userId) },
        { createdById: new ObjectId(userId) },
        { meetingId: { $in: meetingIds } },
      ],
      // assignedUserId: userId,
    };
    // query["meetingId"] = { $in: meetingIds };
  }
  console.log("query=============", query);

  let pipeLine = [
    {
      $match: query,
    },
    {
      $project: {
        _id: 1,
        description: 1,
        meetingId: 1,
        isComplete: 1,
        dueDate: 1,
        priority: 1,
        isActive: 1,
        updatedAt: 1,
        isReopened: 1,
        isRequested: 1,
        isPending: 1,
        minuteId: 1,
        isApproved: 1,
        assignedUserId: 1,
        organizationId: 1,
        isAction: 1,
        reassignDetails: 1,
        reassigneRequestDetails: 1,
        isCompleteDetails: 1,
        actionStatus: 1,
        mainDueDate: 1,
        isCancelled: 1,
      },
    },
    {
      $sort: { _id: -1 },
    },
    {
      $group: {
        _id: "$minuteId",
        latestEntry: { $first: "$$ROOT" },
      },
    },
    {
      $replaceRoot: { newRoot: "$latestEntry" },
    },
  ];

  // let totalCount = await Minutes.aggregate(pipeLine);
  let actionDatas = await Minutes.aggregate(pipeLine);

  // console.log(
  //   "totalCount------===========================================---",
  //   totalCount
  // );
  // fffffffffff;
  console.log("actionDatas========33===", actionDatas);
  const finalData = {
    totalCount: actionDatas.length,
    pending: 0,
    cancelled: 0,
    approved: 0,
    completed: 0,
    reassigned: 0,
    requestedForReassigned: 0,
    reopened: 0,
  };
  if (actionDatas?.length !== 0) {
    actionDatas.map(async (action) => {
      if (
        action.actionStatus === "PENDING" ||
        action.actionStatus === "REQUESTFORREASSIGN" ||
        action.actionStatus === "REOPENED"
      ) {
        finalData.pending = finalData.pending + 1;
      }

      if (action.actionStatus === "CANCELLED") {
        finalData.cancelled = finalData.cancelled + 1;
      }

      if (action.actionStatus === "REOPENED") {
        finalData.reopened = finalData.reopened + 1;
      }

      if (action.actionStatus === "APPROVED") {
        finalData.approved = finalData.approved + 1;
      }

      if (
        action.actionStatus === "COMPLETED" ||
        action.actionStatus === "APPROVED"
      ) {
        finalData.completed = finalData.completed + 1;
      }

      if (action.actionStatus === "REQUESTFORREASSIGN") {
        finalData.requestedForReassigned = finalData.requestedForReassigned + 1;
      }

      if (action.actionStatus === "REASSIGNED") {
        finalData.reassigned = finalData.reassigned + 1;
      }
    });
  }
  return finalData;
};

/**FUNC- TO VIEW ALL MEETINGS ACTION LIST BY PRIORITY**/
const getUserActionPriotityDetails = async (
  queryData,
  bodyData,
  userId,
  userData
) => {
  const { order } = queryData;
  const { organizationId, searchKey } = bodyData;
  let meetingIds = [];
  let query = {
    isComplete: false,
    isCancelled: false,
    isActive: true,
    isAction: true,
    isPending: true,
    organizationId: new ObjectId(organizationId),
    // actionStatus: { $ne: "CANCELLED" },
    $and: [
      { actionStatus: { $ne: "REASSIGNED" } },
      { actionStatus: { $ne: "CANCELLED" } },
    ],
  };
  if (searchKey) {
    const meetingData = await Meeting.find(
      {
        isActive: true,
        $or: [
          {
            title: { $regex: searchKey, $options: "i" },
          },
          {
            meetingId: { $regex: searchKey, $options: "i" },
          },
        ],
      },
      { _id: 1, title: 1, meetingId: 1 }
    );
    console.log("meetingData=====================>>>", meetingData);
    //if (meetingData?.length !== 0) {
    meetingIds = meetingData.map((item) => item._id);

    console.log("meetingIds=====================>>>", meetingIds);
    query["meetingId"] = { $in: meetingIds };
    // }
  }
  if (!userData.isAdmin) {
    const meetingsIds = await meetingService.getMeetingIdsOfCreatedById(userId);
    console.log(
      "meetingsIds============================>>>>>>>>>>",
      meetingsIds
    );
    query["$or"] = [
      { assignedUserId: new ObjectId(userId) },
      { createdById: new ObjectId(userId) },
      { meetingId: { $in: [...meetingsIds, ...meetingIds] } },
    ];
  }
  console.log(userData);
  console.log("query=================111======>>>>>>>>>>>>>", query);
  var limit = parseInt(queryData.limit);
  var skip = (parseInt(queryData.page) - 1) * parseInt(limit);
  const userDatas = await Minutes.aggregate([
    // Match only tasks with "pending" status
    {
      $match: query,
    },
    // Group tasks by studentId and count the number of pending tasks
    {
      $group: {
        _id: "$assignedUserId", // Group by assigned User Id
        pendingActions: { $sum: 1 }, // Count pending tasks
        totalHighPriorityDueAction: {
          $sum: { $cond: [{ $eq: ["$priority", "HIGH"] }, 1, 0] },
        }, // Count high-priority tasks
        totalLowPriorityDueAction: {
          $sum: { $cond: [{ $eq: ["$priority", "LOW"] }, 1, 0] },
        }, //
        totalMediumPriorityDueAction: {
          $sum: { $cond: [{ $eq: ["$priority", "NORMAL"] }, 1, 0] },
        }, //
      },
    },
    // Sort by the number of pending tasks in descending order
    { $sort: { pendingActions: -1 } },

    // Lookup to join user details
    {
      $lookup: {
        from: "employees", // Collection name for user
        localField: "_id", // user id in tasks
        foreignField: "_id", // _id in user
        pipeline: [
          {
            $match: {
              isActive: true,
            },
          },
        ],
        as: "employeeDetails", // Field to store joined data
      },
    },
    // Unwind the user array to make it a single object
    { $unwind: "$employeeDetails" },
    // Project the final result
    {
      $project: {
        _id: 1, // Exclude _id
        description: 1,
        assignedUserId: "$_id",
        name: "$employeeDetails.name",
        email: "$employeeDetails.email",
        isEmployee: "$employeeDetails.isEmployee",
        pendingActions: 1,
        totalMediumPriorityDueAction: 1,
        totalHighPriorityDueAction: 1,
        totalLowPriorityDueAction: 1,
      },
    },
  ])
    // .sort({ _id: parseInt(order) })
    .skip(skip)
    .limit(limit);

  const pendingActionsDetail = await Minutes.aggregate([
    {
      $match: query,
    },
    { $group: { _id: "$assignedUserId", totalPendingActions: { $sum: 1 } } },
    // Lookup to join student details
    {
      $lookup: {
        from: "employees", // Collection name for students
        localField: "_id", // studentId in tasks
        foreignField: "_id", // _id in students
        pipeline: [
          {
            $match: {
              isActive: true,
            },
          },
        ],
        as: "employeeDetails", // Field to store joined data
      },
    },
    // Unwind the student array to make it a single object
    { $unwind: "$employeeDetails" },
    // Project the final result
    {
      $project: {
        _id: 1, // Exclude _id
        totalPendingActions: 1,
      },
    },
  ]);

  console.log(
    "pendingActionsDetail===========================",
    pendingActionsDetail
  );
  return {
    totalCount: pendingActionsDetail.length || 0,
    userDatas,
  };
};

module.exports = {
  comments,
  viewActionComment,
  actionReassignRequest,
  viewSingleAction,
  reAssignAction,
  viewAllAction,
  viewUserAllAction,
  updateAction,
  createActionActivity,
  viewActionActivity,
  reOpenAction,
  approveAction,
  rejectReasignRequest,
  cancelAction,
  totalActionList,
  getUserActionPriotityDetails,
};
