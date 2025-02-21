// const { Meeting } = require("../constants/logsConstants");
const Agenda = require("../models/agendaModel");
const Meetings = require("../models/meetingModel");
const ObjectId = require("mongoose").Types.ObjectId;
const logService = require("./logsService");
const minutesService = require("../services/minutesService");
const meetingService = require("../services/meetingService");
const commonHelper = require("../helpers/commonHelper");
const logMessages = require("../constants/logsConstants");
const Config = require("../models/configurationModel");
const { isEmpty } = require("validator");
/**FUNC- TO CREATE AGENDA FOR MEETING**/
const createAgendaForMeeting = async (data, ipAddress) => {
  "data--------------123", data;
  const inputData = data.map((item, index) => {
    item.timeLine = parseFloat(item.timeLine).toFixed(2);
    item.sequence = index + 1;
    return item;
  });
  console.log("inputData-------------->>>>>>>>>>", inputData);
  //ddddddddddddddd
  const newAgenda = await Agenda.insertMany(inputData);
  "newAgenda--------------", newAgenda;

  // const agendaIds = newAgenda.map((item) => {
  //   return item._id;
  // });
  //      (agendaIds);

  ////////////////////LOGER START

  return newAgenda;
};

/**FUNC- TO CREATE AGENDA WITH MINUTE **/
const createAgendaWithMinutes = async (userId, data, ipAddress) => {
  "data--------------123", data;
  const meetingDetails = await meetingService.viewMeeting(
    data.agendaData[0].meetingId,
    userId
  );
  "meetingDetails-------------------------", meetingDetails;
  if (
    meetingDetails?.meetingStatus?.status == "closed" ||
    meetingDetails?.meetingStatus?.status == "draft" ||
    meetingDetails?.meetingStatus?.status == "cancelled"
  ) {
    const configResult = await Config.findOne(
      {
        organizationId: new ObjectId(meetingDetails?.organizationId),
      },
      { writeMinuteMaxTimeInHour: 1, _id: 1 }
    );
    const writeMinuteMaxTimeInMilliSec =
      parseInt(configResult?.writeMinuteMaxTimeInHour) * 3600000;
    const currentDateTime = new Date().getTime();
    "currentDateTime---------", currentDateTime;
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
  }
  const agenda = data.agendaData[0];
  // data.agendaData.map(async (agenda) => {
  const agendaDetails = await Agenda.find(
    { meetingId: new ObjectId(agenda.meetingId), isActive: true },
    { _id: 1, sequence: 1 }
  );
  console.log("agendaDetails===============", agendaDetails)

  const sequence = agendaDetails.length !== 0
    ? agendaDetails[agendaDetails.length - 1].sequence + 1
    : 1;
  console.log("sequence===============", sequence)
  //gggggggg
  const inputData = {
    timeLine: parseFloat(agenda.timeLine).toFixed(2),
    title: agenda.title?.trimStart(),
    topic: agenda.topic,
    meetingId: agenda.meetingId,
    organizationId: agenda.organizationId,
    sequence

  };
  "inputData-------------->>>>>>>>>>", inputData;
  const agendaData = new Agenda(inputData);
  const newAgenda = await agendaData.save(inputData);
  "newAgenda--------------", newAgenda;
  const newUpdatedMeeting = await Meetings.findByIdAndUpdate(
    { _id: new ObjectId(agenda.meetingId) },
    { $push: { agendaIds: newAgenda._id } },

    {
      new: true,
    }
  );
  if (newAgenda) {
    const activityObject = {
      activityDetails: agenda.title + " (agenda)",
      activityTitle: "ADDED",
      meetingId: agenda.meetingId,
    };
    "activityObject-->", activityObject;
    const meetingActivitiesResult =
      await meetingService.createMeetingActivities(activityObject, userId);
    "meetingActivities------------", meetingActivitiesResult;
    const meeting = await Meetings.findOne(
      { _id: new ObjectId(agenda.meetingId) },
      { _id: 1, title: 1, meetingId: 1 }
    );
    const logData = {
      moduleName: logMessages.Agenda.moduleName,
      userId,
      action: logMessages.Agenda.createAgenda,
      ipAddress,
      details: "Agenda Title: <strong>" + agenda.title + "</strong>",
      subDetails: ` Meeting Title: ${meeting.title} (${meeting.meetingId})`,
      organizationId: agenda.organizationId,
    };
    await logService.createLog(logData);
    return true;
  }

  // });

  // const inputData = {
  //   timeLine: parseFloat(data.timeLine).toFixed(2),
  //   title: data.title,
  //   topic: data.topic,
  //   meetingId:data.meetingId,
  //   organizationId:data.organizationId
  // };

  //      ("inputData-------------->>>>>>>>>>", inputData);
  // const agendaData = new Agenda(inputData);
  // const newAgenda = await agendaData.save(inputData);
  //      ("newAgenda--------------", newAgenda);

  // const agendaId = newAgenda._id;
  // const minutesData = data.minutes.map((minute) => {
  //   minute["agendaId"] = agendaId;
  //   return minute;
  // });
  // const newMinutes = await minutesService.createMinutes(
  //   minutesData,
  //   data.meetingId,
  //   userId
  // );

  //      ("newMinutes", newMinutes);

  return false;
};

