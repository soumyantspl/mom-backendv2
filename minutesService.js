const Minutes = require("../models/minutesModel");
const Agenda = require("../models/agendaModel");
const MomAcceptStatus = require("../models/momAcceptStatusModel");
const agendaService = require("../services/agendaService");
const employeeService = require("./employeeService");
const notificationService = require("./notificationService");
const Rooms = require("../models/roomModel");
let ejs = require("ejs");
const puppeteer = require("puppeteer");
const pdfTemplates = require("../templates/pdfTemplate");
//const { getAllAttendees } = require("./meetingService");
//const { createMeetingActivities } = require("./meetingService");
const fileService = require("./fileService");
const Meetings = require("../models/meetingModel");
const ObjectId = require("mongoose").Types.ObjectId;
const emailTemplates = require("../emailSetUp/emailTemplates");
const meetingService = require("../services/meetingService");
const emailConstants = require("../constants/emailConstants");
const emailService = require("./emailService");
const commonHelper = require("../helpers/commonHelper");
//FUNCTION TO ACCEPT OR REJECT MINUTES
const acceptRejectMinutes = async (data, minuteId, userId) => {
  console.log("data-----------", data);
  console.log("userId---------------", userId);
  console.log("minuteid-------------", minuteId);

  const result = await Minutes.findOneAndUpdate(
    {
      "attendees.id": new ObjectId(userId),
      _id: new ObjectId(minuteId),
    },
    {
      $set: { "attendees.$.status": data.status },
    }
  );

  console.log("RESULT DATA", result);
  if (result) {
    // const activityObject = {
    //   activityDetails: data.status,
    //   activityTitle:
    //     data.status == "ACCEPTED" ? "Minute accepted" : "Minute Rejected",
    //   meetingId: data.meetingId,
    //   // userId,
    // };
    const activityObject = {
      activityDetails: result.description,
      activityTitle: data.status == "ACCEPTED" ? "Accepted" : "Rejected",
      meetingId: data.meetingId,
    };
    console.log("activityObject-->", activityObject);
    const meetingActivitiesResult =
      await meetingService.createMeetingActivities(activityObject, userId);
    console.log("meetingActivities------------", meetingActivitiesResult);
  }
  return result;
};

//FUNCTION RO CREATE MINUTES

const createMinutes = async (minutes, meetingId, userId) => {
  console.log(minutes);
  const meetingDetails = await meetingService.viewMeeting(meetingId, userId);
  console.log("meetingDetails-------------------------", meetingDetails);
  minutes.map(async (data) => {
    console.log("44444", data, userId);
    if (data.isNewUser) {
      const empData = await employeeService.createAttendee(
        data.name,
        data.email,
        data.organizationId
      );
      if (empData.isDuplicate) {
        //return empData;
        data["assignedUserId"] = empData.duplicateUserId;
      } else {
        data["assignedUserId"] = new ObjectId(empData._id);
      }
    }
    data["isActive"] = true;
    data["createdById"] = new ObjectId(userId);
    data["priority"] = data.priority ? data.priority : "LOW";
    data["dueDate"] = data.dueDate
      ? new Date(data.dueDate)
      : new Date(meetingDetails?.date);
    data["assignedUserId"] = data.assignedUserId
      ? data.assignedUserId
      : new ObjectId(userId);
    console.log("inside data-------------------------", data);
    const minuteData = new Minutes(data);
    const newMinutes = await minuteData.save();

    console.log("createdBy---", newMinutes.description);
    const activityObject = {
      activityDetails: newMinutes.description,
      activityTitle: "CREATED",
      meetingId: data.meetingId,
    };
    console.log("activityObject-->", activityObject);
    const meetingActivitiesResult =
      await meetingService.createMeetingActivities(activityObject, userId);
    console.log("meetingActivities------------", meetingActivitiesResult);
  });

  // if (meetingDetails?.attendees?.length !== 0) {
  //   meetingDetails.attendees.map(async (attendee) => {
  //     //  console.log("attendeesEmails-------------------------", attendeesEmails);

  //     const logo =
  //       "https://d3uom8aq23ax4d.cloudfront.net/wp-content/themes/ntspl-corporate-website/images/ntspl_logo.png";
  //     const mailData = await emailTemplates.sendCreateMinutesEmailTemplate(
  //       meetingDetails,
  //       attendee.name,
  //       logo
  //     );
  //     //const mailData = await emailTemplates.signInByOtpEmail(userData, data.otp);
  //     const emailSubject = await emailConstants.createMinuteSubject(
  //       meetingDetails
  //     );
  //     console.log(
  //       "sendOtpEmailTemplate-----------------------maildata",
  //       mailData
  //     );
  //     console.log(
  //       "sendOtpEmailTemplate-----------------------emailSubject",
  //       emailSubject
  //     );
  //     await emailService.sendEmail(
  //       attendee.email,
  //       "Create Meeting Minutes",
  //       emailSubject,
  //       mailData
  //     );
  //   });
  // }

  return true;
  //
  // const attendeesData = await getAllAttendees(data.meetingId);
  // const attendeeArr = JSON.stringify(attendeesData.attendees);
  // console.log("Required data-->>", attendeeArr);
  // const attendeeResult = JSON.parse(attendeeArr).map((item) => {
  //   console.log("---------------", item);
  //   item["status"] = "PENDING";
  //   return item;
  // });
  //  console.log("attendeeResult-->", attendeeResult);
  // const inputData = {
  //   createdById: userId,
  //   organizationId: data.organizationId,
  //   meetingId: data.meetingId,
  //   description: data.description,
  //   dueDate: data.dueDate,
  //   priority: data.priority,
  //   assignedUserId: data.assignedUserId,
  //   isAction: data.isAction,
  //   attendees: attendeeResult,
  // };

  //   return {
  //     data: newMinutes,
  //   };
};

