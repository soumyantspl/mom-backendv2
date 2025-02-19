const Minutes = require("../models/minutesModel");
const Agenda = require("../models/agendaModel");
const he = require("he");
const MomAcceptStatus = require("../models/momAcceptStatusModel");
const agendaService = require("../services/agendaService");
const employeeService = require("./employeeService");
const notificationService = require("./notificationService");
const logMessages = require("../constants/logsConstants");
const logService = require("./logsService");
const Rooms = require("../models/roomModel");
let ejs = require("ejs");
const fileService = require("./fileService");
const Meetings = require("../models/meetingModel");
const Employee = require("../models/employeeModel");
const ObjectId = require("mongoose").Types.ObjectId;
const emailTemplates = require("../emailSetUp/dynamicEmailTemplate");
//const emailTemplates = require("../emailSetUp/emailTemplates");
const meetingService = require("../services/meetingService");
const actionService = require("../services/actionService");
const emailConstants = require("../constants/emailConstants");
const emailService = require("./emailService");
const commonHelper = require("../helpers/commonHelper");
const Config = require("../models/configurationModel");
const Organization = require("../models/organizationModel");
//FUNCTION TO ACCEPT OR REJECT MINUTES
const acceptRejectMinutes = async (data, minuteId, userId) => {
  const result = await Minutes.findOneAndUpdate(
    {
      "attendees.id": new ObjectId(userId),
      _id: new ObjectId(minuteId),
    },
    {
      $set: { "attendees.$.status": data.status },
    }
  );
  if (result) {
    const activityObject = {
      activityDetails: result.description,
      activityTitle: data.status == "ACCEPTED" ? "Accepted" : "Rejected",
      meetingId: data.meetingId,
    };
    const meetingActivitiesResult =
      await meetingService.createMeetingActivities(activityObject, userId);
  }
  return result;
};
//FUNCTION RO CREATE MINUTES
const createMinutes = async (
  minutes,
  meetingId,
  userId,
  userData,
  ipAddress = "1000"
) => {
  const meetingDetails = await meetingService.viewMeeting(meetingId, userId);
  const configResult = await Config.findOne(
    {
      organizationId: new ObjectId(meetingDetails?.organizationId),
    },
    { writeMinuteMaxTimeInHour: 1, _id: 1 }
  );
  console.log(meetingDetails?.meetingStatus?.status);

  if (
    meetingDetails?.meetingStatus?.status == "closed" ||
    meetingDetails?.meetingStatus?.status == "draft" ||
    meetingDetails?.meetingStatus?.status == "cancelled"
  ) {
    console.log("innnnnnnnnnnnnnnnnnnnnn");
    const writeMinuteMaxTimeInMilliSec =
      parseInt(configResult?.writeMinuteMaxTimeInHour) * 3600000;
    const currentDateTime = new Date().getTime();
    const closedTime = meetingDetails?.meetingCloseDetails?.closedAt
      ? new Date(meetingDetails?.meetingCloseDetails?.closedAt).getTime()
      : 0;
    const isWriteMinuteAllowedForClosedMinutes =
      currentDateTime - closedTime > writeMinuteMaxTimeInMilliSec
        ? false
        : true;
    if (isWriteMinuteAllowedForClosedMinutes === false) {
      return {
        isWriteMinuteNotAllowedForClosedMinutes: true,
      };
    }
    console.log(
      "configResult?.writeMinuteMaxTimeInHour------------",
      configResult?.writeMinuteMaxTimeInHour
    );
    console.log("current date", new Date());
    console.log(
      " meetingDetails?.meetingCloseDetails?.closedAt",
      meetingDetails?.meetingCloseDetails?.closedAt
    );
    console.log(
      "isWriteMinuteAllowedForClosedMinutes-------------------",
      isWriteMinuteAllowedForClosedMinutes
    );
  }

  minutes.map(async (data) => {
    const logData = {
      moduleName: logMessages.Minute.moduleName,
      userId,
      action: logMessages.Minute.createMinute,
      ipAddress,
      details: data.assignedUserId
        ? "Action Created: <strong>" + data.title + "</strong>"
        : "Minute Created: <strong>" + data.title + "</strong>",
      organizationId: data.organizationId,
      subDetails: ` Meeting Title: ${meetingDetails.title} (${meetingDetails.meetingId})`,
    };

    const organization = await Organization.findOne({ email: data.email }); 
    const logo = organization?.dashboardLogo
      ? `${BASE_URL}/${organization.dashboardLogo.replace(/\\/g, "/")}`
      : process.env.LOGO;

    if (data.isNewUser) {
      const empData = await employeeService.createAttendee(
        data.name,
        data.email,
        data.organizationId,
        data.designation,
        data.companyName
      );
      if (empData.isDuplicate) {
        //return empData;
        data["assignedUserId"] = empData.duplicateUserId;
      } else {
        data["assignedUserId"] = new ObjectId(empData._id);
      }
    }
    (data["title"] = data?.title?.trimStart()),
      (data["description"] = data?.description?.trimStart()),
      (data["isActive"] = true);
    data["createdById"] = new ObjectId(userId);
    data["priority"] = data.priority ? data.priority : "LOW";
    data["dueDate"] = data.dueDate
      ? new Date(data.dueDate)
      : new Date(meetingDetails?.date);
    data["mainDueDate"] = data.dueDate
      ? new Date(data.dueDate)
      : new Date(meetingDetails?.date);

    data["assignedUserId"] = data.assignedUserId
      ? data.assignedUserId
      : new ObjectId(userId);

    const minuteDetails = await Minutes.find(
      { meetingId: new ObjectId(meetingDetails?._id), isActive: true },
      { _id: 1, sequence: 1 }
    );
    console.log("minuteDetails------------444", minuteDetails);
    data["sequence"] =
      minuteDetails.length !== 0
        ? minuteDetails[minuteDetails.length - 1].sequence + 1
        : 1;
    console.log("hhhhhhhhhhhhhhh", data);
    //yyyyyyyyyyyyyyyyyy
    const minuteData = new Minutes(data);
    const newMinutes = await minuteData.save();
    await Minutes.findByIdAndUpdate(
      { _id: new ObjectId(newMinutes._id) },
      { minuteId: new ObjectId(newMinutes._id) }
    );
    if (data?.isAction) {
      const actionActivityObject = {
        //activityDetails: data.reAssignReason,
        activityTitle: "ACTION CREATED",
        minuteId: newMinutes._id,
        userId,
        actionId: newMinutes._id,
      };
      const actionActivitiesResult = await actionService.createActionActivity(
        actionActivityObject
      );
      const assignedUserDetail = await Employee.findOne(
        { _id: new ObjectId(data?.assignedUserId) },
        { email: 1, name: 1, _id: 1 }
      );
      // const logo = process.env.LOGO;
      const mailData = await emailTemplates.actionAssignEmailTemplate(
        meetingDetails,
        logo,
        assignedUserDetail,
        userData,
        newMinutes,
      );
      // const emailSubject = await emailConstants.assignSubject(newMinutes);
      const { emailSubject, mailData: mailBody } = mailData;

      console.log("userData->", userData)
      if (assignedUserDetail) {
        emailService.sendEmail(
          assignedUserDetail?.email,
          "Action Created",
          emailSubject,
          mailBody
        );
      }

      if (userData._id.toString() !== meetingDetails.createdById.toString()) {
        const mailData = await emailTemplates.actionAssignAdminEmailTemplate(
          meetingDetails,
          logo,
          assignedUserDetail,
          newMinutes,
          userData
        );
        // const emailSubject = await emailConstants.assignSubject(newMinutes);
        const { emailSubject, mailData: mailBody } = mailData;
        console.log("userData->", userData)
        console.log("emailSubject->", emailSubject)
        console.log("Meeting details start", meetingDetails)
        console.log("Meeting details end")
        emailService.sendEmail(
          meetingDetails.createdByDetail.email,
          "Action Created",
          emailSubject,
          mailBody
        );
      }
    }

    const activityObject = {
      activityDetails:
        newMinutes?.isAction === true
          ? newMinutes.title + " (action)"
          : newMinutes.title + " (minute)",
      activityTitle: "CREATED",
      meetingId: data.meetingId,
    };
    const meetingActivitiesResult =
      await meetingService.createMeetingActivities(activityObject, userId);
    await logService.createLog(logData);
  });
  return true;
};