/**FUNC- TO VIEW ALL AGENDA WITH MINUTES OF SINGLE MEETING DETAILS**/
const viewAgendas = async (meetingId, userId) => {
  let isMinutesAdded = false;
  let isEmptyAgenda = false;
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
        pipeline: [
          {
            $sort: { _id: -1 }, // Sort by _id in descending order
          },
          {
            $group: {
              _id: "$minuteId",
              latestEntry: { $first: "$$ROOT" }, // Get the latest entry for each minuteId
            },
          },
          {
            $replaceRoot: { newRoot: "$latestEntry" }, // Return only the latest entry for each minuteId
          },
          {
            $match: {
              isActive: true,
              // isAction:true
            },
          },
        ],
        as: "minutesDetail",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "minutesDetail.assignedUserId",
        foreignField: "_id",
        as: "assignedUserIdDetails",
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
    // {
    //   $lookup: {
    //     from: "employees",
    //     localField: "organizationId",
    //     foreignField: "organizationId",
    //     as: "employeesDetail",
    //   },
    // },
    {
      $lookup: {
        from: "meetingrooms",
        localField: "meetingDetail.locationDetails.roomId",
        foreignField: "_id",
        as: "roomDetail",
      },
    },
    {
      $lookup: {
        from: "units",
        localField: "roomDetail.unitId",
        foreignField: "_id",
        as: "unitDetail",
      },
    },
    {
      $lookup: {
        from: "momacceptstatuses",
        localField: "meetingDetail._id",
        foreignField: "meetingId",
        as: "momAcceptDetails",
      },
    },
    {
      $lookup: {
        from: "attendances",
        localField: "meetingDetail._id",
        foreignField: "meetingId",
        as: "attendanceDetails",
      },
    },
    {
      $lookup: {
        from: "meetings",
        localField: "meetingDetail.parentMeetingId",
        foreignField: "_id",
        as: "parentMeetingDetails",
      },
    },
    {
      $lookup: {
        from: "hostingdetails",
        localField: "organizationId",
        foreignField: "organizationId",
        as: "meetingHostDetails",
      },
    },

    {
      $project: {
        _id: 1,
        title: 1,
        timeLine: 1,
        topic: 1,
        organizationId: 1,
        meetingId: 1,
        isMOMGenerated: 1,
        sequence: 1,
        meetingDetail: {
          linkType: 1,
          hostDetails: 1,
          isAttendanceAdded: 1,
          parentMeetingId: 1,
          title: 1,
          _id: 1,
          attendees: 1,
          title: 1,
          mode: 1,
          link: 1,
          hostLink: 1,
          date: 1,
          fromTime: 1,
          toTime: 1,
          locationDetails: 1,
          meetingId: 1,
          momGenerationDetails: 1,
          meetingStatus: 1,
          updatedFromTime: 1,
          updatedToTime: 1,
          createdById: 1,
          isRescheduled: 1,
          organizationId:1,
          followOnSerialNo:1
        },
        minutesDetail: {
          _id: 1,
          title: 1,
          parentMinuteId: 1,
          mainDueDate: 1,
          meetingId: 1,
          minuteId: 1,
          agendaId: 1,
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
          status: 1,
          isActive: 1,
          isReopened: 1,
          isApproved: 1,
          sequence: 1,
        },
        assignedUserIdDetails: {
          _id: 1,
          email: 1,
          name: 1,
          designation: 1,
          companyName: 1,
        },
        attendeesDetail: {
          email: 1,
          _id: 1,
          name: 1,
          isEmployee: 1,
          empId: 1,
          companyName: 1,
          designation: 1,
        },
        momAcceptDetails: {
          _id: 1,
          meetingId: 1,
          userId: 1,
          momId: 1,
          status: 1,
        },
        roomDetail: {
          title: 1,
          _id: 1,
          location: 1,
          unitId: 1,
        },
        attendanceDetails: {
          _id: 1,
          attendeeId: 1,
          isAttended: 1,
          fromTime: 1,
          toTime: 1,
          createdById: 1,
          meetingId: 1,
          attendanceType: 1,
          createdAt: 1,
        },
        parentMeetingDetails: {
          _id: 1,
          meetingId: 1,
          title: 1,
        },
        unitDetail: {
          _id: 1,
          name: 1,
        },
        meetingHostDetails: {
          _id: 1,
          organizationId: 1,
          zoomCredentials: 1,
        },
      },
    },
    {
      $unwind: {
        path: "$unitDetail",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$meetingHostDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    // { $unwind: "$roomDetail" }
    //{ $sort: { _id: parseInt(-1) } }
  ];


  const meetingData = await Agenda.aggregate(pipeLine);
  //.sort({_id:-1});
  //.limit(1);
  console.log("meetingData---------3345--", meetingData);

  if (meetingData.length !== 0) {
    const meetingDataObject = {
      agendaDetails: [],
    };
    meetingData.map(async (data) => {
      console.log("======================9999999999", isMinutesAdded);
      if (isMinutesAdded == false) {
        console.log(
          "check==============================>",
          data?.minutesDetail?.filter((minute) => minute.isActive).length
        );
        isMinutesAdded =
          data?.minutesDetail?.filter((minute) => minute.isActive).length !== 0
            ? true
            : false;
      }
      if (isEmptyAgenda == false) {
        console.log(
          "isEmptyAgenda==============================>",
          data?.minutesDetail?.filter((minute) => minute.isActive).length
        );
        isEmptyAgenda =
          data?.minutesDetail?.filter((minute) => minute.isActive).length == 0
            ? true
            : false;
      }
      if (!meetingDataObject.meetingDetail) {
        console.log("data=============>>>>>>>>>>", data);
        data.meetingDetail.attendees.map((item) => {
          //      ("item---------", item);
          const attendeeData = data.attendeesDetail.find(
            (attendee) => attendee._id.toString() == item._id.toString()
          );
          //      ("attendeeData---------", attendeeData);
          item.name = attendeeData.name;
          item.email = attendeeData.email;
          item.isEmployee = attendeeData.isEmployee;
          item.isAttended = item.isAttended;
          item.empId = attendeeData.empId;
          if (attendeeData?.companyName) {
            item.companyName = attendeeData?.companyName;
          }
          if (attendeeData?.designation) {
            item.designation = attendeeData?.designation;
          }

          if (item._id.toString() == userId.toString()) {
            data.meetingDetail["canWriteMOM"] = item.canWriteMOM;
          }

          data.attendanceDetails.map((attendeeItem) => {
            if (attendeeItem.attendeeId.toString() == item._id.toString()) {
              attendeeItem.name = attendeeData.name;
              attendeeItem.email = attendeeData.email;
              attendeeItem.empId = attendeeData.empId;
            }
            return attendeeItem;
          });

          return item;
          // return (item.name = attendeeData.name);
        });
        data.meetingDetail.actualDate = data.meetingDetail.date;
        data.meetingDetail.actualToTime = data.meetingDetail.toTime;
        data.meetingDetail.actualFromTime = data.meetingDetail.fromTime;
        data.meetingDetail.fromTime = commonHelper.formatTimeFormat(
          data.meetingDetail.fromTime
        );
        data.meetingDetail.createdById = data.meetingDetail.createdById;
        data.meetingDetail.toTime = commonHelper.formatTimeFormat(
          data.meetingDetail.toTime
        );
        data.meetingDetail["formatedDate"] = commonHelper.formatDateTimeFormat(
          data.meetingDetail.date
        ).formattedDate;
        meetingDataObject.meetingDetail = data.meetingDetail;

        meetingDataObject.meetingDetail["roomDetail"] = data.roomDetail;

        meetingDataObject.meetingDetail["momAcceptDetails"] =
          data.momAcceptDetails;

        meetingDataObject.meetingDetail["attendanceDetails"] =
          data.attendanceDetails;

        meetingDataObject.meetingDetail["parentMeetingDetails"] =
          data.parentMeetingDetails;
        meetingDataObject.meetingDetail["unitDetail"] = data.unitDetail;
        meetingDataObject.meetingDetail["meetingHostDetails"]=data.meetingHostDetails;


    if (meetingDataObject.meetingDetail?.hostType === "ZOOM") {
      const meetingRecordings = await getRecordingsZoomMeetingForMOM(
        meetingDataObject?._id
      );
      console.log("meetingRecordings========================>>>>>>>>>>>>", meetingRecordings)
      if (meetingRecordings.success) {
        meetingDataObject.meetingDetail["recordings"] = {
          recordingFile: meetingRecordings?.data?.recording_files[0],
          password: meetingRecordings?.data?.password,
          recordingPlayPasscode: meetingRecordings?.data?.recording_play_passcode,
        };
      }
    }

      }
      let acceptRejectStatus = null;
      "data.minutesDetail--------------", data.minutesDetail;
      if (data.minutesDetail.length !== 0) {
        data.minutesDetail.map((minute) => {
          "minute map------------------------", minute;
          const assignedUserDetails = data.assignedUserIdDetails.find(
            (user) => user._id.toString() === minute?.assignedUserId?.toString()
          );
          "assignedUserDetails----------------", assignedUserDetails;
          minute.attendees.map((attendee) => {
            const attendeeData = data.attendeesDetail.find(
              (user) => user._id.toString() === attendee.id.toString()
            );
            "attendeeDeta----------------", attendeeData, userId;
            attendee["email"] = attendeeData?.email;
            attendee["name"] = attendeeData?.name;
            if (attendee?.id.toString() === userId) {
              ("--------------------------------------------------------------");
              acceptRejectStatus = attendee?.status;
            }

            return attendee;
          });

          "--------------------------------------------------------------",
            acceptRejectStatus;
          minute["acceptRejectStatus"] = acceptRejectStatus;
          minute["assignedUserDetails"] = assignedUserDetails;

          minute?.amendmentDetails?.length > 0 &&
            minute.amendmentDetails.map((amendment) => {
              "------1", amendment;
              "------1", data.attendeesDetail;
              const amendmentDetails = data.attendeesDetail.find(
                (attendee) =>
                  attendee._id.toString() == amendment.createdById.toString()
              );
              amendmentDetails;
              amendment["name"] = amendmentDetails.name;
              return amendment;
            });
          return minute;
        });
      }
      data.minutesDetail = data?.minutesDetail.sort(
        (a, b) => a?.sequence - b?.sequence
      );
      delete data.meetingDetail;
      delete data.momAcceptDetails;
      delete data.roomDetail;
      delete data.attendeesDetail;
      delete data.attendanceDetails;
      delete data.assignedUserIdDetails;
      delete data.parentMeetingDetails;
      delete data.unitDetail;
      meetingDataObject.agendaDetails.push(data);
    });
    meetingDataObject.meetingDetail["isMinutesAdded"] = isMinutesAdded;
    meetingDataObject.meetingDetail["isEmptyAgenda"] = isEmptyAgenda;
    meetingDataObject.agendaDetails = meetingDataObject.agendaDetails.sort(
      (a, b) => a?.sequence - b?.sequence
    );
    console.log(meetingDataObject);
    //      ("meetingDataObject", meetingDataObject);
    return meetingDataObject;
  }
  return false;
};

//FUNCTION TO UPDATE AGENDA
const updateAgenda = async (agendaId, agenda, userId, ipAddress) => {
  "data-----------", agenda;
  "userId---------------", userId;
  "agendaId-------------", agendaId;

  const meetingDetails = await meetingService.viewMeeting(
    agenda?.meetingId,
    userId
  );
  "meetingDetails-------------------------", meetingDetails;
  if (
    meetingDetails?.meetingStatus?.status == "closed" ||
    meetingDetails?.meetingStatus?.status == "draft" ||
    meetingDetails?.meetingStatus?.status == "cancelled"
  ) {
    const configResult = await Config.findOne(
      {
        organizationId: new ObjectId(meetingDetails?.organizationId),
      },
      { writeMinuteMaxTimeInHour: 1, _id: 1 }
    );
    const writeMinuteMaxTimeInMilliSec =
      parseInt(configResult?.writeMinuteMaxTimeInHour) * 3600000;
    const currentDateTime = new Date().getTime();
    "currentDateTime---------", currentDateTime;
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
  }

  const inputData = {
    timeLine: parseFloat(agenda.timeLine).toFixed(2),
    title: agenda.title,
    topic: agenda.topic,
    meetingId: agenda.meetingId,
    organizationId: agenda.organizationId,
  };
  "inputData-------------->>>>>>>>>>", inputData;
  const result = await Agenda.findOneAndUpdate(
    {
      _id: new ObjectId(agendaId),
    },
    {
      $set: inputData,
    },
    {
      new: false,
    }
  );

  "RESULT DATA", result;
  if (result) {
    const meeting = await Meetings.findOne(
      { _id: new ObjectId(result.meetingId) },
      { _id: 1, title: 1, meetingId: 1 }
    );
    const activityObject = {
      activityDetails: agenda.title + " (agenda)",
      activityTitle: "EDITED",
      meetingId: agenda?.meetingId,
    };
    "activityObject-->", activityObject;
    const meetingActivitiesResult =
      await meetingService.createMeetingActivities(activityObject, userId);
    "meetingActivities------------", meetingActivitiesResult;

    let logDetails = await commonHelper.generateAgendaLogObject(
      result,
      userId,
      agenda
    );

    "logDetails------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>--",
      logDetails;

    if (logDetails.length !== 0) {
      const logData = {
        moduleName: logMessages.Agenda.moduleName,
        userId,
        action: logMessages.Agenda.updateAgenda,
        ipAddress,
        details: logDetails.join(" , "),
        subDetails: ` Meeting Title: ${meeting.title} (${meeting.meetingId})`,
        organizationId: result.organizationId,
      };
      await logService.createLog(logData);
    }
  }
  return result;
};

//FUNCTION TO UPDATE AGENDA
const deleteAgenda = async (agendaId, data, userId, ipAddress) => {
  "data-----------", data;
  "userId---------------", userId;
  "agendaId-------------", agendaId;

  const agendaData = await Agenda.findOne(
    { _id: new ObjectId(agendaId), isActive: true },
    { meetingId: 1 }
  );
  "agendaData--------------", agendaData;

  const meetingDetails = await meetingService.viewMeeting(
    agendaData?.meetingId,
    userId
  );
  "meetingDetails-------------------------", meetingDetails;
  if (
    meetingDetails?.meetingStatus?.status == "closed" ||
    meetingDetails?.meetingStatus?.status == "draft" ||
    meetingDetails?.meetingStatus?.status == "cancelled"
  ) {
    const configResult = await Config.findOne(
      {
        organizationId: new ObjectId(meetingDetails?.organizationId),
      },
      { writeMinuteMaxTimeInHour: 1, _id: 1 }
    );
    const writeMinuteMaxTimeInMilliSec =
      parseInt(configResult?.writeMinuteMaxTimeInHour) * 3600000;
    const currentDateTime = new Date().getTime();
    "currentDateTime---------", currentDateTime;
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
  }

  if (agendaData) {
    const agendas = await Agenda.find(
      { meetingId: new ObjectId(agendaData.meetingId), isActive: true },
      { _id: 1 }
    );
    if (agendas?.length > 1) {
      const result = await Agenda.findOneAndUpdate(
        {
          _id: new ObjectId(agendaId),
        },
        {
          $set: { isActive: false },
        },
        {
          new: true,
        }
      );

      "RESULT DATA", result;
      if (result) {
        //   const activityObject = {
        //     activityDetails: data.status,
        //     activityTitle:
        //       data.status == "ACCEPTED" ? "Minute accepted" : "Minute Rejected",
        //     meetingId: data.meetingId,
        //     // userId,
        //   };
        //        ("activityObject-->", activityObject);
        //   const meetingActivitiesResult =
        //     await meetingService.createMeetingActivities(activityObject, userId);
        //        ("meetingActivities------------", meetingActivitiesResult);
        // }

        const activityObject = {
          activityDetails: result?.title + " (agenda)",
          activityTitle: "DELETED",
          meetingId: result?.meetingId,
        };
        "activityObject-->", activityObject;
        const meetingActivitiesResult =
          await meetingService.createMeetingActivities(activityObject, userId);
        "meetingActivities------------", meetingActivitiesResult;

        const meeting = await Meetings.findOne(
          { _id: new ObjectId(result.meetingId) },
          { _id: 1, title: 1, meetingId: 1 }
        );
        const logData = {
          moduleName: logMessages.Agenda.moduleName,
          userId,
          action: logMessages.Agenda.deleteAgenda,
          ipAddress,
          details: "Agenda Title: <strong>" + result.title + "</strong>",
          subDetails: ` Meeting Title: ${meeting.title} (${meeting.meetingId})`,
          organizationId: result.organizationId,
        };
        await logService.createLog(logData);
      }
      return result;
    } else {
      return {
        isDeleteNotAllowed: true,
      };
    }
  }
  return;
};
exports.viewAgendas2 = viewAgendas;
module.exports = {
  createAgendaForMeeting,
  viewAgendas,
  createAgendaWithMinutes,
  updateAgenda,
  deleteAgenda,
};