//FUNCTION TO DOWNLOAD MINUTES
const downLoadMinutes1 = async (meetingId) => {
  const minutesData = await Minutes.aggregate([
    {
      $match: {
        meetingId: new ObjectId(meetingId),
        //  isAction:false,
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
        // mode: 1,
        // link: 1,
        // date: 1,
        // fromTime: 1,
        // toTime: 1,
        // locationDetails: 1,
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
          // details:1,
          // status:1
        },
        assignedUserDetail: {
          name: 1,
          // details:1,
          // status:1
        },
        reAssignedUserDetail: {
          name: 1,
          // details:1,
          // status:1
        },
      },
    },
    { $unwind: "$organizationDetail" },
    { $unwind: "$createdByDetails" },
    { $unwind: "$amendmentDetail" },
    { $unwind: "$assignedUserDetail" },
    { $unwind: "$reAssignedUserDetail" },
  ]);
  console.log("minutesData--------------", minutesData);

  // attendees: [
  //   {
  //     id: {
  //       type: mongoose.Schema.ObjectId,
  //       required: true,
  //     },
  //     status: {
  //       type: String,
  //       enum: ["ACCEPTED", "REJECT", "PENDING"],
  //       required: true,
  //     },
  //   },
  // ],
  let pendingUsers = [];
  let rejectedBy = [];
  let acceptedBy = [];
  const newData = minutesData.map((item, index) => {
    console.log("attendeesDetails---------------", item.attendeesDetails);
    item.attendeesDetails.map((attendee) => {
      console.log("item.attendees--------", item.attendees);
      console.log("attendees--------", attendee);
      const currentAttendee = item.attendees.find(
        (i) => i.id.toString() == attendee._id
      );

      console.log("currentAttendee--------", currentAttendee);
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
      console.log("actionData---------------", actionData);
      minutesData[index]["actionData"] = actionData;
      return item;
    });
  });
  console.log(rejectedBy);
  console.log("newData--------------------", minutesData[0].actionData);
  return await fileService.generatePdf(minutesData);
};