//FUNCTION TO DOWNLOAD MINUTES
const downLoadMinutes1 = async (meetingId) => {
  const minutesData = await Minutes.aggregate([
    {
      $match: {
        meetingId: new ObjectId(meetingId),
      },
    },

    {
      $lookup: {
        from: "organizations",
        localField: "organizationId",
        foreignField: "_id",
        as: "organizationDetail",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "attendees.id",
        foreignField: "_id",
        as: "attendeesDetails",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "createdById",
        foreignField: "_id",
        as: "createdByDetails",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "amendmentDetails.createdById",
        foreignField: "_id",
        as: "amendmentDetail",
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
      $lookup: {
        from: "employees",
        localField: "reassignedUserId",
        foreignField: "_id",
        as: "reAssignedUserDetail",
      },
    },

    {
      $project: {
        _id: 1,
        attendees: 1,
        description: 1,
        title: 1,
        priority: 1,
        amendmentDetails: 1,
        dueDate: 1,
        reassignedUserId: 1,
        assignedUserId: 1,
        organizationDetail: {
          name: 1,
        },
        createdByDetails: {
          name: 1,
        },
        attendeesDetails: {
          email: 1,
          _id: 1,
          name: 1,
          status: 1,
        },
        amendmentDetail: {
          name: 1,
        },
        assignedUserDetail: {
          name: 1,
        },
        reAssignedUserDetail: {
          name: 1,
        },
      },
    },
    { $unwind: "$organizationDetail" },
    { $unwind: "$createdByDetails" },
    { $unwind: "$amendmentDetail" },
    { $unwind: "$assignedUserDetail" },
    { $unwind: "$reAssignedUserDetail" },
  ]);
  let pendingUsers = [];
  let rejectedBy = [];
  let acceptedBy = [];
  const newData = minutesData.map((item, index) => {
    item.attendeesDetails.map((attendee) => {
      const currentAttendee = item.attendees.find(
        (i) => i.id.toString() == attendee._id
      );
      if (currentAttendee.status == "ACCEPTED") {
        acceptedBy.push(attendee.name);
      }
      if (currentAttendee.status == "REJECTED") {
        rejectedBy.push(attendee.name);
      }
      if (currentAttendee.status == "PENDING") {
        pendingUsers.push(attendee.name);
      }
      const actionData = {
        pendingUsers,
        rejectedBy,
        acceptedBy,
      };
      minutesData[index]["actionData"] = actionData;
      return item;
    });
  });
  return await fileService.generatePdf(minutesData);
};

//FUNCTION TO DOWNLOAD MINUTES
const downLoadMinutes2 = async (meetingId, userId) => {
  const pipeLine = [
    {
      $match: {
        meetingId: new ObjectId(meetingId),
        isActive: true,
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
      $unwind: {
        path: "$meetingDetail",
      },
    },

    {
      $lookup: {
        from: "minutes",
        localField: "_id",
        foreignField: "agendaId",
        as: "minutesDetail",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "meetingDetail.attendees._id",
        foreignField: "_id",
        as: "attendeesDetails",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "minutesDetail.assignedUserId",
        foreignField: "_id",
        as: "assignedUserDetail",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "minutesDetail.reassignedUserId",
        foreignField: "_id",
        as: "reAssignedUserDetail",
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        timeLine: 1,
        topic: 1,
        meetingDetail: {
          title: 1,
          _id: 1,
          link: 1,
          attendees: 1,
          title: 1,
          mode: 1,
          link: 1,
          date: 1,
          fromTime: 1,
          toTime: 1,
          locationDetails: 1,
        },
        minutesDetail: {
          _id: 1,
          description: 1,
          isAction: 1,
          assignedUserId: 1,
          reassignedUserId: 1,
          dueDate: 1,
          isComplete: 1,
          priority: 1,
          amendmentDetails: 1,
          attendees: 1,
          createdById: 1,
        },
        attendeesDetails: {
          _id: 1,
          name: 1,
          status: 1,
        },
        assignedUserDetail: {
          _id: 1,
          name: 1,
        },
        reAssignedUserDetail: {
          _id: 1,
          name: 1,
        },
      },
    },
  ];
  const meetingData = await Agenda.aggregate(pipeLine);
  if (meetingData.length !== 0) {
    if (meetingData[0].meetingDetail.locationDetails.roomId) {
      const roomId =
        meetingData[0].meetingDetail.locationDetails.roomId.toString();
      var roomsData = await Rooms.findById(roomId, {
        _id: 1,
        title: 1,
        location: 1,
      });
    }
    const meetingDataObject = {
      agendaDetails: [],
    };
    meetingData.map((item) => {
      if (!meetingDataObject.meetingDetail) {
        meetingDataObject.meetingDetail = item.meetingDetail;
      }
      delete item.meetingDetail;
      meetingDataObject.agendaDetails.push(item);
      meetingDataObject.meetingDetail.attendeesDetails = item.attendeesDetails;

      item.minute;
    });
    meetingDataObject.meetingDetail.location = roomsData
      ? roomsData.location
      : meetingDataObject.meetingDetail.locationDetails.location;
    meetingDataObject.agendaDetails.map((item) => {
      item.minutesDetail.map((minutesItem) => {
        const assignedUserDetails = item.assignedUserDetail.find(
          (i) => i._id.toString() == minutesItem.assignedUserId
        );

        const reAssignedUserDetails = item.reAssignedUserDetail.find(
          (i) => i._id.toString() == minutesItem.reassignedUserId
        );
        minutesItem.reassignedUserName = reAssignedUserDetails?.name;
        minutesItem.assignedUserName = assignedUserDetails?.name;
        return minutesItem;
      });
    });

    meetingDataObject.agendaDetails.map((mainItem) => {
      mainItem.minutesDetail.map((minuteItem) => {
        let pendingUsers = [];
        let rejectedBy = [];
        let acceptedBy = [];

        meetingDataObject.meetingDetail.attendeesDetails.map((attendeeItem) => {
          const currentAttendee = minuteItem.attendees?.find(
            (i) => i.id.toString() == attendeeItem._id.toString()
          );
          if (currentAttendee?.status == "ACCEPTED") {
            acceptedBy.push(attendeeItem.name);
          }
          if (currentAttendee?.status == "REJECTED") {
            rejectedBy.push(attendeeItem.name);
          }
          if (currentAttendee?.status == "PENDING") {
            pendingUsers.push(attendeeItem.name);
          }
          const actionData = {
            pendingUsers,
            rejectedBy,
            acceptedBy,
          };
          minuteItem["actionData"] = actionData;
          return minuteItem;
        });
      });
    });
    return await fileService.generateMinutesPdf(meetingDataObject);
  }
  return false;
};

const downLoadMinutes = async (meetingId, userId) => {
  return await generateMinutesPdftest(meetingId, userId);
};
const testPdf = async () => {
  return await fileService.generateMinutesPdf();
};

//FUNCTION TO ACCEPT OR REJECT MINUTES
const createAmendmentRequest = async (data, minuteId, userId) => {
  const amendmentDetail = {
    createdById: new ObjectId(userId),
    details: data.details,
    status: "PENDING",
  };
  const result = await Minutes.findOneAndUpdate(
    {
      $or: [
        {
          "attendees.id": new ObjectId(userId),
        },
        {
          amendmentDetails: {
            $elemMatch: { createdById: new ObjectId(userId) },
          },
        },
      ],
      $and: [
        {
          _id: new ObjectId(minuteId),
        },
      ],
    },
    {
      $set: { amendmentDetails: amendmentDetail },
    }
  );

  const organization = await Organization.findOne({ email: data.email });
  const logo = organization?.dashboardLogo
    ? `${BASE_URL}/${organization.dashboardLogo.replace(/\\/g, "/")}`
    : process.env.LOGO;

  if (result) {
    const activityObject = {
      activityDetails: data.details,
      activityTitle: "AMENDMENT CREATED",
      meetingId: result.meetingId,
    };
    const meetingActivitiesResult =
      await meetingService.createMeetingActivities(activityObject, userId);

    const meetingDetails = await meetingService.viewMeeting(
      result.meetingId,
      userId
    );


    if (meetingDetails) {
      const attendeeDetails = meetingDetails.attendees.find(
        (item) => item._id.toString() === userId.toString()
      );
      // const logo = process.env.LOGO;
      const mailData = await emailTemplates.sendAmendmentCreatedEmailTemplate(
        meetingDetails,
        attendeeDetails,
        logo
      );
      const emailSubject = await emailConstants.sendAmendmentCreatedSubject(
        meetingDetails
      );
      emailService.sendEmail(
        meetingDetails?.createdByDetail?.email,
        "Create Minutes Amendment",
        emailSubject,
        mailData
      );
      const allowedUsers = [
        new ObjectId(userId),
        result?.createdById,
        meetingDetails?.createdById,
      ];
      const notificationData = {
        title: "AMENDMENT REQUESTED",
        organizationId: new ObjectId(result.organizationId),
        meetingId: result?.meetingId,
        byUserId: new ObjectId(userId),
        details: {
          byDetails: `${result?.description}: is amendment requested by `,
          toDetails: null,
        },
        allowedUsers,
      };
      const addNotification = await notificationService.createNotification(
        notificationData
      );
    }
  }

  return result;
};

//FUNCTION TO ACCEPT OR REJECT MINUTES
const updateAmendmentRequest = async (data, minuteId, userId) => {
  const result = await Minutes.findOneAndUpdate(
    {
      "amendmentDetails.createdById": new ObjectId(data.createdById),
      _id: new ObjectId(minuteId),
    },

    {
      $set: { "amendmentDetails.$.status": data.status },
    }
  );
  const allowedUsers = [
    new ObjectId(userId),
    result?.createdById,
    meetingDetails?.createdById,
    new ObjectId(data.createdById),
  ];
  const notificationData = {
    title:
      data.status === "cancelled"
        ? "AMENDMENT REQUEST CANCELLED"
        : "AMENDMENT REQUEST UPDATED",
    organizationId: new ObjectId(result.organizationId),
    meetingId: result?.meetingId,
    byUserId: new ObjectId(userId),
    details: {
      byDetails:
        data.status === "cancelled"
          ? `${result?.description}'s amendment request is cancelled by `
          : `${result?.description}'s amendment request is updated by `,
      toDetails: null,
    },
    allowedUsers,
  };
  const addNotification = await notificationService.createNotification(
    notificationData
  );

  return result;
};

//FUNCTION TO GET ONLY MEETING LIST OF ATTENDEES
const getMeetingListOfAttendees = async (organizationId, userId, userData) => {
  const matchData =
    userData?.isAdmin || userData.isMeetingOrganizer
      ? {
        organizationId: new ObjectId(organizationId),
        isActive: true,
        isAction: true,
      }
      : {
        organizationId: new ObjectId(organizationId),
        $or: [
          {
            assignedUserId: new ObjectId(userId),
          },
          {
            reassignedUserId: new ObjectId(userId),
          },
          {
            createdById: new ObjectId(userId),
          },
        ],
        isActive: true,
        isAction: true,
      };
  const pipeLine = [
    {
      $match: matchData,
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
        localField: "createdById",
        foreignField: "_id",
        as: "createdByDetails",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "assignedUserId",
        foreignField: "_id",
        as: "assigneeDetails",
      },
    },
    {
      $project: {
        _id: 1,
        createdById: 1,
        meetingDetail: {
          _id: 1,
          meetingId: 1,
          title: 1,
        },
        createdByDetails: {
          _id: 1,
          email: 1,
          name: 1,
        },
        assigneeDetails: {
          _id: 1,
          email: 1,
          name: 1,
        },
      },
    },

    { $unwind: "$meetingDetail" },
    { $unwind: "$createdByDetails" },
    { $unwind: "$assigneeDetails" },
  ];

  const result = await Minutes.aggregate(pipeLine);
  const meetingDetail = [];
  const ownerDetails = [];
  const assigneeDetails = [];
  const finalResult = result.map((item) => {
    if (meetingDetail.length !== 0) {
      const checkMeeting = meetingDetail.find(
        (meeting) =>
          meeting._id.toString() === item.meetingDetail._id.toString()
      );
      if (!checkMeeting) {
        meetingDetail.push(item.meetingDetail);
      }
    } else {
      meetingDetail.push(item.meetingDetail);
    }

    if (ownerDetails.length !== 0) {
      const checkOwner = ownerDetails?.find(
        (owner) =>
          owner?._id?.toString() === item?.createdByDetails?._id?.toString()
      );
      if (!checkOwner) {
        ownerDetails.push(item?.createdByDetails);
      }
    } else {
      ownerDetails.push(item?.createdByDetails);
    }
    if (assigneeDetails.length !== 0) {
      const checkAssignee = assigneeDetails?.find(
        (assignee) =>
          assignee?._id?.toString() === item?.assigneeDetails?._id?.toString()
      );
      if (!checkAssignee) {
        assigneeDetails.push(item?.assigneeDetails);
      }
    } else {
      assigneeDetails.push(item?.assigneeDetails);
    }
  });
  return {
    ownerDetails,
    meetingDetail,
    assigneeDetails,
  };
};

//FUNCTION TO ACCEPT OR REJECT MINUTES
const updateMinute = async (data, minuteId, userId, userData, ipAddress = "1000") => {
  const meetingDetails = await meetingService.viewMeeting(
    data?.meetingId,
    userId
  );
  console.log("Meeting Details", meetingDetails)

  const configResult = await Config.findOne(
    {
      organizationId: new ObjectId(meetingDetails?.organizationId),
    },
    { writeMinuteMaxTimeInHour: 1, _id: 1 }
  );
  console.log(meetingDetails?.meetingStatus?.status);

  if (
    meetingDetails?.meetingStatus?.status == "closed" ||
    meetingDetails?.meetingStatus?.status == "draft" ||
    meetingDetails?.meetingStatus?.status == "cancelled"
  ) {
    console.log("innnnnnnnnnnnnnnnnnnnnn");
    const writeMinuteMaxTimeInMilliSec =
      parseInt(configResult?.writeMinuteMaxTimeInHour) * 3600000;
    const currentDateTime = new Date().getTime();
    const closedTime = meetingDetails?.meetingCloseDetails?.closedAt
      ? new Date(meetingDetails?.meetingCloseDetails?.closedAt).getTime()
      : 0;
    const isWriteMinuteAllowedForClosedMinutes =
      currentDateTime - closedTime > writeMinuteMaxTimeInMilliSec
        ? false
        : true;
    console.log(
      "isWriteMinuteAllowedForClosedMinutes------------",
      isWriteMinuteAllowedForClosedMinutes
    );
    if (isWriteMinuteAllowedForClosedMinutes === false) {
      return {
        isWriteMinuteNotAllowedForClosedMinutes: true,
      };
    }
  }
  console.log("outttttttttttttttttttt");
  let result = null;
  const getParentId = await Minutes.findOne(
    { _id: new ObjectId(minuteId) },
    { _id: 1, parentMinuteId: 1 }
  );

  if (getParentId) {
    const parentMinuteId = getParentId?.parentMinuteId;
    if (data.isAction == false) {
      data.dueDate = null;
      data.assignedUserId = null;
      data.priority = null;
      data["mainDueDate"] = null;
    }
    if (data.isAction == true) {
      data["mainDueDate"] = data.dueDate;
      if (data.isNewUser) {
        const empData = await employeeService.createAttendee(
          data.name,
          data.email,
          data.organizationId
        );
        if (empData.isDuplicate) {
          data["assignedUserId"] = empData.duplicateUserId;
        } else {
          data["assignedUserId"] = new ObjectId(empData._id);
        }
      }
    }
    await Minutes.findByIdAndUpdate(
      { _id: new ObjectId(parentMinuteId) },

      data,

      {
        new: false,
      }
    );

    result = await Minutes.findByIdAndUpdate(
      { _id: new ObjectId(minuteId) },
      data,
      {
        new: false,
      }
    );
  } else {
    if (data.isAction == false) {
      data.dueDate = null;
      data.assignedUserId = null;
      data.priority = null;
      data["mainDueDate"] = null;
    }

    if (data.isAction == true) {
      data["mainDueDate"] = data.dueDate;
      if (data.isNewUser) {
        const empData = await employeeService.createAttendee(
          data.name,
          data.email,
          data.organizationId
        );
        if (empData.isDuplicate) {
          data["assignedUserId"] = empData.duplicateUserId;
        } else {
          data["assignedUserId"] = new ObjectId(empData._id);
        }
      }
    }
    data["assignedUserId"] = data.assignedUserId
      ? data.assignedUserId
      : new ObjectId(userId);

    result = await Minutes.findByIdAndUpdate(
      { _id: new ObjectId(minuteId) },
      data,
      {
        new: false,
      }
    );
  }

  if (result) {
    if (
      data.isAction == true &&
      data?.assignedUserId?.toString() != result?.assignedUserId?.toString()
    ) {
      const assignedUserDetail = await Employee.findOne(
        { _id: new ObjectId(data?.assignedUserId) },
        { email: 1, name: 1, _id: 1 }
      );
      // const logo = process.env.LOGO;
      const mailData = await emailTemplates.actionAssignEmailTemplate(
        meetingDetails,
        logo,
        assignedUserDetail,
        result,
        userData
      );
      // const emailSubject = await emailConstants.assignSubject(result);
      const { emailSubject, mailData: mailBody } = mailData;

      if (assignedUserDetail) {
        emailService.sendEmail(
          assignedUserDetail?.email,
          "Action Created",
          emailSubject,
          mailBody
        );

      }

      if (userData._id.toString() !== meetingDetails.createdById.toString()) {
        const mailData = await emailTemplates.actionAssignAdminEmailTemplate(
          meetingDetails,
          logo,
          assignedUserDetail,
          result,
          userData
        );
        // const emailSubject = await emailConstants.assignSubject(result);
        const { emailSubject, mailData: mailBody } = mailData;
        console.log("userData->", userData)
        console.log("emailSubject->", emailSubject)
        console.log("Meeting details start", meetingDetails)
        console.log("Meeting details end")
        emailService.sendEmail(
          meetingDetails.createdByDetail.email,
          "Action Created",
          emailSubject,
          mailBody
        );
      }

    }

    const activityObject = {
      activityDetails:
        result?.isAction === true
          ? result.title + " (action)"
          : result.title + " (minute)",
      activityTitle: "Updated",
      userId,
      meetingId: data.meetingId,
    };
    const meetingActivitiesResult =
      await meetingService.createMeetingActivities(activityObject, userId);
    let logDetails = await commonHelper.generateMinuteLogObject(
      result,
      userId,
      data
    );
    if (
      data?.assignedUserId &&
      result?.assignedUserId &&
      data?.assignedUserId?.toString() !== result?.assignedUserId?.toString() &&
      data?.isAction == true
    ) {
      const newUser = await Employee.findOne(
        { _id: new ObjectId(data.assignedUserId) },
        { _id: 1, name: 1, email: 1 }
      );
      const oldUser = await Employee.findOne(
        { _id: new ObjectId(result.assignedUserId) },
        { _id: 1, name: 1, email: 1 }
      );
      logDetails.push(
        `Assigned User changed from <strong>${commonHelper.convertFirstLetterToCapital(
          oldUser.name
        )}</strong> to <strong>${commonHelper.convertFirstLetterToCapital(
          newUser.name
        )}</strong>`
      );
    }

    if (logDetails.length !== 0) {
      const meetingDetails = await meetingService.viewMeeting(
        result.meetingId,
        userId
      );
      const logData = {
        moduleName: logMessages.Minute.moduleName,
        userId,
        action: data?.isAction
          ? logMessages.Minute.updateMinute
          : logMessages.Action.updateAction,
        ipAddress,
        details: logDetails.join(" , "),
        subDetails: `
        Minute : ${data.title}</br>
        Meeting Title: ${meetingDetails.title} (${meetingDetails.meetingId})`,
        organizationId: result.organizationId,
      };
 
      await logService.createLog(logData);
    }
    if (data?.isAction==true && result?.isAction==false) {
      const actionActivityObject = {
        //activityDetails: data.reAssignReason,
        activityTitle: "ACTION CREATED",
        minuteId: result._id,
        userId,
        actionId: result._id,
      };
      const actionActivitiesResult = await actionService.createActionActivity(
        actionActivityObject
      );
  }
    return result;
  } else {
  }
};

//FUNCTION TO DELETE MINUTES
const deleteMinute = async (
  meetingId,
  minuteId,
  userId,
  ipAddress = "1000"
) => {
  const meetingDetails = await Meetings.findOne(
    { _id: new ObjectId(minuteId) },
    { _id: 1, momGenerationDetails: 1 }
  );
  if (meetingDetails?.momGenerationDetails?.length === 0) {
    return {
      isDeleteNotAllowed: true,
    };
  }
  const result = await Minutes.findOneAndUpdate(
    {
      _id: new ObjectId(minuteId),
    },
    {
      $set: { isActive: false },
    }
  );

  if (result) {
    const activityObject = {
      activityDetails:
        result?.isAction === true
          ? result.title + " (action)"
          : result.title + " (minute)",
      activityTitle: "Deleted",
      userId,
      meetingId: meetingId,
    };
    const meetingActivitiesResult =
      await meetingService.createMeetingActivities(activityObject, userId);
    const meeting = await Meetings.findOne(
      { _id: new ObjectId(result.meetingId) },
      { _id: 1, title: 1, meetingId: 1 }
    );
    const logData = {
      moduleName: logMessages.Minute.moduleName,
      userId,
      action: logMessages.Minute.deleteMinute,
      ipAddress,
      details: "Minute Title: <strong>" + result.description + "</strong>",
      subDetails: ` Meeting Title: ${meeting.title} (${meeting.meetingId})`,
      organizationId: result.organizationId,
    };
    await logService.createLog(logData);
  }
  return result;
};

//FUNCTION TO ACCEPT MINUTES
const acceptMinutes = async (data, meetingId, userId, ipAddress = "1000") => {
  const result = await Minutes.updateMany(
    {
      meetingId: new ObjectId(meetingId),
      isActive: true,
      "attendees.id": new ObjectId(userId),
    },
    {
      $set: {
        "attendees.$.status": "ACCEPTED",
      },
    }
  );
  const getUpdatedResult = await Minutes.find(
    {
      meetingId: new ObjectId(meetingId),
      isActive: true,
      "attendees.id": new ObjectId(userId),
    },
    { createdById: 1 }
  );
  const inputData = {
    userId,
    meetingId,
    momId: data.momId,
  };
  const minuteData = new MomAcceptStatus(inputData);
  const acceptDetails = await minuteData.save();
  if (acceptDetails) {
    const activityObject = {
      activityDetails: "ALL MINUTES",
      activityTitle: "ACCEPTED",
      meetingId: meetingId,
    };
    const meetingActivitiesResult =
      await meetingService.createMeetingActivities(activityObject, userId);
  }

  const meetingDetails = await meetingService.viewMeeting(meetingId, userId);

  if (meetingDetails) {
    let allowedUsers = [new ObjectId(userId), meetingDetails?.createdById];
    if (getUpdatedResult.length !== 0) {
      allowedUsers = [...allowedUsers, ...getUpdatedResult];
    }
    const notificationData = {
      title: "MOM ACCEPTED",
      organizationId: new ObjectId(result.organizationId),
      meetingId,
      byUserId: new ObjectId(userId),
      details: {
        byDetails: `MOM is accepted by `,
        toDetails: null,
      },
      allowedUsers,
    };

    const addNotification = await notificationService.createNotification(
      notificationData
    );
    const userDetails = await Employee.findOne(
      { _id: new ObjectId(userId) },
      { _id: 1, name: 1, email: 1 }
    );
    const logData = {
      moduleName: logMessages.Minute.moduleName,
      userId,
      action: logMessages.Minute.acceptMinute,
      ipAddress,
      details:
        "MOM is accepted by <strong>" +
        userDetails.name +
        " (" +
        userDetails.email +
        ")</strong>",
      organizationId: meetingDetails.organizationId,
      subDetails: ` Meeting Title: ${meetingDetails.title} (${meetingDetails.meetingId})`,
    };
    await logService.createLog(logData);
    const attendeeDetails = meetingDetails.attendees.find(
      (item) => item._id.toString() === userId.toString()
    );

    // const logo = process.env.LOGO;

    const mailData = await emailTemplates.acceptMinuteEmailTemplate(
      meetingDetails,
      attendeeDetails,
      logo
    );
    // const emailSubject = await emailConstants.acceptMinuteSubject(
    //   meetingDetails
    // );

    const { emailSubject, mailData: mailBody } = mailData;

    emailService.sendEmail(
      meetingDetails?.createdByDetail?.email,
      "Create Minutes Amendment",
      emailSubject,
      mailBody
    );
  }
  return acceptDetails;
};
//FUNCTION TO CHECK MOM WRITE PERMISSION
const checkMomWritePermission = async (meetingId, userId) => {
  const checkMomWritePermission = await Meetings.findOne(
    {
      _id: new ObjectId(meetingId),
      isActive: true,
      $and: [
        {
          $or: [
            {
              "attendees._id": new ObjectId(userId),
              "attendees.canWriteMOM": true,
            },
            { createdById: new ObjectId(userId) },
          ],
        },
      ],
    },
    { _id: 1 }
  );
  if (checkMomWritePermission) {
    return true;
  }
  return false;
};
//FUNCTION TO ACCEPT MINUTES BY CRON
const acceptAllPendingMoms = async () => {
  const configTimeDetails = await Config.find(
    { isActive: true },
    {
      acceptanceRejectionEndtime: 1,
      _id: 1,
      organizationId: 1,
      writeMinuteMaxTimeInHour: 1,
    }
  );
  console.log(configTimeDetails);
  if (configTimeDetails?.length !== 0) {
    configTimeDetails.map(async (data) => {
      const meetingDataArray = await Meetings.find(
        {
          organizationId: new ObjectId(data.organizationId),
          isActive: true,
          momGenerationDetails: { $exists: true, $not: { $size: 0 } },
          isMOMAutoAccepted: false,
          "meetingStatus.status": "closed",
          date: {
            $gte: new Date().toISOString().split("T")[0], // Greater than or equal to startDate
            $lte: new Date().toISOString().split("T")[0], // Less than or equal to endDate
          },
        },
        {
          _id: 1,
          attendees: 1,
          momGenerationDetails: 1,
          date: 1,
          fromTime: 1,
          meetingCloseDetails: 1,
        }
      );
      console.log(meetingDataArray);
      if (meetingDataArray?.length !== 0) {
        meetingDataArray.map(async (meeting) => {
          console.log(
            "meetingClosedTime-----------",
            meeting?.meetingCloseDetails?.closedAt
          );
          const meetingClosedTime = new Date(
            meeting?.meetingCloseDetails?.closedAt
          ).getTime();

          console.log(data.writeMinuteMaxTimeInHour);
          console.log(data.acceptanceRejectionEndtime);
          console.log("add time--------", (480000 + 480000) / 1000 / 60);
          const targetTime =
            meetingClosedTime +
            data.writeMinuteMaxTimeInHour * 60 * 60 * 1000 +
            data.acceptanceRejectionEndtime * 60 * 60 * 1000;
          console.log(
            "currentDateTime-----------",
            new Date(commonHelper.convertIsoFormat(new Date()))
          );
          const currentDateTime = new Date(
            commonHelper.convertIsoFormat(new Date())
          ).getTime();
          //  console.log("currentDateTime", currentDateTime);
          //  console.log("targetTime", targetTime);
          if (currentDateTime >= targetTime) {
            console.log("innnnnnnnnnnnnnnnnnnnnnnn-----------");
            const momId =
              meeting?.momGenerationDetails[
                meeting?.momGenerationDetails.length - 1
              ].momId;
            if (meeting.attendees.length !== 0) {
              meeting.attendees.map(async (attendee) => {
                const checkAleardyAccepted = await MomAcceptStatus.findOne({
                  momId,
                  meetingId: new ObjectId(meeting._id),
                  userId: new ObjectId(attendee._id),
                  isActive: true,
                  isAutoAccepted: false,
                });
                if (!checkAleardyAccepted) {
                  const inputData = {
                    userId: new ObjectId(attendee._id),
                    meetingId: new ObjectId(meeting._id),
                    momId,
                    isAutoAccepted: true,
                  };
                  const minuteData = new MomAcceptStatus(inputData);
                  const acceptDetails = await minuteData.save();
                }
              });
              await Meetings.findOneAndUpdate(
                {
                  _id: new ObjectId(meeting._id),
                  isActive: true,
                  isMOMAutoAccepted: false,
                },
                { isMOMAutoAccepted: true }
              );
            }
          } else {
            console.log("out---------------------------");
          }
        });
      }
    });
  }
};
const chaseOfActionService = async () => {
  const configTimeDetails = await Config.find(
    { isActive: true },
    { chaseOfAction: 1, _id: 1, organizationId: 1 }
  );
  console.log("configTimeDetails-----11--------", configTimeDetails);
  let now = new Date();

  if (configTimeDetails?.length !== 0) {
    configTimeDetails.map(async (data) => {
      let targetDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + (parseInt(data.chaseOfAction) + 1)
      );
      //let targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4);
      console.log("targetDate========", targetDate);
      console.log(
        "only date===========",
        targetDate.toISOString().split("T")[0]
      );
      const minuteDataArray = await Minutes.find(
        {
          organizationId: new ObjectId(data.organizationId),
          isActive: true,
          isAction: true,
          isComplete: false,
          mainDueDate: {
            $gte: targetDate, // Greater than or equal to startDate
            $lte: targetDate, // Less than or equal to endDate
          },
        },
        {
          _id: 1,
          attendees: 1,
          dueDate: 1,
          assignedUserId: 1,
          meetingId: 1,
          createdById: 1,
          description: 1,
          mainDueDate: 1,
        }
      );
      //.limit(1);
      console.log("minuteDataArray-----11--------", minuteDataArray);

      if (minuteDataArray?.length !== 0) {
        minuteDataArray.map(async (minute) => {
          const meetingDetails = await meetingService.viewMeeting(
            minute.meetingId,
            minute.createdById
          );
          const assignedUserDetail = await Employee.findOne(
            { _id: new ObjectId(minute.assignedUserId) },
            { _id: 1, email: 1, name: 1 }
          );
          // const logo = process.env.LOGO;
          const organizationDetails = await Organization.findOne(
            { _id: new ObjectId(data.organizationId) },
            { dashboardLogo: 1, loginLogo: 1 }
          );
          const logo = organizationDetails?.dashboardLogo;

          const mailData =
            await emailTemplates.sendActionDueReminderEmailTemplate(
              meetingDetails,
              minute,
              assignedUserDetail,
              logo
            );
          const emailSubject = await emailConstants.actionDueReminderSubject(
            minute
          );
          emailService.sendEmail(
            assignedUserDetail?.email,
            "Chase Action Due",
            emailSubject,
            mailData
          );
        });
      }
    });
  }
};