//FUNCTION TO DOWNLOAD MINUTES
const downLoadMinutes2 = async (meetingId, userId) => {
  console.log("meetingId", meetingId);
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
    // {
    //   $lookup: {
    //     from: "employees",
    //     localField: "createdById",
    //     foreignField: "_id",
    //     as: "createdByDetails",
    //   },
    // },
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
          // email: 1,
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

        // locationDetails: {
        //   location: 1,
        // },
      },
    },
    //  { $unwind: "$assignedUserDetail" },
  ];
  const meetingData = await Agenda.aggregate(pipeLine);
  ///.limit(1);
  console.log("meetingData-------------", meetingData);

  if (meetingData.length !== 0) {
    if (meetingData[0].meetingDetail.locationDetails.roomId) {
      console.log(
        "meetingData[0]--------------",
        meetingData[0].meetingDetail.locationDetails.roomId
      );
      const roomId =
        meetingData[0].meetingDetail.locationDetails.roomId.toString();
      console.log("roomId", roomId);
      var roomsData = await Rooms.findById(roomId, {
        _id: 1,
        title: 1,
        location: 1,
      });
      console.log("roomsData-----------", roomsData);
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
    console.log("meetingDataObject---------------------", meetingDataObject);

    meetingDataObject.agendaDetails.map((item) => {
      item.minutesDetail.map((minutesItem) => {
        const assignedUserDetails = item.assignedUserDetail.find(
          (i) => i._id.toString() == minutesItem.assignedUserId
        );

        const reAssignedUserDetails = item.reAssignedUserDetail.find(
          (i) => i._id.toString() == minutesItem.reassignedUserId
        );

        console.log("assignedUserDetails--------", assignedUserDetails);
        console.log("reAssignedUserDetails--------", reAssignedUserDetails);
        minutesItem.reassignedUserName = reAssignedUserDetails?.name;

        minutesItem.assignedUserName = assignedUserDetails?.name;

        return minutesItem;
      });
    });

    // const newData = minutesData.map((item, index) => {
    //   console.log("attendeesDetails---------------", item.attendeesDetails);
    //   item.attendeesDetails.map((attendee) => {
    //     console.log("item.attendees--------", item.attendees);
    //     console.log("attendees--------", attendee);
    //     const currentAttendee = item.attendees.find(
    //       (i) => i.id.toString() == attendee._id
    //     );

    //     console.log("currentAttendee--------", currentAttendee);
    //     if (currentAttendee.status == "ACCEPTED") {
    //       acceptedBy.push(attendee.name);
    //     }
    //     if (currentAttendee.status == "REJECTED") {
    //       rejectedBy.push(attendee.name);
    //     }
    //     if (currentAttendee.status == "PENDING") {
    //       pendingUsers.push(attendee.name);
    //     }
    //     const actionData = {
    //       pendingUsers,
    //       rejectedBy,
    //       acceptedBy,
    //     };
    //     console.log("actionData---------------", actionData);
    //     minutesData[index]["actionData"] = actionData;
    //     return item;
    //   });
    // });

    meetingDataObject.agendaDetails.map((mainItem) => {
      console.log("--------7777777777777777777777---------", mainItem);
      mainItem.minutesDetail.map((minuteItem) => {
        console.log("--------88888888888888---------", minuteItem);

        let pendingUsers = [];
        let rejectedBy = [];
        let acceptedBy = [];
        //  minuteItem.attendees?.map((attendeeItem)=>{

        // console.log('--------attendeeItem---------',attendeeItem)

        // const currentAttendee = meetingDataObject.meetingDetail.attendeesDetails?.find(
        //   (i) => i._id.toString() == attendeeItem.id.toString()
        // );

        meetingDataObject.meetingDetail.attendeesDetails.map((attendeeItem) => {
          const currentAttendee = minuteItem.attendees?.find(
            (i) => i.id.toString() == attendeeItem._id.toString()
          );

          console.log("currentAttendee--------", currentAttendee);
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
          console.log("actionData---------------", actionData);
          minuteItem["actionData"] = actionData;
          return minuteItem;

          //   console.log('--------attendeeItem---------',attendeeItem)
          //   console.log("meetingData-----------4444444",meetingDataObject.meetingDetail.attendeesDetails)
          //   const currentAttendee = meetingDataObject.meetingDetail.attendeesDetails       attendeeItem.find(
          //           (i) => i._id.toString() == attendeeItem.id.toString()
          //         );
          //         console.log('--------99999999999999---------',currentAttendee)
        });
      });
    });
    console.log(
      "meetingDataObject.agendaDetails--------------------------------------@@@@@@@",
      meetingDataObject.agendaDetails[0].minutesDetail
    );

    return await fileService.generateMinutesPdf(meetingDataObject);

    // return meetingDataObject;
  }

  return false;
};

const downLoadMinutes = async (meetingId, userId) => {
  return await generateMinutesPdftest(meetingId, userId);
};
const testPdf = async () => {
  return await fileService.generateMinutesPdf();
  // return meetingDataObject;
};

//FUNCTION TO ACCEPT OR REJECT MINUTES
const createAmendmentRequest = async (data, minuteId, userId) => {
  console.log("data-----------", data);
  console.log("userId---------------", userId);
  console.log("minuteid-------------", minuteId);
  const amendmentDetail = {
    createdById: new ObjectId(userId),
    details: data.details,
    status: "PENDING",
  };
  console.log(amendmentDetail);
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

  console.log("RESULT DATA", result);
  if (result) {
    const activityObject = {
      activityDetails: data.details,
      activityTitle: "AMENDMENT CREATED",
      meetingId: result.meetingId,
      // userId,
    };
    console.log("activityObject-->", activityObject);
    const meetingActivitiesResult =
      await meetingService.createMeetingActivities(activityObject, userId);
    console.log("meetingActivities------------", meetingActivitiesResult);

    const meetingDetails = await meetingService.viewMeeting(
      result.meetingId,
      userId
    );

    if (meetingDetails) {
      console.log("userId------------------------", userId);
      console.log(
        "meetingDetails.attendees---------------------",
        meetingDetails.attendees
      );
      const attendeeDetails = meetingDetails.attendees.find(
        (item) => item._id.toString() === userId.toString()
      );
      console.log("attendeeDetails", attendeeDetails);
      const logo = process.env.LOGO;

      const mailData = await emailTemplates.sendAmendmentCreatedEmailTemplate(
        meetingDetails,
        attendeeDetails,
        logo
      );
      //const mailData = await emailTemplates.signInByOtpEmail(userData, data.otp);
      const emailSubject = await emailConstants.sendAmendmentCreatedSubject(
        meetingDetails
      );
      console.log(
        "sendAmendmentCreatedEmailTemplate-----------------------maildata",
        mailData
      );
      console.log(
        "sendAmendmentCreatedEmailTemplate-----------------------emailSubject",
        emailSubject
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
        // actionId,
      };

      console.log("result----&&&>>>", result);

      const addNotification = await notificationService.createNotification(
        notificationData
      );
    }
  }

  return result;
};

//FUNCTION TO ACCEPT OR REJECT MINUTES
const updateAmendmentRequest = async (data, minuteId, userId) => {
  console.log("data-----------", data);
  console.log("userId---------------", userId);
  console.log("minuteid-------------", minuteId);

  const result = await Minutes.findOneAndUpdate(
    {
      "amendmentDetails.createdById": new ObjectId(data.createdById),
      _id: new ObjectId(minuteId),
    },

    {
      $set: { "amendmentDetails.$.status": data.status },
    }
  );

  console.log("RESULT DATA", result);
  // if (result) {
  //   const activityObject = {
  //     activityDetails: data.status,
  //     activityTitle:
  //       data.status == "ACCEPTED" ? "Minute accepted" : "Minute Rejected",
  //     meetingId: data.meetingId,
  //     // userId,
  //   };
  //   console.log("activityObject-->", activityObject);
  //   const meetingActivitiesResult =
  //     await meetingService.createMeetingActivities(activityObject, userId);
  //   console.log("meetingActivities------------", meetingActivitiesResult);
  // }

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
    // actionId,
  };

  console.log("result----&&&>>>", result);

  const addNotification = await notificationService.createNotification(
    notificationData
  );

  return result;
};

//FUNCTION TO GET ONLY MEETING LIST OF ATTENDEES
const getMeetingListOfAttendees = async (organizationId, userId) => {
  console.log(organizationId);
  console.log(userId);
  const pipeLine = [
    {
      $match: {
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
        from: "employees",
        localField: "createdById",
        foreignField: "_id",
        as: "createdByDetails",
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
      },
    },

    { $unwind: "$meetingDetail" },
    { $unwind: "$createdByDetails" },
  ];

  const result = await Minutes.aggregate(pipeLine);
  console.log("result-----------------------------77-", result);
  const meetingDetail = [];
  const ownerDetails = [];
  const finalResult = result.map((item) => {
    if (meetingDetail.length !== 0) {
      const checkMeeting = meetingDetail.find(
        (meeting) =>
          meeting._id.toString() === item.meetingDetail._id.toString()
      );
      console.log("checkMeeting", checkMeeting);
      if (!checkMeeting) {
        meetingDetail.push(item.meetingDetail);
      }
    } else {
      meetingDetail.push(item.meetingDetail);
    }

    if (ownerDetails.length !== 0) {
      const checkOwner = ownerDetails.find(
        (owner) => owner._id.toString() === item.createdByDetails._id.toString()
      );
      console.log("checkOwner", checkOwner);
      if (!checkOwner) {
        ownerDetails.push(item.createdByDetails);
      }
    } else {
      ownerDetails.push(item.createdByDetails);
    }
  });
  console.log("finalResult-----------------------------78-", finalResult);
  return {
    ownerDetails,
    meetingDetail,
  };
};