const getMomAcceptDetails = async (meetingId, userId) => {
  const result = await MomAcceptStatus.aggregate([
    {
      $match: {
        meetingId: new ObjectId(meetingId),
        isActive: true,
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "userId",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $project: {
        _id: 1,
        meetingId: 1,
        momId: 1,
        userId: 1,
        isActive: 1,
        isAutoAccepted: 1,
        createdAt: 1,
        userDetails: {
          email: 1,
          _id: 1,
          name: 1,
          status: 1,
        },
      },
    },
    { $unwind: "$userDetails" },
  ]);
  return result;
};

const generateMinutesPdftest = async (meetingId, userId) => {
  const filenumber = Math.floor(Math.random() * 100000000000 + 1);
  const meetingAllData = await agendaService.viewAgendas2(meetingId, userId);
  console.log("meetingAllData========================", meetingAllData);
  const filePath = `pdfFiles/${filenumber}.pdf`;
  const { jsPDF } = require("jspdf");
  const momCreationDate = new Date();
  // const viewParentAgendas = await meetingService.viewParentAgendas(
  //   meetingAllData?.meetingDetail?._id,
  //   userId
  // );
  // console.log("viewParentAgendas========================", viewParentAgendas);
  // viewParentAgendas.map((parentAgenda)=>{

  // })
  // const isActionAvailable = viewParentAgendas[0]?.agendas?.filter(
  //   (agenda) => {
  //     if (agenda.minutesDetail) {
  //       const abc = agenda.minutesDetail.filter(
  //         (minute) => minute.isAction === true
  //       );
  //       if (abc.length !== 0) {
  //         return agenda;
  //       }
  //     }
  //   }
  // );


  // console.log("isActionAvailable========================", isActionAvailable);
  const organizationDetails = await Organization.findOne(
    { _id: new ObjectId(meetingAllData?.meetingDetail?.organizationId) },
    { dashboardLogo: 1, loginLogo: 1 }
  );
  const logo = organizationDetails?.dashboardLogo;

  const reportHtml = await ejs.renderFile("./views/pdfData.ejs", {
    meetingData: meetingAllData,
   // parentMeetingAgendaData: viewParentAgendas?.length !== 0 ? viewParentAgendas : [],
    commonHelper,
    logo,
    momCreationDate
  });

  // console.log("isActionAvailable-->", isActionAvailable)
  const playwright = require("playwright");
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.setContent(reportHtml);
  await page.emulateMedia('print');
  await page.pdf({
    margin: {
      bottom: "15mm",
    },
    path: filePath,
    printBackground: true, // Ensure backgrounds are printed
    format: "A4",
    scale: 1.0, // Adjust this if necessary to fit content
    //scale: 0.9,  // Adjust the scale factor to fit content
    displayHeaderFooter: true,
  //  margin: { top: '20mm', bottom: '30mm' }, // Adjust margins to leave space for footer
    footerTemplate: `
      <div style="font-size: 10px; color: gray; width: 100%; text-align: center; padding: 5px 0;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>
    `,
    headerTemplate: '<div></div>', // Empty header if not needed
  });
  await browser.close();
  return filePath;
};

const checkCanUpdateMeeting = async (meetingId, organizationId) => {
  console.log("meetingId=======", meetingId);
  const minuteData = await Minutes.findOne(
    {
      organizationId: new ObjectId(organizationId),
      meetingId: new ObjectId(meetingId),
      isActive: true,
    },
    {
      _id: 1,
    }
  );
  console.log("minuteData----------", minuteData);
  if (!minuteData) {
    return true;
  }
  return false;
};

exports.generateMinutesPdftest = generateMinutesPdftest;

module.exports = {
  acceptRejectMinutes,
  createMinutes,
  downLoadMinutes,
  testPdf,
  createAmendmentRequest,
  updateAmendmentRequest,
  getMeetingListOfAttendees,
  deleteMinute,
  updateMinute,
  acceptMinutes,
  getMomAcceptDetails,
  checkMomWritePermission,
  acceptAllPendingMoms,
  generateMinutesPdftest,
  chaseOfActionService,
  checkCanUpdateMeeting,
};