//FUNCTION TO ACCEPT OR REJECT MINUTES
const updateMinute = async (data, minuteId, userId) => {
  console.log("data-----------", data);
  console.log("userId---------------", userId);
  console.log("minuteid-------------", minuteId);
  if (data.isAction == false) {
    data.dueDate = null;
    data.assignedUserId = null;
    data.priority = null;
  }

  if (data.isNewUser) {
    const empData = await employeeService.createAttendee(
      data.name,
      data.email,
      data.organizationId
    );
    if (empData.isDuplicate) {
      //return empData;
      data["assignedUserId"] = empData.duplicateUserId;
    } else {
      data["assignedUserId"] = new ObjectId(empData._id);
    }
  }

  data["assignedUserId"] = data.assignedUserId
    ? data.assignedUserId
    : new ObjectId(userId);

  const result = await Minutes.findByIdAndUpdate(
    { _id: new ObjectId(minuteId) },
    data,
    {
      new: true,
    }
  );
  console.log("RESULT DATA", result);
  if (result) {
    // const activityObject = {
    //   activityDetails: "MINUTE UPDATED",
    //   activityTitle: "MINUTE UPDATED",
    //   meetingId: data.meetingId,
    //   userId,
    // };
    const activityObject = {
      activityDetails: result.description,
      activityTitle: "Updated",
      userId,
      meetingId: data.meetingId,
    };
    console.log("activityObject-->", activityObject);
    const meetingActivitiesResult =
      await meetingService.createMeetingActivities(activityObject, userId);
    console.log("meetingActivities------------", meetingActivitiesResult);
  }
  return result;
};

//FUNCTION TO DELETE MINUTES
const deleteMinute = async (meetingId, minuteId, userId) => {
  console.log("userId---------------", userId);
  console.log("minuteid-------------", minuteId);

  const result = await Minutes.findOneAndUpdate(
    {
      _id: new ObjectId(minuteId),
    },
    {
      $set: { isActive: false },
    }
  );

  console.log("RESULT DATA", result);
  if (result) {
    // const activityObject = {
    //   activityDetails: "DELETED",
    //   activityTitle: "MINUTE DELETED",
    //   meetingId: meetingId,
    //   // userId,
    // };
    const activityObject = {
      activityDetails: result.description,
      activityTitle: "Deleted",
      userId,
      meetingId: meetingId,
    };
    console.log("activityObject-->", activityObject);
    const meetingActivitiesResult =
      await meetingService.createMeetingActivities(activityObject, userId);
    console.log("meetingActivities------------", meetingActivitiesResult);
  }
  return result;
};

//FUNCTION TO ACCEPT MINUTES
const acceptMinutes = async (data, meetingId, userId,ipAddress) => {
  //Meetings
  console.log("userId---------------", userId, meetingId, data);
  // console.log("minuteid-------------", minuteId);

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
  console.log("result-------------", result);
  const getUpdatedResult = await Minutes.find(
    {
      meetingId: new ObjectId(meetingId),
      isActive: true,
      "attendees.id": new ObjectId(userId),
    },
    { createdById: 1 }
  );
  console.log("getUpdatedResult--------------------", getUpdatedResult);
  const inputData = {
    userId,
    meetingId,
    momId: data.momId,
  };
  const minuteData = new MomAcceptStatus(inputData);
  const acceptDetails = await minuteData.save();
  console.log("acceptDetails-------------", acceptDetails);
  // await Meetings.findOneAndUpdate(
  //   {
  //     _id: new ObjectId(meetingId),
  //     isActive: true,
  //   },
  //   {
  //     $set: { isMinutesAccepted: true },
  //   }
  // );

  // console.log("RESULT DATA", result);
  if (acceptDetails) {
    const activityObject = {
      activityDetails: "ALL MINUTES",
      activityTitle: "ACCEPTED",
      meetingId: meetingId,
      // userId,
    };

    console.log("activityObject-->", activityObject);
    const meetingActivitiesResult =
      await meetingService.createMeetingActivities(activityObject, userId);
    console.log("meetingActivities------------", meetingActivitiesResult);
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
      // actionId,
    };

    console.log("result----&&&>>>", result);

    const addNotification = await notificationService.createNotification(
      notificationData
    );

    console.log("userId------------------------", userId);
    console.log(
      "meetingDetails.attendees---------------------",
      meetingDetails.attendees
    );

    const attendeeDetails = meetingDetails.attendees.find(
      (item) => item._id.toString() === userId.toString()
    );
    console.log("attendeeDetails", attendeeDetails);

    const logo = process.env.LOGO;

    const mailData = await emailTemplates.acceptMinuteEmailTemplate(
      meetingDetails,
      attendeeDetails,
      logo
    );
    //const mailData = await emailTemplates.signInByOtpEmail(userData, data.otp);
    const emailSubject = await emailConstants.acceptMinuteSubject(
      meetingDetails
    );
    console.log(
      "acceptMinuteEmailTemplate-----------------------maildata",
      mailData
    );
    console.log(
      "acceptMinuteEmailTemplate-----------------------emailSubject",
      emailSubject
    );
    emailService.sendEmail(
      meetingDetails?.createdByDetail?.email,
      "Create Minutes Amendment",
      emailSubject,
      mailData
    );
  }

  return acceptDetails;
};
//FUNCTION TO CHECK MOM WRITE PERMISSION
const checkMomWritePermission = async (meetingId, userId) => {
  console.log("userId---------------", userId);
  console.log("meetingId-------------", meetingId);

  const checkMomWritePermission = await Meetings.findOne(
    {
      _id: new ObjectId(meetingId),
      isActive: true,

      // $and: [
      //   {  "attendees._id": new ObjectId(userId) },
      //   { "attendees.canWriteMOM":true },
      // ],
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
  console.log(
    "checkMomWritePermission-----------------------------",
    checkMomWritePermission
  );
  if (checkMomWritePermission) {
    return true;
  }
  return false;
};

const configService = require("../services/configService");
const Config = require("../models/configurationModel");

//FUNCTION TO ACCEPT MINUTES BY CRON
const acceptAllPendingMoms = async () => {
  //GET TIME FROM CONFIGURATION
  const configTimeDetails = await Config.find(
    { isActive: true },
    { acceptanceRejectionEndtime: 1, _id: 1, organizationId: 1 }
  );
  console.log("configTimeDetails", configTimeDetails);
  if (configTimeDetails?.length !== 0) {
    configTimeDetails.map(async (data) => {
      const meetingDataArray = await Meetings.find(
        {
          organizationId: new ObjectId(data.organizationId),
          isActive: true,
          momGenerationDetails: { $exists: true, $not: { $size: 0 } },
        },
        { _id: 1, attendees: 1, momGenerationDetails: 1, date: 1, fromTime: 1 }
      );
      console.log(
        "meetingDataArray-----------",
        meetingDataArray.length,
        data.organizationId
      );

      if (meetingDataArray?.length !== 0) {
        meetingDataArray.map(async (meeting) => {
          console.log("meeting------------------", meeting);
          const meetingDateTime = combineDateAndTime(
            meeting.date,
            meeting.fromTime
          ).getTime();
          console.log(
            "meeting date----------------",
            combineDateAndTime(meeting.date, meeting.fromTime)
          );
          console.log("meetingDateTime -----------", meetingDateTime);
          console.log("current date---------", new Date());
          const currentDateTime = new Date().getTime();
          console.log("currentDateTime-----------------", currentDateTime);
          const diffTime = data.acceptanceRejectionEndtime * 60 * 60 * 1000;
          const diff = meetingDateTime - currentDateTime;
          console.log("diffTime----------------------------------", diffTime);
          console.log("diff----------------------------------", diff);
          console.log(
            "target time --------------------",
            currentDateTime + diffTime
          );
          if (diffTime >= diff && diff >= 0) {
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
                  console.log("acceptDetails-------------", acceptDetails);
                }
              });
            }
          } else {
            console.log("not counted");
          }
        });
      }
    });
  }
};

//FUNCTION TO ACCEPT MINUTES BY CRON
const chaseOfActionService = async () => {
  //GET TIME FROM CONFIGURATION
  const configTimeDetails = await Config.find(
    { isActive: true },
    { chaseOfAction: 1, _id: 1, organizationId: 1 }
  );
  console.log("configTimeDetails", configTimeDetails);
  if (configTimeDetails?.length !== 0) {
    configTimeDetails.map(async (data) => {
      const minuteDataArray = await Minutes.find(
        {
          organizationId: new ObjectId(data.organizationId),
          isActive: true,
        },
        { _id: 1, attendees: 1, dueDate: 1, assignedUserId: 1 }
      );
      console.log(
        "minuteDataArray-----------",
        minuteDataArray.length,
        data.organizationId
      );

      if (minuteDataArray?.length !== 0) {
        minuteDataArray.map(async (minute) => {
          console.log("minute------------------", minute);
          const minuteDuteDate = new Date(minute.dueDate);

          console.log("minuteDuteDate -----------", minuteDuteDate);
          console.log("current date---------", new Date());
          const currentDate = new Date();
          console.log("currentDateTime-----------------", currentDateTime);
          const diffTime = data.chaseOfAction;
          const diff = minuteDuteDate - currentDate;
          console.log("diffTime----------------------------------", diffTime);
          console.log("diff----------------------------------", diff);
          console.log(
            "target time --------------------",
            currentDateTime + diffTime
          );
          if (diffTime == diff) {
            const assignedUserDetail = await Employee.findOne(
              { _id: new ObjectId(minute.assignedUserId) },
              { _id: 1, email: 1, name: 1 }
            );
            console.log(
              "assignedUserDetail-----------------",
              assignedUserDetail
            );
            const logo = process.env.LOGO;
            const mailData =
              await emailTemplates.sendActionDueReminderEmailTemplate(
                minute,
                assignedUserDetail,
                logo
              );
            const emailSubject = await emailConstants.actionDueReminderSubject(
              minute
            );
            console.log(
              "sendActionDueReminderEmailTemplate-----------------------maildata",
              mailData
            );
            console.log(
              "sendActionDueReminderEmailTemplate-----------------------emailSubject",
              emailSubject
            );
            emailService.sendEmail(
              assignedUserDetail?.email,
              "Chase Action Due",
              emailSubject,
              mailData
            );
          }
        });
      } else {
        console.log("not counted");
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

  console.log("result-----momAcceptDetails", result);
  return result;
};

const generateMinutesPdftest = async (meetingId, userId) => {
  console.log("testing--------------");

  const headerTemplate =
    '<span style="font-size: 30px; width: 200px; height: 200px; background-color: black; color: white; ">Header 1</span>';
  const footerTemplate =
    '<span style="font-size: 30px; width: 50px; height: 50px; background-color: red; color:black;">Footer</span>';
  const path = require("path");
  const meetingAllData = await agendaService.viewAgendas2(meetingId, userId);
  const filenumber = Math.floor(Math.random() * 100000000000 + 1);
  const filePath = `pdfFiles/${filenumber}.pdf`;
  // const momCreationDate = new Date(
  //   meetingAllData?.meetingDetail?.momGenerationDetails[
  //     meetingAllData?.meetingDetail?.momGenerationDetails.length - 1
  //   ].createdAt
  // );
  let pdf = require("html-pdf");
  const momCreationDate = new Date();
  const htmlContent = "Hello World. This is custom HTML content.";
  console.log("meetingAllData----------------", momCreationDate);
  //render the ejs file
  const reportHtml = await ejs.renderFile("./views/pdfData.ejs", {
    meetingData: meetingAllData,
    commonHelper,
    logo: process.env.logo,
    momCreationDate,
  });
   //const browser = await puppeteer.launch({ headless: "new" });
 // const browser = await puppeteer.launch({ignoreDefaultArgs: ['--disable-extensions']});
  // const browser = await puppeteer.launch({
  //   executablePath: '/usr/bin/chromium-browser'
  // })
  const browser = await puppeteer.launch({
    headless:false,
    args: ["--no-sandbox"]
});
  const page = await browser.newPage();

  await page.setContent(reportHtml);

  // Generate PDF for the report
  await page.pdf({
    path: filePath,
    format: "A4",
    preferCSSPageSize: true,
    // displayHeaderFooter: true,
    // headerTemplate: headerTemplate,
    // footerTemplate: footerTemplate,
    // margin: { top: 100, bottom: 60 }
    //   margin: {
    //     top: "0px",
    //     right: "0px",
    //     bottom: "0px",
    //     left: "0px"
    // },
  });

  await browser.close();
  return filePath;
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
};
