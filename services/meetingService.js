const Meeting = require("../models/meetingModel");
const Agenda = require("../models/agendaModel");
const meetingStreamingService = require("../services/meetingStreamingService");
const MeetingActivities = require("../models/meetingActivitiesModel");
const meetingHostDetails = require("../models/meetingHostDetails");
const Attendace = require("../models/attendanceModel");
const HostingDetails = require("../models/hostingDetailsModel");
const Organization = require("../models/organizationModel");
const meetingService = require("../services/meetingService");
const agendaService = require("./agendaService");
const logService = require("./logsService");
const logMessages = require("../constants/logsConstants");
const ObjectId = require("mongoose").Types.ObjectId;
const emailTemplates = require("../emailSetUp/dynamicEmailTemplate");
const emailService = require("./emailService");
// const emailTemplates = require("../emailSetUp/emailTemplates");
const emailConstants = require("../constants/emailConstants");
const commonHelper = require("../helpers/commonHelper");
const employeeService = require("./employeeService");
const Minute = require("../models/minutesModel");
const minutesService = require("../services/minutesService");
const Config = require("../models/configurationModel");
const Meetings = require("../models/meetingModel");
const Employee = require("../models/employeeModel");
const notificationService = require("./notificationService");
const axios = require("axios");
const JSZip = require("jszip");
const path = require("path");
const Configuration = require("../models/configurationModel")
process.env.TZ = "Asia/Calcutta";

function convertTo12HourFormat(timeStr) {
  const [hours, minutes] = timeStr.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// meeting room availability
const checkMeetingRoomAvailability = async(data)  => {
  console.log("data of Meeting Room-------------------", data);
  const existingMeeting = await Meeting.findOne({
    organizationId: data.organizationId,
    date: new Date(data.date),
    "locationDetails.roomId": data.roomId,
    "locationDetails.isMeetingRoom": true,
    isActive: true,
    "meetingStatus.status": { $in: ["scheduled", "rescheduled"] },
    $or: [
      {
        fromTime: { $lt: data.toTime },
        toTime: { $gt: data.fromTime }
      },
      {
        fromTime: { $gte: data.fromTime, $lt: data.toTime }
      },
      {
        toTime: { $gt: data.fromTime, $lte: data.toTime }
      }
    ]
  });
  if (existingMeeting) {
    const fromTimeFormatted = convertTo12HourFormat(existingMeeting.fromTime);
    const toTimeFormatted = convertTo12HourFormat(existingMeeting.toTime);
    return { 
      roomUnavailable: true,
      bookedTimeRange: `${fromTimeFormatted} to ${toTimeFormatted}`
    };
  }  
  }
const BASE_URL = process.env.BASE_URL;

/**FUNC- CREATE MEETING */
const createMeeting = async (data, userId, ipAddress = 1000) => {
  console.log("data99999999999999999999999-------------------", data);

  // meeting organizer validation
  const existingUserMeeting = await Meeting.findOne({
    createdById: new ObjectId(userId),
    date: new Date(data.date),
    fromTime: { $lt: data.toTime },  
    toTime: { $gt: data.fromTime },
    isActive: true,
    "meetingStatus.status": { $in: ["scheduled", "rescheduled"] },
  });
  
  if (existingUserMeeting) {
    const fromTimeFormatted = convertTo12HourFormat(existingUserMeeting.fromTime);
    const toTimeFormatted = convertTo12HourFormat(existingUserMeeting.toTime);
    return {
      organizerUnavailable: true,
      bookedTimeRange: `${fromTimeFormatted} to ${toTimeFormatted}`
    };
  }

  let parentMeetingData = null;
  const meetingId = await commonHelper.customMeetingId(
    data.date,
    data.organizationId
  );
  if (meetingId == false) {
    return {
      inActiveOrganization: true,
    };
  }

  const inputData = {
    meetingId,
    // title: commonHelper.encryptWithAES(data.title.trim()),
    title: data.title.trim(),
    mode: data.mode,
    link: data.link.trim(),
    date: new Date(data.date),
    organizationId: data.organizationId,
    locationDetails: data.locationDetails,
    step: 1,
    toTime: data.toTime,
    fromTime: data.fromTime,
    createdById: new ObjectId(userId),
    linkType: data.linkType ? data.linkType : undefined,
    hostDetails: {
      hostType: data.linkType ? data.linkType : "MANUAL",
    },
    attendees: [
      {
        _id: userId,
      },
    ],
  };
  
  if (data.parentMeetingId) {
    inputData.parentMeetingId = data.parentMeetingId;
    const lastFollowOnMeetingDetails = await Meeting.find(
      {
        parentMeetingId: new ObjectId(data.parentMeetingId),
        "meetingStatus.status": "closed",
      },
      { _id: 1, title: 1, meetingId: 1, followOnSerialNo: 1 }
    );
    console.log(lastFollowOnMeetingDetails);

    if (lastFollowOnMeetingDetails.length !== 0) {
      inputData.followOnSerialNo =
        lastFollowOnMeetingDetails[lastFollowOnMeetingDetails.length - 1]
          .followOnSerialNo + 1;
    } else {
      inputData.followOnSerialNo = 1;
    }
  }
  console.log(inputData);
  // ddddddddddd
  const meetingData = new Meeting(inputData);
  const newMeeting = await meetingData.save();
  if (data.parentMeetingId) {
    parentMeetingData = await Meeting.findOne(
      { _id: new ObjectId(data.parentMeetingId) },
      { _id: 1, title: 1, meetingId: 1 }
    );
  }
  const logData = {
    moduleName: logMessages.Meeting.moduleName,
    userId,
    action: data.parentMeetingId
      ? logMessages.Meeting.createFollowOnMeeting
      : logMessages.Meeting.createMeeting,
    ipAddress,
    details: "Meeting Title: <strong>" + data.title + "</strong>",
    subDetails: data.parentMeetingId
      ? `Parent Meeting Title: ${parentMeetingData.title} (${parentMeetingData.meetingId})`
      : undefined,
    organizationId: data.organizationId,
  };
  await logService.createLog(logData);
  ///////////////////// LOGER END
  return newMeeting;
};

// attendee availability checking
const checkAttendeeAvailability = async (data, id) => {
  console.log('checkAttendeeAvailability data-----', data)

  let attendeeIds;

  if (data.email) {
    const employee = await Employee.findOne({ email: data.email }, { _id: 1 });
    if (employee) {
      attendeeIds = new ObjectId(employee._id);
    } else {
        console.log("Employee not found with email:", data.email);
    }
  }
  if (data.attendeeId){
    attendeeIds = new ObjectId(data.attendeeId);
  }
  
  const fromToTime = await Meetings.findOne(
    { _id: new ObjectId(id) },
    { date:1, fromTime: 1, toTime: 1, isActive:1, meetingStatus:1 }
  );

  console.log('From To Time----', fromToTime);

  const existingAttendee = await Meetings.findOne({
    date: fromToTime.date,
    isActive: true,
    "meetingStatus.status": { $in: ["scheduled", "rescheduled"] },
    $or: [
      {
        fromTime: { $lt: fromToTime.toTime }, 
        toTime: { $gt: fromToTime.fromTime }
      },
      {
        fromTime: { $gte: fromToTime.fromTime, $lt: fromToTime.toTime }
      },
      {
        toTime: { $gt: fromToTime.fromTime, $lte: fromToTime.toTime }
      }
    ],
    attendees: { $elemMatch: { _id: { $in: attendeeIds } } }
  });

  console.log('existingAttendee----', existingAttendee)

  if (existingAttendee) {
    const fromTimeFormatted = convertTo12HourFormat(existingAttendee.fromTime);
    const toTimeFormatted = convertTo12HourFormat(existingAttendee.toTime);
    return { 
      attendeeUnavailable: true, 
      bookedTimeRange: `${fromTimeFormatted} to ${toTimeFormatted}`
    };
  }
}

/// attendee array availability
const checkAttendeeArrayAvailability = async(data) => {
  console.log('data check Attendee Array Availability data-----', data)
  const existingAttendee = await Meetings.find({
    date: data.date,
    isActive: true,
    "meetingStatus.status": { $in: ["scheduled", "rescheduled"] },
    $or: [
      {
        fromTime: { $lt: data.toTime }, 
        toTime: { $gt: data.fromTime }
      },
      {
        fromTime: { $gte: data.fromTime, $lt: data.toTime }
      },
      {
        toTime: { $gt: data.fromTime, $lte: data.toTime }
      }
    ],
    attendees: { $elemMatch: { _id: { $in: data.attendees } } }
  });

  console.log('check Attendee ArrayAvailability----', existingAttendee)

  if (existingAttendee.length !==0) {
    const fromTimeFormatted = convertTo12HourFormat(existingAttendee.fromTime);
    const toTimeFormatted = convertTo12HourFormat(existingAttendee.toTime);
    return { 
      attendeeUnavailable: true, 
      bookedTimeRange: `${fromTimeFormatted} to ${toTimeFormatted}`
    };
  }
}


/**FUNC- UPDATE MEETING */
const updateMeeting = async (data, id, userId, userData, ipAddress) => {
  console.log("data99999999999999999999999-------------------", data);
  const { step } = data;
  let hostingPassword = null;
  let updatedMeeting = null;
  let meetingLink = null;
  let hostLink = null;
  let linkType = data.linkType;
  let updateData = {};
  let mergedData = [];
  let finalAttendeeMessage = "NA";
  let finalAgendaMessage = "NA";
  let getNewAttendees = [];
  //dfsdfdfdasfd
  const stepCheck = data.step;
  if (data.step == 2) {
    const getExistingAttendees = await Meetings.findOne(
      { _id: new ObjectId(id) },
      { _id: 1, attendees: 1 }
    );
    console.log('Get Existing Attendees----', getExistingAttendees);

    const newPeopleArray = data.attendees
      .filter((item) => item.isEmployee === false && item._id === undefined)
      .map((item) => {
        item.organizationId = data.organizationId;
        return item;
      });

    console.log('New People Array-----', newPeopleArray);

    const checkAttendeeAvailability = async (attendees, date, fromTime, toTime) => {
      const conflicts = await Meetings.find({
        "hostDetails.date": date,
        $or: [
          { "hostDetails.fromTime": { $lte: toTime }, "hostDetails.toTime": { $gte: fromTime } }
        ],
        attendees: { $elemMatch: { _id: { $in: attendees.map(a => new ObjectId(a._id)) } } }
      });

      return conflicts.map(meeting => meeting.attendees).flat();
    };

    const unavailableAttendees = await checkAttendeeAvailability(newPeopleArray, data.hostDetails.date, data.hostDetails.fromTime, data.hostDetails.toTime);

    if (unavailableAttendees.length > 0) {
      console.log("The following attendees are unavailable:", unavailableAttendees);
      return res.status(400).json({
        message: "Some attendees are already booked for another meeting",
        unavailableAttendees
      });
    }


    if (newPeopleArray.length !== 0) {
      const newEmployee = await employeeService.createAttendees(newPeopleArray);
      mergedData = [...data.attendees, ...newEmployee]
        .filter((item) => item._id !== undefined)
        .map((item) => {
          // return { _id: item._id };
          return item;
        });
    }
    updateData = {
      attendees: mergedData.length !== 0 ? mergedData : data.attendees,
      step: data.step,
    };
    console.log('Updated Data attendees----', updateData.attendees);

    getNewAttendees = updateData?.attendees?.filter(function (o1) {
      return !getExistingAttendees?.attendees?.some(function (o2) {
        return o1._id.toString() == o2._id.toString();
      });
    });
    console.log(
      "getNewAttendees=======2222222222222222222222222222222222222222222222",
      getNewAttendees
    );

    const getRemovedAttendees = getExistingAttendees?.attendees.filter(
      function (o1) {
        return !updateData?.attendees?.some(function (o2) {
          //  for diffrent we use NOT (!) befor obj2 here
          return o1._id.toString() == o2._id.toString(); // id is unnique both array object
        });
      }
    );
    let removeIds = null;
    if (getRemovedAttendees?.length !== 0) {
      removeIds = getRemovedAttendees?.map((attendee) => {
        return attendee._id;
      });
    }
    if (getNewAttendees?.length !== 0) {
      newIds = getNewAttendees?.map((attendee) => {
        return attendee._id;
      });
    }

    const removeUserDetails = await Employee.find(
      { _id: { $in: removeIds } },
      { name: 1, _id: 1, email: 1 }
    );
    const removeUserList = removeUserDetails.map((user, index) => {
      return "<strong>" + user.name + " (" + user.email + ")" + "</strong>";
    });
    const newUserList = getNewAttendees.map((user, index) => {
      return "<strong>" + user.name + " (" + user.email + ")" + "</strong>";
    });
    let removeMessage =
      getRemovedAttendees?.length !== 0
        ? removeUserList.length == 1
          ? removeUserList.join("") + " removed from attendee"
          : removeUserList.join(",") + " removed from attendees"
        : null;
    let newMessage =
      getNewAttendees?.length !== 0
        ? newUserList.length === 1
          ? newUserList.join("") + " added as new attendee "
          : newUserList.join(",") + " added as new attendees "
        : null;

    console.log("New Attendees--->", getNewAttendees);
    console.log("New Message--->", newMessage);

    finalAttendeeMessage =
      newMessage !== null && removeMessage !== null
        ? newMessage + "& " + removeMessage
        : newMessage == null && removeMessage !== null
          ? removeMessage
          : newMessage !== null && removeMessage == null
            ? newMessage
            : null;
    if (data.isUpdate) {
      delete updateData.step;
    }
  }

  if (data.step == 3) {
    const getExistingAgendas = await Agenda.find(
      { meetingId: new ObjectId(id) },
      { _id: 1, title: 1 }
    );
    data.meetingId = id;
    const newAgendaData = data.agendas.map((item) => {
      (item.meetingId = id), (item.organizationId = data.organizationId);
      return item;
    });
    await Agenda.deleteMany({ meetingId: new ObjectId(id) });
    const newAgenda = await agendaService.createAgendaForMeeting(newAgendaData);
    const agendaIds = newAgenda.map((item) => {
      return item._id;
    });
    updateData = {
      agendaIds,
      step: data.step,
      "meetingStatus.status": data.meetingStatus,
    };
    const getNewAgendas = newAgenda?.filter(function (o1) {
      return !getExistingAgendas?.some(function (o2) {
        return o1.title.toString() == o2.title.toString();
      });
    });
    const newAgendaList = getNewAgendas.map((agenda, index) => {
      return "<strong>" + agenda.title + "</strong>";
    });
    let newMessage =
      getNewAgendas?.length !== 0
        ? newAgendaList.length === 1
          ? newAgendaList.join("") + " added as new agenda "
          : newAgendaList.join(",") + " added as new agendas "
        : null;
    const getRemovedAgendas = getExistingAgendas?.filter(function (o1) {
      return !newAgenda?.some(function (o2) {
        return o1.title.toString() == o2.title.toString();
      });
    });

    const removedAgendaList = getRemovedAgendas.map((agenda, index) => {
      return "<strong>" + agenda.title + "</strong>";
    });
    let removeMessage =
      getRemovedAgendas?.length !== 0
        ? removedAgendaList.length === 1
          ? removedAgendaList.join("") + " removed from agenda"
          : removedAgendaList.join(",") + " removed from agendas"
        : null;

    finalAgendaMessage =
      newMessage !== null && removeMessage !== null
        ? newMessage + "& " + removeMessage
        : newMessage == null && removeMessage !== null
          ? removeMessage
          : newMessage !== null && removeMessage == null
            ? newMessage
            : null;
    if (data.isUpdate) {
      delete updateData.step;
    }
  }

  if (data.step == 1) {
    updateData = data;
    updateData.hostDetails = {
      hostType: data.linkType ? data.linkType : "MANUAL",
    };
    updateData.link = data.linkType !== "MANUAL" ? "" : data.link;
    if (data.date) {
      updateData.date = new Date(data.date);
    }
    if (data?.locationDetails?.isMeetingRoom === false) {
      data.locationDetails["roomId"] = null;
    } else {
      data.locationDetails["location"] = null;
    }

    delete updateData.step;
  }
  console.log(
    "updateData====================333333333333333333",
    updateData,
    id
  );
  const meetingUpdate = await Meeting.findByIdAndUpdate(
    { _id: new ObjectId(id) },
    updateData,
    {
      new: false,
    }
  );
  // const meeting = await Meeting.findOne({ _id: new ObjectId(id) });
  const meeting = await viewMeeting(id, userId);
  console.log(
    "meetingUpdate====================2222222222222222222",
    meetingUpdate
  );

  if (
    meeting?.hostDetails?.hostType === "ZOOM" &&
    meeting?.hostDetails?.hostLink &&
    data.step == 2
  ) {
    const attendeesEmailids = meeting?.attendees.map((item) => {
      return {
        email: item.email,
      };
    });
    const duration =
      (parseFloat(meeting?.toTime.split(":").join(".")) -
        parseFloat(meeting?.fromTime.split(":").join("."))) *
      60;
    let updatedMeetingHostData =
      await meetingStreamingService.updateZoomMeetingForMOM(
        meeting?.title,
        Math.abs(duration),
        meeting?.date,
        process.env.TZ,
        attendeesEmailids,
        meeting
      );
    console.log("updatedMeetingHostData============", updatedMeetingHostData);

    if (updatedMeetingHostData) {
      const meetingHostDeatils = {
        meetingDateTime: updatedMeetingHostData.startTime,
      };

      await meetingHostDetails.findByIdAndUpdate(
        {
          _id: new ObjectId(updatedMeetingHostData.id),
          meetingId: new ObjectId(meeting?._id),
        },

        {
          $set: meetingHostDeatils,
        },

        {
          new: true,
        }
      );
    }
  }

  let allowedUsers = [new ObjectId(userId), meeting?.createdById];
  let details = null;
  if (data.step === 1) {
    details = `${meeting?.title}: details is updated by `;
  } else if (data.step === 2) {
    meeting?.attendees?.map((attendee) => {
      allowedUsers.push(attendee._id);
    });
    details = data.isUpdate ? "attendees modified by " : "attendees added by ";
  } else {
    details = data.isUpdate ? "agendas modified by " : "meeting created by ";
  }
  console.log(data);
  //hkghggyuguklyugkliu
  if (data.step === 3) {
    const notificationData = {
      title:
        data.step === 3 && data.isUpdate === false
          ? `New meeting has been scheduled on ${commonHelper.formatDateTimeFormat(meeting.date).formattedDate
          } at ${commonHelper.formatTimeFormat2(meeting.fromTime)};`
          : "MEETING UPDATE",
      organizationId: new ObjectId(meeting?.organizationId),
      meetingId: meeting?._id,
      byUserId: new ObjectId(userId),
      details: {
        byDetails: details,
        toDetails: null,
      },
      allowedUsers,
      type: "MEETING",
      typeId: meeting?._id,
    };
    console.log("notificationData==============>>>>>>>>>", notificationData);
    // dddddddddddd
    const addNotification = await notificationService.createNotification(
      notificationData
    );
    if (data.isUpdate === false && meeting.hostDetails.hostType == "ZOOM") {
      //&& data.mode=="VIRTUAL") {
      console.log(
        "duration-------------226--",
        meeting?.toTime.split(":").join(".")
      );
      console.log(
        "duration-------------447--",
        meeting?.fromTime.split(":").join(".")
      );
      console.log("duration-------------22--", meeting?.toTime);
      console.log(
        "duration-------------44--",
        parseFloat(meeting?.toTime.split(":").join(".")) -
        parseFloat(meeting?.fromTime.split(":").join("."))
      );
      const duration =
        (parseFloat(meeting?.toTime.split(":").join(".")) -
          parseFloat(meeting?.fromTime.split(":").join("."))) *
        60;

      const attendeesEmailids = meeting?.attendees.map((item) => {
        return {
          email: item.email,
        };
      });
      const attendeesOnlyEmailids = meeting?.attendees.map(
        (item) => item.email
      );
      console.log(duration);

      let meetingHostData =
        await meetingStreamingService.createZoomMeetingForMOM(
          meeting?.title,
          Math.abs(duration),
          meeting?.date,

          process.env.TZ,
          attendeesEmailids,
          meeting
        );
      if (meetingHostData) {
        console.log(
          "meetingHostData=========================>>>>>>>>>>>>>>>>>>>",
          meetingHostData
        );

        hostingPassword = meetingHostData?.password;
        meetingLink = meetingHostData?.host_url?.split("?")[0];
        hostLink = meetingHostData?.meeting_url;
        const hostData = {
          hostLink: meetingHostData?.meeting_url,
          hostingPassword,
          hostType: meeting?.hostDetails?.hostType,
        };

        console.log("hostData-------------", hostData);
        console.log(
          " meetingHostData?.meeting_url,-----------",
          meetingHostData?.meeting_url
        );
        updatedMeeting = await Meeting.findByIdAndUpdate(
          { _id: new ObjectId(id) },

          {
            $set: {
              link: meetingHostData?.meeting_url,
              hostDetails: hostData,
            },
          },

          {
            new: true,
          }
        );
        console.log(updatedMeeting);

        const meetingHostDeatils = {
          hostedBy: "zoom",
          meetingId: meeting._id,
          hostMeetingId: meetingHostData.id,
          duration: meetingHostData.duration,
          meetingDateTime: meetingHostData.meetingTime,
          attendees: attendeesOnlyEmailids,
          meetingLink: meetingHostData.meeting_url,
          purpose: meetingHostData.purpose,
          hostKey: meetingHostData?.hostKey,
        };
        const meetingHostDatas = new meetingHostDetails(meetingHostDeatils);
        await meetingHostDatas.save();
      }
    }
  }
  console.log(meeting.hostDetails);
  console.log(meeting.meetingStatus.status);
  console.log(data.isUpdate);
  console.log(step);
  console.log(linkType);
  if (
    data.isUpdate === true &&
    meeting.hostDetails.hostType === "ZOOM" &&
    step === 1 &&
    (meeting.meetingStatus.status === "scheduled" ||
      meeting.meetingStatus.status === "rescheduled")
  ) {
    updatedMeeting = await callMeetingHost(meeting, linkType);
  }
  console.log(
    "updatedMeeting=======2222222222222222222222222222222222222222222222",
    updatedMeeting
  );
  //////////////////LOGER START
  let logDetails = [];
  if (stepCheck == 1) {
    logDetails = await commonHelper.generateLogObjectForMeeting(
      meetingUpdate,
      userId,
      data
    );
  }
  if (stepCheck == 2) {
    if (finalAttendeeMessage !== null) {
      finalAttendeeMessage =
        commonHelper.convertFirstLetterToCapital(finalAttendeeMessage);
    }
    logDetails = [finalAttendeeMessage == null ? "NA" : finalAttendeeMessage];
  }
  if (stepCheck == 3) {
    if (finalAgendaMessage !== null) {
      finalAgendaMessage =
        commonHelper.convertFirstLetterToCapital(finalAgendaMessage);
    }
    logDetails = [finalAgendaMessage == null ? "NA" : finalAgendaMessage];
  }
  if (logDetails.length !== 0) {
    const logData = {
      moduleName: logMessages.Meeting.moduleName,
      userId,
      action: logMessages.Meeting.updateMeeting,
      ipAddress,
      details: logDetails.join(" , "),
      subDetails: ` Meeting Title: ${commonHelper.convertFirstLetterToCapital(
        meeting.title
      )} (${meeting.meetingId})`,
      organizationId: meetingUpdate.organizationId,
    };
    await logService.createLog(logData);
  }
  ///////////////////LOGER END
  let attendeesData = meeting?.attendees;
  if (data?.sendSingleNotification) {
    attendeesData = getNewAttendees;
    // emailSubject = await emailConstants.scheduleMeetingSubject(meeting);
  }

  console.log("attendeesData==========================", attendeesData);
  //kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
  if (data.sendNotification) {
    let mailData = null;
    let emailSubject = null;
    if (meeting?.attendees?.length !== 0) {
      if (meetingUpdate.step == 3) {
        meeting?.attendees?.map(async (attendee) => {
          const attendeeData = meeting?.attendees
            .map((attendee) => {
              return `${attendee.name}(${attendee.email})`;
            })
            .join(", ");
          const agendaData = meeting?.agendasDetail
            .map((agenda) => {
              return `<table style="border: 1px solid black;border-collapse: collapse; width:100%;color:black;margin-top:5px;">
          <tr style="border: 1px solid black;border-collapse: collapse;" >
          <td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;" colspan="6">
          Agenda Title
          </td>
          <td colspan="6" style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;">${agenda.title
                }</td>
          </tr>
          ${agenda.topic !== (null || "")
                  ? `<tr style="border: 1px solid black;border-collapse: collapse;">
                <td
                  style="border: 1px solid black;border-collapse: collapse; width:20%;padding:3px;"
                  colspan="6"
                >
                  Topic to Discuss
                </td>
                <td
                  colspan="6"
                  style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;"
                >
                  ${agenda.topic}
                </td>
              </tr>`
                  : `<tr style={{display:"none"}}></tr>`
                }
             ${agenda.timeLine !== (null || "" || 0)
                  ? `<tr style="border: 1px solid black;border-collapse: collapse; ">
                   <td
                     style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;"
                     colspan="6"
                   >
                     Timeline
                   </td>
                   <td
                     colspan="6"
                     style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;"
                   >
                     ${agenda.timeLine} Mins
                   </td>
                 </tr>`
                  : `<tr style={{display:"none"}}></tr>`
                }
          </table><br />`;
            })
            .join(" ");

          let finalMeetingLink = null;
          let meetingLinkCode = null;
          if (updatedMeeting) {
            (meetingLinkCode = updatedMeeting?.hostDetails?.hostingPassword),
              (finalMeetingLink =
                updatedMeeting?.hostDetails?.hostType === "ZOOM"
                  ? updatedMeeting?.hostDetails?.hostLink
                  : updatedMeeting?.link);
          } else {
            finalMeetingLink =
              meeting?.hostDetails?.hostType === "ZOOM"
                ? meeting?.hostDetails?.hostLink
                : meeting?.link;
            meetingLinkCode = meeting?.hostDetails?.hostingPassword
              ? meeting?.hostDetails?.hostingPassword
              : null;
          }

          let hostKey = null;

          const attendeeDetails = await Employee.findOne(
            { _id: new ObjectId(attendee?._id), isActive: true },
            { _id: 1, isAdmin: 1 }
          );
          const isAdmin = attendeeDetails?.isAdmin
            ? attendeeDetails?.isAdmin
            : false;
          if (
            (isAdmin ||
              meeting?.createdById?.toString() == attendee?._id?.toString()) &&
            meeting?.hostDetails?.hostType === "ZOOM"
          ) {
            console.log("isAdmin-----------222--============", isAdmin);
            finalMeetingLink = hostLink;
            const organizationHostingDetails = await HostingDetails.findOne({
              organizationId: meeting?.organizationId,
              isActive: true,
            });
            console.log(
              "organizationHostingDetails==============",
              organizationHostingDetails
            );
            if (organizationHostingDetails) {
              hostKey = commonHelper.decryptWithAES(
                organizationHostingDetails?.zoomCredentials?.hostKey
              );
            }
          }


          // const logo = process.env.LOGO;
          const organizationDetails = await Organization.findOne({ _id: meeting?.organizationId });
          const logo = organizationDetails?.dashboardLogo
            ? `${BASE_URL}/${organizationDetails.dashboardLogo.replace(/\\/g, "/")}`
            : process.env.LOGO;

          const mailData = await emailTemplates.reSendScheduledMeetingEmailTemplate(
            meeting,
            commonHelper.convertFirstLetterOfFullNameToCapital(attendee.name),
            logo,
            agendaData,
            attendeeData,
            attendee,
            attendee?.rsvp,
            meetingLinkCode,
            finalMeetingLink,
            hostKey
          );
          const { emailSubject, mailData: mailBody } = mailData;
          emailService.sendEmail(
            attendee.email,
            "Meeting Updated",
            emailSubject,
            mailBody
          );
        });
      } else {
        meeting?.attendees?.map(async (attendee) => {
          // const logo = process.env.LOGO;
          const organizationDetails = await Organization.findOne({ _id: meeting?.organizationId });
          const logo = organizationDetails?.dashboardLogo
            ? `${BASE_URL}/${organizationDetails.dashboardLogo.replace(/\\/g, "/")}`
            : null;

          const attendeeData = meeting?.attendees
            .map((attendee) => {
              return `${attendee.name}(${attendee.email})`;
            })
            .join(", ");
          const agendaData = meeting?.agendasDetail
            .map((agenda) => {
              return `<table style="border: 1px solid black;border-collapse: collapse; width:100%;color:black;margin-top:5px;">
            <tr style="border: 1px solid black;border-collapse: collapse;" >
            <td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;" colspan="6">
            Agenda Title
            </td>
            <td colspan="6" style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;">${agenda.title
                }</td>
            </tr>
            ${agenda.topic !== (null || "")
                  ? `<tr style="border: 1px solid black;border-collapse: collapse;">
                  <td
                    style="border: 1px solid black;border-collapse: collapse; width:20%;padding:3px;"
                    colspan="6"
                  >
                    Topic to Discuss
                  </td>
                  <td
                    colspan="6"
                    style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;"
                  >
                    ${agenda.topic}
                  </td>
                </tr>`
                  : `<tr style={{display:"none"}}></tr>`
                }
               ${agenda.timeLine !== (null || "" || 0)
                  ? `<tr style="border: 1px solid black;border-collapse: collapse; ">
                     <td
                       style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;"
                       colspan="6"
                     >
                       Timeline
                     </td>
                     <td
                       colspan="6"
                       style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;"
                     >
                       ${agenda.timeLine} Mins
                     </td>
                   </tr>`
                  : `<tr style={{display:"none"}}></tr>`
                }
            </table><br />`;
            })
            .join(" ");
          //  const meetingLink =
          //         meeting?.createdById?.toString() ==
          //           attendeeData?._id?.toString() &&
          //         singleMeetingDetails?.hostDetails?.hostLink
          //           ? singleMeetingDetails?.hostDetails?.hostLink?.split("?")[0]
          //           : singleMeetingDetails?.link;
          let finalMeetingLink = null;
          let meetingLinkCode = null;
          if (updatedMeeting) {
            (meetingLinkCode = updatedMeeting?.hostDetails?.hostingPassword),
              (finalMeetingLink =
                updatedMeeting?.hostDetails?.hostType === "ZOOM"
                  ? updatedMeeting?.hostDetails?.hostLink
                  : updatedMeeting?.link);
          } else {
            finalMeetingLink =
              meeting?.hostDetails?.hostType === "ZOOM"
                ? meeting?.hostDetails?.hostLink
                : meeting?.link;
            meetingLinkCode = meeting?.hostDetails?.hostingPassword
              ? meeting?.hostDetails?.hostingPassword
              : null;
          }
          // console.log("meeting==============", meeting);
          // console.log("updatedMeeting==============", updatedMeeting);
          console.log("finalMeetingLink==============", finalMeetingLink);
          console.log("meetingLinkCode==============", meetingLinkCode);

          //  const hostKey =
          //         meeting?.createdById?.toString() ==
          //           attendeeData?._id?.toString() &&
          //         singleMeetingDetails?.hostDetails?.hostLink
          //           ? singleMeetingDetails?.hostDetails?.hostLink?.split("?")[0]
          //
          //         : singleMeetingDetails?.link;
          let hostKey = null;
          console.log(
            "created by id=======================================",
            updatedMeeting
          );
          console.log(
            "attendee id=======================================",
            attendee?._id?.toString()
          );
          const attendeeDetails = await Employee.findOne(
            { _id: new ObjectId(attendee?._id), isActive: true },
            { _id: 1, isAdmin: 1 }
          );
          console.log(
            "attendeeDetails-------------============",
            attendeeDetails
          );
          const isAdmin = attendeeDetails?.isAdmin
            ? attendeeDetails?.isAdmin
            : false;
          console.log("isAdmin-----------111--============", isAdmin);
          if (
            (isAdmin ||
              meeting?.createdById?.toString() == attendee?._id?.toString()) &&
            meeting?.hostDetails?.hostType === "ZOOM"
          ) {
            console.log("isAdmin-----------222--============", isAdmin);
            finalMeetingLink = hostLink;
            const organizationHostingDetails = await HostingDetails.findOne({
              organizationId: meeting?.organizationId,
              isActive: true,
            });
            console.log(
              "organizationHostingDetails==============",
              organizationHostingDetails
            );
            if (organizationHostingDetails) {
              hostKey = commonHelper.decryptWithAES(
                organizationHostingDetails?.zoomCredentials?.hostKey
              );
            }
          }
          console.log("hostKey==============", hostKey);
          console.log("finalMeetingLink==============", finalMeetingLink);
          console.log("meetingLinkCode==============", meetingLinkCode);

          mailData = await emailTemplates.sendScheduledMeetingEmailTemplate(
            meeting,
            commonHelper.convertFirstLetterOfFullNameToCapital(attendee.name),
            logo,
            agendaData,
            attendeeData,
            attendee,
            meetingLinkCode,
            finalMeetingLink,
            hostKey
            // (meetingLink =
            //   meeting?.createdById?.toString() == attendee?._id?.toString()
            //     ? hostLink
            //     : meetingLink)
          );
          //  fffffffffffffffffffffffffffffff

          const { emailSubject, mailData: mailBody } = mailData;

          emailService.sendEmail(
            attendee.email,
            "Meeting Scheduled",
            emailSubject,
            mailBody
            //  mailData
          );
        });
      }

    }

    return meeting;
  } else {
    return meeting;
  }
};

/**FUNC- TO VIEW SINGLE MEETING DETAILS */
const viewMeeting = async (meetingId, userId) => {
  console.log("meeting Id=========", meetingId);
  const meetingData = await Meeting.aggregate([
    {
      $match: {
        _id: new ObjectId(meetingId),
        isActive: true,
      },
    },
    {
      $lookup: {
        from: "agendas",
        localField: "agendaIds",
        foreignField: "_id",
        as: "agendasDetail",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "attendees._id",
        foreignField: "_id",
        as: "attendeesDetail",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "createdById",
        foreignField: "_id",
        as: "createdByDetail",
      },
    },
    {
      $lookup: {
        from: "meetingrooms",
        localField: "locationDetails.roomId",
        foreignField: "_id",
        as: "roomDetail",
      },
    },
    {
      $lookup: {
        from: "meetingrooms",
        localField: "locationDetails.roomId",
        foreignField: "_id",
        as: "singleRoomDetail",
      },
    },

    {
      $lookup: {
        from: "units",
        localField: "singleRoomDetail.unitId",
        foreignField: "_id",
        as: "unitDetail",
      },
    },
    {
      $lookup: {
        from: "minutes",
        localField: "_id",
        foreignField: "meetingId",
        as: "actionDetail",
      },
    },
    {
      $lookup: {
        from: "meetings",
        localField: "parentMeetingId",
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
        createdById: 1,
        attendees: 1,
        meetingId: 1,
        organizationId: 1,
        title: 1,
        mode: 1,
        link: 1,
        hostLink: 1,
        date: 1,
        fromTime: 1,
        toTime: 1,
        step: 1,
        meetingStatus: 1,
        locationDetails: 1,
        parentMeetingId: 1,
        momGenerationDetails: 1,
        meetingCloseDetails: 1,
        linkType: 1,
        hostDetails: 1,
        followOnSerialNo: 1,
        agendasDetail: {
          title: 1,
          _id: 1,
          meetingId: 1,
          timeLine: 1,
          topic: 1,
          sequence: 1,
        },
        actionDetail: {
          _id: 1,
          meetingId: 1,
          isComplete: 1,
          isReopened: 1,
          isApproved: 1,
          assignedUserId: 1,
          isAction: 1,
        },
        attendeesDetail: {
          _id: 1,
          name: 1,
          isEmployee: 1,
          email: 1,
          empId: 1,
          companyName: 1,
          designation: 1,
        },
        roomDetail: {
          title: 1,
          _id: 1,
          location: 1,
        },
        createdByDetail: {
          _id: 1,
          email: 1,
          name: 1,
        },
        parentMeetingDetails: {
          _id: 1,
          meetingId: 1,
          title: 1,
          date: 1,
          fromTime: 1,
          toTime: 1,
          actualFromTime: 1,
          actualToTime: 1,
        },
        singleRoomDetail: {
          _id: 1,
          unitId: 1,
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
    //  { $unwind: "$createdByDetail" },
    {
      $unwind: {
        path: "$createdByDetail",
        preserveNullAndEmptyArrays: true,
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
  ]);

  console.log("meetingData===================", meetingData);
  if (meetingData.length !== 0) {
    let meetingDataObject = meetingData[0];
    console.log(
      "meetingDataObject--------------======================",
      meetingDataObject
    );
    meetingDataObject.attendees.map((item) => {
      const attendeeData = meetingDataObject.attendeesDetail.find(
        (attendee) => attendee._id == item._id.toString()
      );
      console.log("attendeeData================", attendeeData);
      if (attendeeData) {
        item.name = attendeeData.name;
        item.email = attendeeData.email;
        item.isEmployee = attendeeData.isEmployee;
        item.empId = attendeeData.empId;
        if (attendeeData?.companyName) {
          item.companyName = attendeeData?.companyName;
        }
        if (attendeeData?.designation) {
          item.designation = attendeeData?.designation;
        }
      }

      if (item._id.toString() == userId.toString()) {
        meetingDataObject["canWriteMOM"] = item.canWriteMOM;
      }
      return item;
    });
    const actionData = meetingDataObject.actionDetail.filter(
      (action) => action.assignedUserId == userId && action.isAction == true
    );
    if (actionData.length !== 0) {
      meetingDataObject.actionDetail = actionData;
    }
    meetingDataObject.actualToTime = meetingDataObject.toTime;
    meetingDataObject.actualFromTime = meetingDataObject.fromTime;
    meetingDataObject.actualDate = meetingDataObject.date;
    meetingDataObject.date = commonHelper.formatDateTimeFormat(
      meetingDataObject.date
    ).formattedDate;
    meetingDataObject.fromTime = commonHelper.formatTimeFormat(
      meetingDataObject.fromTime
    );
    meetingDataObject.toTime = commonHelper.formatTimeFormat(
      meetingDataObject.toTime
    );
    meetingDataObject.agendasDetail = meetingDataObject.agendasDetail.sort(
      (a, b) => a.sequence - b.sequence
    );
    delete meetingDataObject.attendeesDetail;
    if (meetingDataObject?.hostDetails?.hostType === "ZOOM") {
      const meetingRecordings = await getRecordingsZoomMeetingForMOM(
        meetingDataObject?._id
      );
      console.log(
        "meetingRecordings========================>>>>>>>>>>>>",
        meetingRecordings
      );
      if (meetingRecordings.success) {
        meetingDataObject["recordings"] = {
          recordingFile: meetingRecordings?.data?.recording_files,
          password: meetingRecordings?.data?.password,
          recordingPlayPasscode:
            meetingRecordings?.data?.recording_play_passcode,
        };
      }
    }
    console.log(meetingDataObject?.parentMeetingDetails);
    if (meetingDataObject?.parentMeetingDetails?.length !== 0) {
      meetingDataObject.parentMeetingDetails = [
        {
          actualDate: meetingDataObject?.parentMeetingDetails[0]?.date,
          date: commonHelper.formatDateTimeFormat(
            meetingDataObject?.parentMeetingDetails[0]?.date
          ).formattedDate,
          fromTime: commonHelper.formatTimeFormat(
            meetingDataObject?.parentMeetingDetails[0]?.fromTime
          ),
          toTime: commonHelper.formatTimeFormat(
            meetingDataObject?.parentMeetingDetails[0]?.toTime
          ),
          actualFromTime: meetingDataObject?.parentMeetingDetails[0]?.fromTime,
          actualToTime: meetingDataObject?.parentMeetingDetails[0]?.toTime,
          _id: meetingDataObject?.parentMeetingDetails[0]?._id,
          meetingId: meetingDataObject?.parentMeetingDetails[0]?.meetingId,
          title: meetingDataObject?.parentMeetingDetails[0]?.title,
        },
      ];
    }

    return meetingDataObject;
  }
  return false;
};
/**FUNC- TO VIEW ALL MEETING LIST */
const viewAllMeetings = async (bodyData, queryData, userId, userData) => {
  const { order } = queryData;
  let organisersIds = [];
  const { organizationId, searchKey } = bodyData;
  if (searchKey) {
    const organiserData = await Employee.find(
      {
        isActive: true,
        $or: [
          {
            name: { $regex: searchKey, $options: "i" },
          },
          {
            email: { $regex: searchKey, $options: "i" },
          },
        ],
      },
      { _id: 1, name: 1, email: 1 }
    );
    console.log("organiserData=====================>>>", organiserData);
    if (organiserData?.length !== 0) {
      organisersIds = organiserData.map((item) => item._id);
    }
    console.log("organisersIds=====================>>>", organisersIds);
  }
  let query = searchKey
    ? {
      organizationId: new ObjectId(organizationId),
      $and: [
        {
          $or: [
            {
              title: { $regex: searchKey, $options: "i" },
            },
            {
              meetingId: { $regex: searchKey, $options: "i" },
            },
            {
              createdById: { $in: organisersIds },
            },
          ],
        },
      ],

      isActive: true,
    }
    : {
      organizationId: new ObjectId(organizationId),
      isActive: true,
    };
  if (bodyData.fromDate && bodyData.toDate) {
    const fromDate = new Date(bodyData.fromDate);
    const toDate = new Date(bodyData.toDate);
    query.date = {
      $gte: new Date(fromDate.setDate(fromDate.getDate())),
      $lt: new Date(toDate.setDate(toDate.getDate() + 1)),
    };
  }

  if (bodyData.fromDate && !bodyData.toDate) {
    const fromDate = new Date(bodyData.fromDate);
    const toDate = new Date();
    query.date = {
      $gte: new Date(fromDate.setDate(fromDate.getDate())),
    };
  }

  if (!bodyData.fromDate && bodyData.toDate) {
    const toDate = new Date(bodyData.toDate);
    query.date = {
      $lt: new Date(toDate.setDate(toDate.getDate() + 1)),
    };
  }
  if (userData.isAdmin) {
  } else {
    // db.inventory.find( { $and: [ { "meetingStatus.status": { $ne: "draft" } }, {  "attendees._id": new ObjectId(userId)} ] } )

    // query["meetingStatus.status"] = { $ne: "draft" };
    if (query["$and"]) {
      query["$and"].push({
        $or: [
          {
            $and: [
              { "meetingStatus.status": { $ne: "draft" } },
              { "attendees._id": new ObjectId(userId) },
            ],
          },
          { createdById: new ObjectId(userId) },
          // { "attendees._id": new ObjectId(userId) },
          // { createdById: new ObjectId(userId) },
        ],
      });
    } else {
      query["$or"] = [
        // { "attendees._id": new ObjectId(userId) },
        // { createdById: new ObjectId(userId) },
        {
          $and: [
            { "meetingStatus.status": { $ne: "draft" } },
            { "attendees._id": new ObjectId(userId) },
          ],
        },
        { createdById: new ObjectId(userId) },
      ];
    }
  }
  if (bodyData.attendeeId) {
    query["attendees._id"] = new ObjectId(bodyData.attendeeId);
  }
  if (bodyData.meetingStatus) {
    query["meetingStatus.status"] = bodyData.meetingStatus;
  }
  var limit = parseInt(queryData.limit);
  var skip = (parseInt(queryData.page) - 1) * parseInt(limit);
  const totalCount = await Meeting.countDocuments(query);
  console.log("meeting list query===================", query);
  //let actionQuery = null;

  let actionQuery = {
    isActive: true,
    isAction: true,
  };

  // if (userData.isAdmin) {
  //   actionQuery = {
  //     isActive: true,
  //     isAction: true,
  //   };
  // } else {
  //   const meetingIds = await meetingService.getMeetingIdsOfCreatedById(userId);
  //   actionQuery = {
  //     isActive: true,
  //     isAction: true,
  //     meetingId: { $in: meetingIds },
  //   };
  // }

  const meetingData = await Meeting.aggregate([
    {
      $match: query,
    },
    {
      $lookup: {
        from: "employees",
        localField: "attendees._id",
        foreignField: "_id",
        as: "attendeesDetail",
      },
    },
    {
      $lookup: {
        from: "minutes",
        localField: "_id",
        foreignField: "meetingId",
        pipeline: [
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
          {
            $match: actionQuery,
          },
        ],
        as: "actionDetail",
      },
    },
    {
      $lookup: {
        from: "minutes",
        localField: "_id",
        foreignField: "meetingId",
        pipeline: [
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
          {
            $match: {
              isActive: true,
            },
          },
        ],
        as: "minutesDetails",
      },
    },
    {
      $lookup: {
        from: "meetings",
        localField: "_id",
        foreignField: "parentMeetingId",
        as: "parentMeetingDetails",
      },
    },
    {
      $project: {
        _id: 1,
        attendees: 1,
        meetingCloseDetails: 1,
        title: 1,
        meetingId: 1,
        mode: 1,
        link: 1,
        date: 1,
        fromTime: 1,
        toTime: 1,
        status: 1,
        locationDetails: 1,
        meetingStatus: 1,
        createdAt: 1,
        createdById: 1,
        momGenerationDetails: 1,
        actionDetail: {
          _id: 1,
          minuteId: 1,
          description: 1,
          meetingId: 1,
          isComplete: 1,
          isActive: 1,
          isReopened: 1,
          isApproved: 1,
          assignedUserId: 1,
          isAction: 1,
        },
        minutesDetails: {
          _id: 1,
          minuteId: 1,
          description: 1,
          meetingId: 1,
          isComplete: 1,
          isActive: 1,
          isReopened: 1,
          isApproved: 1,
          assignedUserId: 1,
          isAction: 1,
        },
        attendeesDetail: {
          email: 1,
          _id: 1,
          name: 1,
          empId: 1,
          designation: 1,
          companyName: 1,
          isMeetingOrganiser: 1,
          isAdmin: 1,
        },
        parentMeetingDetails: {
          _id: 1,
        },
      },
    },
  ])
    .sort({ _id: parseInt(order) })
    .skip(skip)
    .limit(limit);
  if (meetingData.length !== 0) {
    meetingData.map((meetingDataObject) => {
      const meetingDate = new Date(meetingDataObject.date);
      meetingDataObject["canUpdateRSVP"] = true;

      const meetingDateTime = commonHelper
        .combineDateAndTime(meetingDate, meetingDataObject.fromTime)
        .getTime();
      const currentDateTime = commonHelper.convertIsoFormat(new Date());
      const diff = meetingDateTime - new Date(currentDateTime).getTime();
      if (diff <= 0) {
        meetingDataObject["canUpdateRSVP"] = false;
      }
      meetingDataObject.attendees.map((item) => {
        const attendeeData = meetingDataObject.attendeesDetail.find(
          (attendee) => attendee._id == item._id.toString()
        );
        if (item._id.toString() == userId.toString()) {
          meetingDataObject.rsvp = item.rsvp;
        }
        if (item._id.toString() == userId.toString()) {
          meetingDataObject["canWriteMOM"] = item.canWriteMOM;
        }
        if (attendeeData) {
          item.email = attendeeData.email;
          item.name = attendeeData.name;
          item.empId = attendeeData.empId;
          item.isMeetingOrganiser = attendeeData.isMeetingOrganiser;
          item.isAdmin = attendeeData.isAdmin;
          if (attendeeData?.companyName) {
            item.companyName = attendeeData?.companyName;
          }
          if (attendeeData?.designation) {
            item.designation = attendeeData?.designation;
          }
          return;
        }
      });
      let actionData = [];
      // if (userData.isAdmin) {
      //   actionData = meetingDataObject.actionDetail.filter(
      //     (action) => action.isAction == true
      //   );
      // } else {
      //   actionData = meetingDataObject.actionDetail.filter(
      //     (action) => action.assignedUserId == userId && action.isAction == true
      //   );
      // }

      // if (actionData.length !== 0) {
      //   meetingDataObject.actionDetail = actionData;
      // }
      meetingDataObject.actualDate = meetingDataObject.date;
      meetingDataObject.date = commonHelper.formatDateTimeFormat(
        meetingDataObject.date
      ).formattedDate;
      meetingDataObject.actualToTime = meetingDataObject.toTime;
      meetingDataObject.actualFromTime = meetingDataObject.fromTime;

      meetingDataObject.fromTime = commonHelper.formatTimeFormat(
        meetingDataObject.fromTime
      );
      meetingDataObject.toTime = commonHelper.formatTimeFormat(
        meetingDataObject.toTime
      );
      delete meetingDataObject.attendeesDetail;
    });
  }

  return {
    totalCount,
    meetingData,
  };
};

/**FUNC- TO UPDATE RSVP SECTION */
const updateRsvp = async (id, userId, data, ipAddress = "1000") => {
  const result = await Meeting.findOneAndUpdate(
    {
      "attendees._id": new ObjectId(userId),
      _id: new ObjectId(id),
    },
    {
      $set: { "attendees.$.rsvp": data.rsvp },
    }
  );
  const allowedUsers = [new ObjectId(userId), result?.createdById];
  const notificationData = {
    title: "RSVP UPDATED",
    organizationId: new ObjectId(result?.organizationId),
    meetingId: id,
    byUserId: new ObjectId(userId),
    details: {
      byDetails: `RSVP is updated by `,
      toDetails: null,
    },
    allowedUsers,
  };
  const addNotification = await notificationService.createNotification(
    notificationData
  );
  ////////////////////LOGER START
  const details = await commonHelper.generateLogObject(
    {
      rsvp: result?.attendees?.find(
        (item) => item?._id?.toString() === userId.toString()
      )?.rsvp,
    },
    userId,
    data
  );
  if (details.length !== 0) {
    const logData = {
      moduleName: logMessages.Meeting.moduleName,
      userId,
      action: logMessages.Meeting.updateRSVP,
      ipAddress,
      details: commonHelper.convertFirstLetterToCapital(details.join(" , ")),
      subDetails: ` Meeting Title: ${result.title} (${result.meetingId})`,
      organizationId: result.organizationId,
    };
    await logService.createLog(logData);
  }
  /////////////////////LOGER END
  return result;
};

/**FUNC- TO CANCEL MEETING */
const cancelMeeting = async (id, userId, data, ipAddress) => {
  const result = await Meeting.findOneAndUpdate(
    {
      _id: new ObjectId(id),
    },
    {
      $set: {
        "meetingStatus.status": "cancelled",
        "meetingStatus.remarks": data.remarks,
      },
    }
  );
  const meetingDetails = await viewMeeting(id, userId);
  if (meetingDetails?.attendees?.length !== 0) {
    meetingDetails?.attendees?.map(async (attendee) => {
      // const logo = process.env.LOGO;

      const organizationDetails = await Organization.findOne({ _id: meetingDetails.organizationId });
      const logo = organizationDetails?.dashboardLogo
        ? `${BASE_URL}/${organizationDetails.dashboardLogo.replace(/\\/g, "/")}`
        : process.env.LOGO;

      // const { subject: emailSubject, mailBody } =
        await emailTemplates.sendCancelMeetingEmailTemplate(
          meetingDetails,
          attendee.name,
          logo
        );
      // const emailSubject = await emailConstants.cancelMeetingSubject(
      //   meetingDetails
      // );
      const { subject, mailBody } = mailData;
      emailService.sendEmail(
        attendee.email,
        "Cancel Meeting",
        subject,
        mailBody
      );
    });
  }
  const details = await commonHelper.generateLogObject(
    { status: result?.meetingStatus?.status },
    userId,
    { status: "cancelled" }
  );
  if (details.length !== 0) {
    const logData = {
      moduleName: logMessages.Meeting.moduleName,
      userId,
      action: logMessages.Meeting.cancelMeeting,
      ipAddress,
      details: commonHelper.convertFirstLetterToCapital(details.join(" , ")),
      subDetails: ` Meeting Title: ${result.title} (${result.meetingId})`,
      organizationId: result.organizationId,
    };
    await logService.createLog(logData);
  }
  ///////////////////// LOGER END
  return result;
};

// /**FUNC- TO VIEW LIST OF ATTENDEES FROM PREVIOUS MEETING */
const listAttendeesFromPreviousMeetingOld = async (organizationId, userId) => {
  const meetingData = await Meeting.aggregate([
    {
      $match: {
        organizationId: new ObjectId(organizationId),
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "attendees._id",
        foreignField: "_id",
        as: "attendeesDetail",
      },
    },
    {
      $project: {
        _id: 1,
        attendeesDetail: {
          email: 1,
          _id: 1,
          name: 1,
          isEmployee: 1,
          isActive: 1,
        },
      },
    },
  ]);
  const attendeeData = meetingData.map((meeting) => {
    return meeting.attendeesDetail;
  });
  console.log("attendeeData==========", attendeeData);
  const uniqueAttendeeData = [].concat(...attendeeData);
  const filetrData = uniqueAttendeeData.filter(
    (obj, index, self) =>
      index === self.findIndex((o) => JSON.stringify(o) === JSON.stringify(obj))
  );
  const finalData = filetrData.filter((attendee) => attendee.isActive);
  return finalData;
};

// /**FUNC- TO VIEW LIST OF ATTENDEES FROM PREVIOUS MEETING */
const listAttendeesFromPreviousMeeting = async (organizationId, userId) => {
  const attendeeData = await Employee.find(
    { organizationId: new ObjectId(organizationId), isActive: true },
    { name: 1, email: 1, _id: 1, isEmployee: 1 }
  );
  // console.log("attendeeData==========",attendeeData)
  // const uniqueAttendeeData = [].concat(...attendeeData);
  // const filetrData = uniqueAttendeeData.filter(
  //   (obj, index, self) =>
  //     index === self.findIndex((o) => JSON.stringify(o) === JSON.stringify(obj))
  // );
  // const finalData = filetrData.filter((attendee) => attendee.isActive);
  return attendeeData;
};
//FUNCTION TO GET ATTENDEES//
const getAllAttendees = async (meetingId) => {
  const result = await Meeting.findById(meetingId, { "attendees.id": 1 });
  return result;
};
//FUNCTION TO STORE MEETING ACTIVITES
const createMeetingActivities = async (data, userId) => {
  const inputData = {
    activityDetails: data.activityDetails,
    meetingId: data.meetingId,
    userId,
    activityTitle: data.activityTitle,
  };
  const meetingActivitiesData = new MeetingActivities(inputData);
  const newMeetingActivities = await meetingActivitiesData.save();
  return newMeetingActivities;
};
//FUNCTION TO FETCH MEETING ACTIVITIES LIST
const viewMeetingActivities = async (meetingId) => {
  const result = await MeetingActivities.aggregate([
    {
      $match: {
        meetingId: new ObjectId(meetingId),
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
      $project: {
        _id: 1,
        activityTitle: 1,
        meetingId: 1,
        userId: 1,
        activityDetails: 1,
        createdAt: 1,
        updatedAt: 1,
        employeeDetails: {
          _id: 1,
          name: 1,
          email: 1,
        },
      },
    },
    { $unwind: "$employeeDetails" },
  ]).sort({ _id: -1 });
  const modifiedResult = result.map((item) => {
    item["date"] = `${commonHelper.formatDateTimeFormat(item.createdAt).formattedDate
      },${commonHelper.formatDateTimeFormat(item.createdAt).formattedTime}`;
    return item;
  });

  return modifiedResult;
};
//FUNCTION TO GET MEETING CREATE STEP STATUS
const getCreateMeetingStep = async (organizationId, userId) => {
  const meetingData = await Meeting.aggregate([
    {
      $match: {
        createdById: new ObjectId(userId),
        organizationId: new ObjectId(organizationId),
        isActive: true,
        $or: [{ step: 1 }, { step: 2 }],
      },
    },
    {
      $lookup: {
        from: "agendas",
        localField: "agendaIds",
        foreignField: "_id",
        as: "agendasDetail",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "attendees._id",
        foreignField: "_id",
        as: "attendeesDetail",
      },
    },
    {
      $lookup: {
        from: "meetingrooms",
        localField: "locationDetails.roomId",
        foreignField: "_id",
        as: "roomDetail",
      },
    },
    {
      $project: {
        _id: 1,
        attendees: 1,
        meetingId: 1,
        title: 1,
        mode: 1,
        link: 1,
        date: 1,
        fromTime: 1,
        toTime: 1,
        step: 1,
        locationDetails: 1,
        meetingStatus: 1,
        momGenerationDetails: 1,
        agendasDetail: {
          title: 1,
          _id: 1,
          meetingId: 1,
          timeLine: 1,
        },
        attendeesDetail: {
          email: 1,
          _id: 1,
          name: 1,
          isEmployee: 1,
        },
        roomDetail: {
          title: 1,
          _id: 1,
          location: 1,
        },
      },
    },
  ]).sort({ _id: -1 });
  if (meetingData.length !== 0) {
    let meetingDataObject = meetingData[0];
    meetingDataObject.attendees.map((item) => {
      const attendeeData = meetingDataObject.attendeesDetail.find(
        (attendee) => attendee._id == item._id.toString()
      );
      item.name = attendeeData.name;
      item.email = attendeeData.email;
      item.isEmployee = attendeeData.isEmployee;
      if (item._id.toString() == userId.toString()) {
        meetingDataObject["canWriteMOM"] = item.canWriteMOM;
      }
      return item;
    });
    delete meetingDataObject.attendeesDetail;
    meetingDataObject.date = commonHelper.formatDateTimeFormat(
      meetingDataObject.date
    ).formattedDate;
    meetingDataObject.fromTime = commonHelper.formatTimeFormat(
      meetingDataObject.fromTime
    );
    meetingDataObject.toTime = commonHelper.formatTimeFormat(
      meetingDataObject.toTime
    );
    return meetingDataObject;
  }
  return false;
};

/**FUNC- TO UPDATE ATTENDANCE */
const updateMeetingAttendance = async (id, userId, data, ipAddress) => {
  const result = await Meeting.findOneAndUpdate(
    {
      _id: new ObjectId(id),
    },
    {
      $set: {
        updatedFromTime: data.fromTime,
        updatedToTime: data.toTime,
        attendees: data.attendees,
        isAttendanceAdded: true,
      },
    },
    {
      new: false,
    }
  );
  if (data?.attendanceData?.length !== 0) {
    await Attendace.deleteMany({ meetingId: new ObjectId(id) });
    data?.attendanceData?.map(async (attendance) => {
      const inputData = {
        meetingId: new ObjectId(id),
        createdById: new ObjectId(userId),
        attendanceType: attendance.attendanceType,
        fromTime: attendance.fromTime,
        toTime: attendance.toTime,
        attendeeId: new ObjectId(attendance._id),
        isAttended: attendance.isAttended,
      };
      const attendanceData = new Attendace(inputData);
      await attendanceData.save();
    });
    const activityObject = {
      activityDetails: result.title + " (meeting)",
      activityTitle: "ATTENDANCE ADDED",
      meetingId: new ObjectId(id),
    };
    const meetingActivitiesResult =
      await meetingService.createMeetingActivities(activityObject, userId);
  }
  if (data.isSendNotification) {
    const emailIds = data.attendanceData.map((attendee) => attendee.email);
    console.log("emailIds==================", emailIds);
    if (emailIds.length !== 0) {
      const meetingDetails = await viewMeeting(id, userId);
      // const logo = process.env.LOGO;

      const organizationDetails = await Organization.findOne({ _id: meetingDetails.organizationId });
      const logo = organizationDetails?.dashboardLogo
        ? `${BASE_URL}/${organizationDetails.dashboardLogo.replace(/\\/g, "/")}`
        : process.env.LOGO;

      const attendanceData = `<table style="border: 1px solid black;border-collapse: collapse; width:100%;color:black;margin-top:5px;">
  <tr style="border: 1px solid black;border-collapse: collapse;" >
   <td  style="border: 1px solid black;border-collapse: collapse;width:10%;padding:7px;" colspan="6"><strong>
  Sl No.
  </strong>
  </td>
  <td  style="border: 1px solid black;border-collapse: collapse;width:30%;padding:7px;" colspan="6"><strong>
  Attendee Name
  </strong>
  </td>
   <td  style="border: 1px solid black;border-collapse: collapse;width:15%;padding:7px;" colspan="6">
   <strong>
  Attendance Status
  </strong>
  </td>
   <td  style="border: 1px solid black;border-collapse: collapse;width:15%;padding:7px;" colspan="6">
   <strong>
  Attendance Type
  </strong>
  </td>
   <td  style="border: 1px solid black;border-collapse: collapse;width:15%;padding:7px;" colspan="6">
   <strong>
  From Time
  </strong>
  </td>
   <td  style="border: 1px solid black;border-collapse: collapse;width:15%;padding:7px;" colspan="6">
   <strong>
  To Time
  </strong>
  </td>
  
  </tr>
  ${data.attendanceData
          .map((item, index) => {
            return `
      
       <tr style="border: 1px solid black;border-collapse: collapse;" >
   <td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:7px;" colspan="6">
 ${index + 1}
  </td>
  <td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:7px;" colspan="6">
 ${item.name}
  </td>
    <td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:7px;" colspan="6">
   ${item.isAttended
                ? '<p style="color:green;">Present</p>'
                : '<p style="color:red;">Absent</p>'
              }
  </td>
   <td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:7px;" colspan="6">
  ${item.attendanceType}
  </td>
   <td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:7px;" colspan="6">
  ${commonHelper.convertTimetoIST(item.fromTime)}
  </td>
   <td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:7px;" colspan="6">
   ${commonHelper.convertTimetoIST(item.toTime)}
  </td>
 
  </tr>
      `;
          })
          .join(" ")}
  </table><br />`;

      emailIds.map(async (email) => {
        console.log(
          "emails=========================================================",
          email
        );

        const mailData =
          await emailTemplates.sendAttendanceDetailsEmailTemplate(
            meetingDetails,
            attendanceData,
            logo,
            email
          );
        // const emailSubject = await emailConstants.sendAttendanceDetailsSubject(
        //   meetingDetails
        // );
        const { emailSubject, mailData: mailBody } = mailData;

        emailService.sendEmail(email, "Add Attendance", emailSubject, mailBody);
      });
    }
  }
  const ids = data?.attendees?.map((attendee) => attendee._id.toString());
  const allUsers = await Employee.find(
    { _id: { $in: ids } },
    { _id: 1, name: 1, email: 1 }
  );
  const attendedUsers = data?.attendees?.filter(
    (attendee) => attendee.isAttended === true
  );
  const absentUsers = data?.attendees?.filter(
    (attendee) => attendee.isAttended === false
  );
  const attendedUsersDetails = attendedUsers.map((item) => {
    return allUsers.find(
      (user) => user?._id.toString() === item?._id.toString()
    );
  });
  const absentUsersDetails = absentUsers.map((item) => {
    return allUsers.find(
      (user) => user?._id.toString() === item?._id.toString()
    );
  });
  const logDetails = await commonHelper.generateLogObjectForUpdateAttendance(
    result,
    userId,
    data,
    attendedUsersDetails,
    absentUsersDetails
  );
  if (logDetails.length !== 0) {
    const logData = {
      moduleName: logMessages.Meeting.moduleName,
      userId,
      action: logMessages.Meeting.updateMeetingAttendance,
      ipAddress,
      details: logDetails.join(" , "),
      subDetails: ` Meeting Title: ${result.title} (${result.meetingId})`,
      organizationId: result.organizationId,
    };
    await logService.createLog(logData);
  }
  /////////////////////LOGER END
  return result;
};
/**FUNC- TO GENERATE MOM */
const generateMOM = async (meetingId, userId, data, ipAddress = "1000") => {
  const momDate = `${new Date().getDate()}-${new Date().getMonth()}-${new Date().getYear()}`;
  const checkAttendace = await Meeting.findOne({
    _id: new ObjectId(meetingId),
    organizationId: new ObjectId(data.organizationId),
    isActive: true,
    isAttendanceAdded: true,
  });
  if (!checkAttendace) {
    return {
      isAttendanceAdded: false,
    };
  }
  const updateMinuteStatus = await Minute.updateMany(
    {
      meetingId: new ObjectId(meetingId),
      organizationId: new ObjectId(data.organizationId),
      isActive: true,
    },
    {
      status: "PUBLISHED",
    }
  );
  const updateAgendaStatus = await Agenda.updateMany(
    {
      meetingId: new ObjectId(meetingId),
      organizationId: new ObjectId(data.organizationId),
      isActive: true,
    },
    {
      isMOMGenerated: true,
    }
  );

  if (updateMinuteStatus?.modifiedCount == 0) {
    return {
      isMinuteAdded: false,
    };
  }
  const fileDetails = await minutesService.downLoadMinutes(meetingId, userId);
  const filePath = `${process.env.BASE_URL + fileDetails}`;

  const momGenerationDetails = {
    createdById: userId,
    filePath,
    momId: commonHelper.generateOtp(),
  };
  let updateData = null;
  if (checkAttendace?.meetingStatus?.status == "closed") {
    updateData = {
      $push: { momGenerationDetails },
    };
  } else {
    updateData = {
      $push: { momGenerationDetails },
      meetingStatus: {
        status: "closed",
        remarks: "Mom generated",
      },
      meetingCloseDetails: {
        closedById: userId,
        closedAt: commonHelper.convertIsoFormat(new Date()),
      },
    };
  }
  const updateMomDetails = await Meeting.findOneAndUpdate(
    {
      _id: new ObjectId(meetingId),
      isActive: true,
    },
    updateData
  );
  if (updateMomDetails) {
    const meetingDetails = await viewMeeting(meetingId, userId);
    if (data.attendees?.length !== 0 && meetingDetails) {
      data.attendees.map(async (attendee) => {
        // const logo = process.env.LOGO;
        const organizationDetails = await Organization.findOne({
          _id: meetingDetails.organizationId,
        });
        const logo = organizationDetails?.dashboardLogo
          ? `${BASE_URL}/${organizationDetails.dashboardLogo.replace(/\\/g, "/")}`
          : process.env.LOGO;

        const mailData = await emailTemplates.sendCreateMinutesEmailTemplate(
          meetingDetails,
          attendee.name,
          logo
        );
        // const emailSubject = await emailConstants.createMinuteSubject(
        //   meetingDetails
        // );
        const { emailSubject, mailData: mailBody } = mailData;
        emailService.sendEmail(
          attendee.email,
          "Create Meeting Minutes",
          emailSubject,
          mailBody,
          {
            filename: `MOM-${new Date().getDate()}-${new Date().getMonth()}-${new Date().getYear()}.pdf`,
            path: filePath,
          }
        );
      });
    }

    let allowedUsers = [new ObjectId(userId), meetingDetails?.createdById];
    meetingDetails?.attendees?.map((attendee) => {
      allowedUsers.push(attendee._id);
    });
    const notificationData = {
      title: "MOM GENERATED",
      organizationId: new ObjectId(meetingDetails?.organizationId),
      meetingId: meetingDetails?._id,
      byUserId: new ObjectId(userId),
      details: {
        byDetails: `MOM is generated by `,
        toDetails: null,
      },
      allowedUsers,
    };
    const addNotification = await notificationService.createNotification(
      notificationData
    );
    ////////////////////LOGER START
    const momDate = `${new Date().getDate()}-${new Date().getMonth()}-${new Date().getYear()}`;
    const logData = {
      moduleName: logMessages.Meeting.moduleName,
      userId,
      action: logMessages.Meeting.momCreated,
      ipAddress,
      details: `MOM File:<a href=${filePath} target="_blank">MOM-${momDate}.pdf</a>`,
      subDetails: `Meeting Title: <strong>
      ${updateMomDetails.title}
      </strong> (${meetingDetails.meetingId})`,
      organizationId: data.organizationId,
    };
    await logService.createLog(logData);
    ///////////////////// LOGER END
    const activityObject = {
      activityDetails: updateMomDetails?.title + " (meeting)",
      activityTitle: "MOM GENERATED",
      meetingId: meetingId,
    };
    const meetingActivitiesResult =
      await meetingService.createMeetingActivities(activityObject, userId);
  }

  return updateMomDetails;
};

/**FUNC- TO DOWNLOAD MOM */
const downloadMOM = async (meetingId, userId, ipAddress = "1000") => {
  const momDetails = await Meeting.findOne(
    {
      _id: new ObjectId(meetingId),
      isActive: true,
    },
    {
      momGenerationDetails: 1,
      _id: 1,
      organizationId: 1,
      title: 1,
      meetingId: 1,
    }
  );
  if (momDetails) {
    const downloadFile =
      momDetails?.momGenerationDetails[
        momDetails.momGenerationDetails?.length - 1
      ]?.filePath;
    ////////////////////LOGER START
    const logData = {
      moduleName: logMessages.Meeting.moduleName,
      userId,
      action: logMessages.Meeting.momDownloaded,
      ipAddress,
      details: `MOM File:<a href=${downloadFile} target="_blank">momDetails.pdf</a>`,
      subDetails: `Meeting Title: <strong>
  ${momDetails.title}
  </strong> (${momDetails.meetingId})`,
      organizationId: momDetails.organizationId,
    };
    await logService.createLog(logData);
    ///////////////////// LOGER END
    const activityObject = {
      activityDetails: momDetails?.title + " (meeting)",
      activityTitle: "MOM DOWNLOADED",
      meetingId: meetingId,
    };

    await meetingService.createMeetingActivities(activityObject, userId);
    return downloadFile;
  }
  return false;
};

/**FUNC- TO RESCHEDULE MEETING */
const rescheduleMeeting = async (id, userId, data, ipAddress = "1000") => {
  const updatedMeeting = null;

  const isUpdated = await Meeting.findOneAndUpdate(
    {
      _id: new ObjectId(id),
    },
    {
      $set: {
        fromTime: data.fromTime,
        toTime: data.toTime,
        date: new Date(data.date),
        meetingStatus: {
          status: "rescheduled",
          remarks: data.remarks,
        },
      },
    }
  );
  if (isUpdated) {
    const meetingDetails = await viewMeeting(id, userId);

    if (meetingDetails?.hostDetails?.hostType === "ZOOM") {
      const attendeesEmailids = meetingDetails?.attendees.map((item) => {
        return {
          email: item.email,
        };
      });
      const duration =
        (parseFloat(meetingDetails?.toTime.split(":").join(".")) -
          parseFloat(meetingDetails?.fromTime.split(":").join("."))) *
        60;
      let updatedMeetingHostData =
        await meetingStreamingService.updateZoomMeetingForMOM(
          meetingDetails?.title,
          Math.abs(duration),
          meetingDetails?.date,
          //agenda,
          //password,
          process.env.TZ,
          attendeesEmailids,
          meetingDetails
        );
      console.log("updatedMeetingHostData============", updatedMeetingHostData);

      if (updatedMeetingHostData) {
        // hostingPassword = updatedMeetingHostData?.password;
        // meetingLink = updatedMeetingHostData?.meeting_url?.split("?")[0];
        // hostLink = updatedMeetingHostData?.host_url;

        // updatedMeeting = await Meeting.findByIdAndUpdate(
        //   { _id: new ObjectId(id) },

        //   {
        //     $set: {
        //       link: updatedMeetingHostData?.meeting_url,
        //       hostDetails: {
        //         hostLink: updatedMeetingHostData?.host_url,
        //         hostingPassword,
        //         hostType: meetingDetails?.hostDetails?.hostType,
        //       },
        //       // linkType,
        //     },
        //   },

        //   {
        //     new: true,
        //   }
        // );
        console.log(updatedMeeting);

        const meetingHostDeatils = {
          meetingDateTime: updatedMeetingHostData.startTime,
          // meetingLink: meetingHostData.meeting_url,
        };
        // const meetingHostDatas = new meetingHostDetails(meetingHostDeatils);
        // await meetingHostDatas.save();

        await meetingHostDetails.findByIdAndUpdate(
          {
            _id: new ObjectId(updatedMeetingHostData.id),
            meetingId: new ObjectId(updatedMeeting?._id),
          },

          {
            $set: meetingHostDeatils,
          },

          {
            new: true,
          }
        );
      }
    }

    if (data.attendees?.length !== 0 && meetingDetails) {
      data.attendees.map(async (attendee) => {
        // const logo = process.env.LOGO;
        const organizationDetails = await Organization.findOne({
          _id: meetingDetails.organizationId,
        });
        const logo = organizationDetails?.dashboardLogo
          ? `${BASE_URL}/${organizationDetails.dashboardLogo.replace(/\\/g, "/")}`
          : process.env.LOGO;

        const attendeeData = meetingDetails?.attendees
          .map((attendee) => {
            return `${attendee.name}(${attendee.email})`;
          })
          .join(", ");
        const agendaData = meetingDetails?.agendasDetail
          .map((agenda) => {
            return `<table style="border: 1px solid black;border-collapse: collapse; width:100%;color:black;margin-top:5px;">
        <tr style="border: 1px solid black;border-collapse: collapse;" >
        <td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;" colspan="6">
        Agenda Title
        </td>
        <td colspan="6" style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;">${agenda.title
              }</td>
        </tr>
        ${agenda.topic !== (null || "")
                ? `<tr style="border: 1px solid black;border-collapse: collapse;">
              <td
                style="border: 1px solid black;border-collapse: collapse; width:20%;padding:3px;"
                colspan="6"
              >
                Topic to Discuss
              </td>
              <td
                colspan="6"
                style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;"
              >
                <p>${agenda.topic}</p>
              </td>
            </tr>`
                : `<tr style={{display:"none"}}></tr>`
              }
           ${agenda.timeLine !== (null || "" || 0)
                ? `<tr style="border: 1px solid black;border-collapse: collapse; ">
                 <td
                   style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;"
                   colspan="6"
                 >
                   Timeline
                 </td>
                 <td
                   colspan="6"
                   style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;"
                 >
                   ${agenda.timeLine} Mins
                 </td>
               </tr>`
                : `<tr style={{display:"none"}}></tr>`
              }
        </table><br />`;
          })
          .join(" ");

        // let finalMeetingLink = null;
        // let meetingLinkCode = null;
        // if (isUpdated) {
        //   finalMeetingLink =
        //     isUpdated?.hostDetails?.hostType === "ZOOM"
        //       ? isUpdated?.hostDetails?.hostLink?.split("?")[0]
        //       : isUpdated?.link;
        //   meetingLinkCode = isUpdated?.hostDetails?.hostingPassword
        //     ? isUpdated?.hostDetails?.hostingPassword
        //     : null;
        // }

        // //  console.log("updatedMeeting==============", updatedMeeting);
        // console.log("finalMeetingLink==============", finalMeetingLink);
        // console.log("meetingLinkCode==============", meetingLinkCode);

        let finalMeetingLink = null;
        let meetingLinkCode = null;

        finalMeetingLink =
          isUpdated?.hostDetails?.hostType === "ZOOM"
            ? isUpdated?.hostDetails?.hostLink
            : isUpdated?.link;
        meetingLinkCode = isUpdated?.hostDetails?.hostingPassword
          ? isUpdated?.hostDetails?.hostingPassword
          : null;

        // console.log("meeting==============", meeting);
        // console.log("updatedMeeting==============", updatedMeeting);
        console.log("finalMeetingLink==============", finalMeetingLink);
        console.log("meetingLinkCode==============", meetingLinkCode);

        //  const hostKey =
        //         meeting?.createdById?.toString() ==
        //           attendeeData?._id?.toString() &&
        //         singleMeetingDetails?.hostDetails?.hostLink
        //           ? singleMeetingDetails?.hostDetails?.hostLink?.split("?")[0]
        //
        //         : singleMeetingDetails?.link;
        let hostKey = null;

        const attendeeDetails = await Employee.findOne(
          { _id: new ObjectId(attendee?._id), isActive: true },
          { _id: 1, isAdmin: 1 }
        );
        const isAdmin = attendeeDetails?.isAdmin
          ? attendeeDetails?.isAdmin
          : false;
        if (
          (isAdmin ||
            isUpdated?.createdById?.toString() == attendee?._id?.toString()) &&
          isUpdated?.hostDetails?.hostType === "ZOOM"
        ) {
          finalMeetingLink = isUpdated?.hostDetails?.hostLink;
          const organizationHostingDetails = await HostingDetails.findOne({
            organizationId: isUpdated?.organizationId,
            isActive: true,
          });
          console.log(
            "organizationHostingDetails==============",
            organizationHostingDetails
          );
          if (organizationHostingDetails) {
            hostKey = commonHelper.decryptWithAES(
              organizationHostingDetails?.zoomCredentials?.hostKey
            );
          }
        }
        console.log("hostKey==============", hostKey);

        // mailData = await emailTemplates.sendScheduledMeetingEmailTemplate(
        //   meeting,
        //   commonHelper.convertFirstLetterOfFullNameToCapital(attendee.name),
        //   logo,
        //   agendaData,
        //   attendeeData,
        //   attendee,
        //    meetingLinkCode,
        //   finalMeetingLink,
        //   hostKey
        //   // (meetingLink =
        //   //   meeting?.createdById?.toString() == attendee?._id?.toString()
        //   //     ? hostLink
        //   //     : meetingLink)
        // );

        // const logo = process.env.LOGO;
        // const mailData = await emailTemplates.reSendScheduledMeetingEmailTemplate(
        //   meetingDetails,
        //   commonHelper.convertFirstLetterOfFullNameToCapital(attendee.name),
        //   logo,
        //   agendaData,
        //   attendeeData,
        //   attendee,
        //   attendee?.rsvp,
        //   meetingLinkCode,
        //   finalMeetingLink,
        //   hostKey
        // );

        const mailData =
          await emailTemplates.sendReScheduledMeetingEmailTemplate(
            meetingDetails,
            commonHelper.convertFirstLetterOfFullNameToCapital(attendee.name),
            logo,
            agendaData,
            attendeeData,
            attendee,
            meetingLinkCode,
            finalMeetingLink,
            hostKey
          );
        // const emailSubject = await emailConstants.reScheduleMeetingSubject(
        //   meetingDetails
        // );
        const { emailSubject, mailData: mailBody } = mailData;

        emailService.sendEmail(
          attendee.email,
          "Meeting Rescheduled",
          emailSubject,
          mailBody
        );
      });
    }

    let allowedUsers = [new ObjectId(userId), meetingDetails?.createdById];
    meetingDetails?.attendees?.map((attendee) => {
      allowedUsers.push(attendee._id);
    });
    const notificationData = {
      title: "MEETING RESCHEDULED",
      organizationId: new ObjectId(meetingDetails?.organizationId),
      meetingId: meetingDetails?._id,
      byUserId: new ObjectId(userId),
      details: {
        byDetails: `Meeting is rescheduled by `,
        toDetails: null,
      },
      allowedUsers,
    };
    const addNotification = await notificationService.createNotification(
      notificationData
    );

    let logDetails = await commonHelper.generateLogObjectForRescheduleMeeting(
      isUpdated,
      userId,
      data
    );
    if (logDetails.length !== 0) {
      const logData = {
        moduleName: logMessages.Meeting.moduleName,
        userId,
        action: logMessages.Meeting.reScheduleMeeting,
        ipAddress,
        details: logDetails.join(" , "),
        subDetails: ` Meeting Title: ${meetingDetails.title} (${meetingDetails.meetingId})`,
        organizationId: isUpdated.organizationId,
      };
      await logService.createLog(logData);
    }
  }
  ///////////////////LOGER END
  return isUpdated;
};
/**FUNC- TO RESCHEDULE MEETING */

const giveMomWritePermission = async (id, userId, data, ipAddress = "1000") => {
  const isUpdated = await Meeting.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { attendees: data.attendees } }
  );

  if (isUpdated) {
    const currentAttendees = isUpdated.attendees.filter(
      (attendee) => attendee.canWriteMOM
    );

    const newAttendees = data.attendees.filter(
      (attendee) =>
        attendee._id !== isUpdated.createdById.toString() &&
        attendee._id !== userId.toString()
    );

    const ids = newAttendees.map((attendee) => attendee._id.toString());
    const allUsers = await Employee.find(
      { _id: { $in: ids } },
      { _id: 1, name: 1, email: 1 }
    );

    const addedUsersDetails = newAttendees
      .filter(
        (attendee) =>
          attendee.canWriteMOM &&
          !currentAttendees.some(
            (oldAttendee) =>
              oldAttendee._id.toString() === attendee._id.toString()
          )
      )
      .map((item) =>
        allUsers.find((user) => user._id.toString() === item._id.toString())
      )
      .filter((user) => user);

    // const removedUsersDetails = currentAttendees
    //   .filter(oldAttendee => !newAttendees.some(attendee => attendee._id.toString() === oldAttendee._id.toString()))
    //   .map(item => allUsers.find(user => user._id.toString() === item._id.toString()))
    //   .filter(user => user);

    const removedUsersDetails = currentAttendees
      .filter(
        (oldAttendee) =>
          !newAttendees.some(
            (attendee) =>
              attendee._id.toString() === oldAttendee._id.toString() &&
              attendee.canWriteMOM
          )
      )
      .map((item) =>
        allUsers.find((user) => user._id.toString() === item._id.toString())
      )
      .filter((user) => user);

    console.log("addedUsersDetails----->>>>>", addedUsersDetails);
    console.log("removedUsersDetails-->>>>>>>>>>", removedUsersDetails);
    const logDetails = await commonHelper.generateLogObjectForMOMWrite(
      isUpdated,
      userId,
      data,
      addedUsersDetails,
      removedUsersDetails
    );

    console.log("logDetails-------->", logDetails);

    if (logDetails) {
      const logData = {
        moduleName: logMessages.Meeting.moduleName,
        userId,
        action: logMessages.Meeting.updateMOMWrite,
        ipAddress,
        details: logDetails,
        subDetails: `Meeting Title: ${isUpdated.title} (${isUpdated.meetingId})`,
        organizationId: isUpdated.organizationId,
      };
      console.log("log Data", logData);
      const logresult = await logService.createLog(logData);
      console.log("Log result---------->>>>", logresult);
    }
  }
  return isUpdated;
};

/**FUNC- TO GET MEETING TIMELINE LIST */
const getTimelineList = async (meetingId, userId, ipAddress) => {
  const meetingResult = await Meeting.aggregate([
    {
      $match: {
        _id: new ObjectId(meetingId),
        isActive: true,
      },
    },
    {
      $lookup: {
        from: "minutes",
        localField: "_id",
        foreignField: "meetingId",
        as: "minutesDetails",
      },
    },
  ]);
  let parentId = meetingResult[0].parentMeetingId
    ? meetingResult[0].parentMeetingId
    : meetingResult[0]._id;
  const result = await Meeting.aggregate([
    {
      $match: {
        parentMeetingId: new ObjectId(parentId),
        isActive: true,
      },
    },
    {
      $lookup: {
        from: "meetings",
        localField: "parentMeetingId",
        foreignField: "_id",
        as: "parentMeetingDetails",
      },
    },
    {
      $lookup: {
        from: "minutes",
        localField: "_id",
        foreignField: "meetingId",
        as: "minutesDetails",
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        meetingId: 1,
        meetingCloseDetails: 1,
        parentMeetingId: 1,
        fromTime: 1,
        toTime: 1,
        actualFromTime: 1,
        actualToTime: 1,
        parentMeetingDetails: {
          title: 1,
          meetingId: 1,
          meetingCloseDetails: 1,
          _id: 1,
          parentMeetingId: 1,
          createdById: 1,
          date: 1,
          fromTime: 1,
          toTime: 1,
        },
        minutesDetails: {
          _id: 1,
          description: 1,
        },
      },
    },
    { $unwind: "$parentMeetingDetails" },
  ]);
  const resultDetails = {
    parentMeetingDetails: null,
    followonMeetingDetails: [],
  };
  if (result.length !== 0) {
    const newItemObject2 = result.map((item) => {
      const newObject = {
        parentMeetingId: item.parentMeetingDetails.parentMeetingId,
        meetingId: item.parentMeetingDetails.meetingId,
        createdById: item.parentMeetingDetails.createdById,
        title: item.parentMeetingDetails.title,
        _id: item.parentMeetingDetails._id,
        closedAtTime: commonHelper.formatDateTimeFormat(
          item?.parentMeetingDetails?.meetingCloseDetails?.closedAt
        ).formattedTime,
        closedAtDate: commonHelper.formatDateTimeFormat(
          item?.parentMeetingDetails?.meetingCloseDetails?.closedAt
        ).formattedDate,
        isMinuteAdded:
          meetingResult[0]?.minutesDetails?.length !== 0 ? true : false,
        actualDate: item.parentMeetingDetails.date,
        date: commonHelper.formatDateTimeFormat(item.parentMeetingDetails.date)
          .formattedDate,
        fromTime: commonHelper.formatTimeFormat(
          item.parentMeetingDetails.fromTime
        ),
        toTime: commonHelper.formatTimeFormat(item.parentMeetingDetails.toTime),
        actualFromTime: item.parentMeetingDetails.fromTime,
        actualToTime: item.parentMeetingDetails.toTime,
      };
      resultDetails.parentMeetingDetails = newObject;
      delete item.parentMeetingDetails;

      const newItemObject = {
        parentMeetingId: item.parentMeetingId,
        meetingId: item.meetingId,
        title: item.title,
        _id: item._id,
        closedAtTime: commonHelper.formatDateTimeFormat(
          item?.meetingCloseDetails?.closedAt
        ).formattedTime,
        closedAtDate: commonHelper.formatDateTimeFormat(
          item?.meetingCloseDetails?.closedAt
        ).formattedDate,
        isMinuteAdded: item.minutesDetails.length !== 0 ? true : false,
      };
      return newItemObject;
    });
    resultDetails.followonMeetingDetails = [
      resultDetails.parentMeetingDetails,
      ...newItemObject2,
    ];
    return resultDetails;
  }
  const newObject = {
    parentMeetingId: meetingResult[0].parentMeetingId,
    meetingId: meetingResult[0].meetingId,
    title: meetingResult[0].title,
    _id: meetingResult[0]._id,
    createdById: meetingResult[0].createdById,
    closedAtTime: commonHelper.formatDateTimeFormat(
      meetingResult[0].meetingCloseDetails?.closedAt
    ).formattedTime,
    closedAtDate: commonHelper.formatDateTimeFormat(
      meetingResult[0].meetingCloseDetails?.closedAt
    ).formattedDate,
    isMinuteAdded: meetingResult[0].minutesDetails,
    actualDate: meetingResult[0].date,
    date: commonHelper.formatDateTimeFormat(meetingResult[0].date)
      .formattedDate,
    fromTime: commonHelper.formatTimeFormat(meetingResult[0].fromTime),
    toTime: commonHelper.formatTimeFormat(meetingResult[0].toTime),
    actualFromTime: meetingResult[0].fromTime,
    actualToTime: meetingResult[0]?.toTime,
  };
  resultDetails.parentMeetingDetails = newObject;
  resultDetails.followonMeetingDetails = [resultDetails.parentMeetingDetails];
  return resultDetails;
};
/**FUNC- TO UPDATE MEETING STATUS MEETING */
const updateMeetingStatus = async (id, data) => {
  const isUpdated = await Meeting.findOneAndUpdate(
    {
      _id: new ObjectId(id),
      momGenerationDetails: { $exists: true, $not: { $size: 0 } },
    },
    {
      $set: {
        "meetingStatus.status": data.meetingStatus,
      },
    }
  );
  return isUpdated;
};
/**FUNC- TO VIEW ALL PARENTS AGENDA WITH MINUTES OF SINGLE MEETING DETAILS**/
const viewParentAgendas = async (childMeetingId, userId) => {
  const childMeetingData = await Meeting.findOne(
    { _id: new ObjectId(childMeetingId), isActive: true },
    { _id: 1, parentMeetingId: 1, followOnSerialNo: 1, title: 1 }
  );
  console.log("childMeetingData--------", childMeetingData);
  if (childMeetingData?.parentMeetingId) {
    const meetingIds = await Meeting.find(
      {
        isActive: true,
        _id: { $ne: childMeetingId },
        $or: [
          {
            parentMeetingId: new ObjectId(childMeetingData?.parentMeetingId),
          },
          { _id: new ObjectId(childMeetingData?.parentMeetingId) },
        ],
        followOnSerialNo: {
          $lt: childMeetingData.followOnSerialNo,
        },
      },
      { _id: 1, createdById: 1 }
    );
    console.log("meetingIds--------", meetingIds);
    const ids = meetingIds.map((item) => {
      return item._id;
    });
    const pipeLine = [
      {
        $match: {
          meetingId: { $in: ids },
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
            {
              $match: {
                isActive: true,
                isAction: true,
                isApproved: false,
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
          from: "momacceptstatuses",
          localField: "meetingDetail._id",
          foreignField: "meetingId",
          as: "momAcceptDetails",
        },
      },

      {
        $project: {
          _id: 1,
          title: 1,
          timeLine: 1,
          topic: 1,
          meetingId: 1,
          organizationId: 1,
          meetingId: 1,
          meetingDetail: {
            followOnSerialNo: 1,
            parentMeetingId: 1,
            title: 1,
            _id: 1,
            attendees: 1,
            mode: 1,
            link: 1,
            date: 1,
            fromTime: 1,
            toTime: 1,
            locationDetails: 1,
            meetingId: 1,
            momGenerationDetails: 1,
            createdById: 1,
          },
          minutesDetail: {
            _id: 1,
            meetingId: 1,
            agendaId: 1,
            title: 1,
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
            isCancelled: 1,
            sequence: 1,
          },
          assignedUserIdDetails: {
            _id: 1,
            email: 1,
            name: 1,
          },
          attendeesDetail: {
            email: 1,
            _id: 1,
            name: 1,
            isEmployee: 1,
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
          },
        },
      },
      { $group: { _id: "$meetingDetail", agendas: { $push: "$$ROOT" } } },
    ];
    let meetingData = await Agenda.aggregate(pipeLine);
    console.log("meetingData-----------222222222222222-------", meetingData);

    console.log("meetingData--------3456778----------", meetingData[0].agendas);

    let agendaData = [];
    if (meetingData.length !== 0) {
      meetingData.map((data) => {
        const agendaDatas = data.agendas
          .filter((minute) => minute?.minutesDetail?.length != 0)
          .map((item) => {
            item.minutesDetail.map((minute) => {
              const assignedUserDetails = item.assignedUserIdDetails.find(
                (user) =>
                  user._id.toString() === minute?.assignedUserId?.toString()
              );
              minute["assignedUserDetails"] = assignedUserDetails;
              return minute;
            });
            item.minutesDetail = item?.minutesDetail.sort(
              (a, b) => a?.sequence - b?.sequence
            );
            return item;
          });
        console.log("agendaDatas==================", agendaDatas);
        agendaData.push(...agendaDatas);
        data.agendas = agendaDatas;
        return data;
      });

      console.log("agendaData-----777777777777777777777777777--", agendaData);
      // meetingData[0].agendas=agendaData
      //  mmmmmmmmmmmmmm
      console.log(
        "meetingData-----------rrrrrrrrrrrrrrrrrrrr-------",
        meetingData
      );
      meetingData = meetingData.sort(
        (a, b) => b?._id?.followOnSerialNo - a?._id?.followOnSerialNo
      );
      agendaData = agendaData.sort(
        (a, b) =>
          a?.meetingDetail?.followOnSerialNo -
          b?.meetingDetail?.followOnSerialNo
      );
      return meetingData;
    } else {
      return [];
    }

    // if (meetingData.length !== 0) {
    //   const meetingDataObject = {
    //     agendaDetails: [],
    //   };
    //   meetingData.map((data) => {
    //     if (!meetingDataObject.meetingDetail) {
    //       data.meetingDetail.attendees.map((item) => {
    //         const attendeeData = data.attendeesDetail.find(
    //           (attendee) => attendee._id.toString() == item._id.toString()
    //         );
    //         item.name = attendeeData.name;
    //         item.email = attendeeData.email;
    //         item.isEmployee = attendeeData.isEmployee;
    //         item.isAttended = item.isAttended;
    //         if (item._id.toString() == userId.toString()) {
    //           data.meetingDetail["canWriteMOM"] = item.canWriteMOM;
    //         }
    //         return item;
    //       });
    //       data.meetingDetail.fromTime = commonHelper.formatTimeFormat(
    //         data.meetingDetail.fromTime
    //       );

    //       data.meetingDetail.toTime = commonHelper.formatTimeFormat(
    //         data.meetingDetail.toTime
    //       );
    //       data["meetingUniqueId"] = data.meetingDetail.meetingId;
    //       meetingDataObject.meetingDetail = data.meetingDetail;

    //       meetingDataObject.meetingDetail["roomDetail"] = data.roomDetail;

    //       meetingDataObject.meetingDetail["momAcceptDetails"] =
    //         data.momAcceptDetails;
    //     }
    //     let acceptRejectStatus = null;
    //     if (data.minutesDetail.length !== 0) {
    //       data.minutesDetail.map((minute) => {
    //         const assignedUserDetails = data.assignedUserIdDetails.find(
    //           (user) =>
    //             user._id.toString() === minute?.assignedUserId?.toString()
    //         );
    //         minute.attendees.map((attendee) => {
    //           const attendeeData = data.attendeesDetail.find(
    //             (user) => user._id.toString() === attendee.id.toString()
    //           );
    //           attendee["email"] = attendeeData?.email;
    //           attendee["name"] = attendeeData?.name;
    //           if (attendee?.id.toString() === userId) {
    //             acceptRejectStatus = attendee?.status;
    //           }

    //           return attendee;
    //         });
    //         minute["acceptRejectStatus"] = acceptRejectStatus;
    //         minute["assignedUserDetails"] = assignedUserDetails;
    //         minute?.amendmentDetails?.length > 0 &&
    //           minute.amendmentDetails.map((amendment) => {
    //             const amendmentDetails = data.attendeesDetail.find(
    //               (attendee) =>
    //                 attendee._id.toString() == amendment.createdById.toString()
    //             );
    //             amendment["name"] = amendmentDetails.name;
    //             return amendment;
    //           });
    //         return minute;
    //       });
    //       data.minutesDetail = data?.minutesDetail.sort(
    //         (a, b) => a?.sequence - b?.sequence
    //       );
    //     }

    //     delete data.meetingDetail;
    //     delete data.momAcceptDetails;
    //     delete data.roomDetail;
    //     delete data.attendeesDetail;
    //     delete data.assignedUserIdDetails;
    //     meetingDataObject.agendaDetails.push(data);
    //   });
    //   return meetingDataObject;
    // }
  }
  return [];
};
/**FUNC- TO VIEW ALL PARENTS AGENDA WITH MINUTES OF SINGLE MEETING DETAILS**/
const viewMeetingStatistics = async (organizationId, userId, userData) => {
  let query = {
    organizationId: new ObjectId(organizationId),
    isActive: true,
    $and: [
      {
        $or: [
          {
            "meetingStatus.status": "scheduled",
          },
          {
            "meetingStatus.status": "closed",
          },
          {
            "meetingStatus.status": "rescheduled",
          },
          {
            "meetingStatus.status": "cancelled",
          },
        ],
      },
    ],
  };
  let minuteQuery = {
    isActive: true,
    isActive: true,
  };
  if (!userData?.isAdmin) {
    const meetingIds = await meetingService.getMeetingIdsOfCreatedById(userId);

    query["$or"] = [
      { "attendees._id": new ObjectId(userId) },
      { createdById: new ObjectId(userId) },
    ];
    minuteQuery["$or"] = [
      { assignedUserId: new ObjectId(userId) },
      { createdById: new ObjectId(userId) },
      { meetingId: { $in: meetingIds } },
    ];
  }
  const meetingData = await Meeting.aggregate([
    {
      $match: query,
    },
    {
      $lookup: {
        from: "minutes",
        localField: "_id",
        foreignField: "meetingId",
        pipeline: [
          {
            $match: {
              isActive: true,
              isAction: true,
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
          {
            $match: minuteQuery,
          },
        ],
        as: "minutesDetail",
      },
    },

    {
      $project: {
        _id: 1,
        meetingId: 1,
        title: 1,
        date: 1,
        fromTime: 1,
        meetingStatus: 1,
        minutesDetail: {
          _id: 1,
          title: 1,
          description: 1,
          meetingId: 1,
          priority: 1,
          isAction: 1,
          isActive: 1,
          isComplete: 1,
          isCancelled: 1,
          assignedUserId: 1,
          createdById: 1,
          actionStatus: 1,
        },
      },
    },
  ]);

  let upcommingMeetings = 0;
  let totalClosedMeetings = 0;
  let totalCancelledMeetings = 0;
  let totalMeetings = meetingData.length;
  let totalAction = 0;
  let totalDueAction = 0;
  let totalHighPriorityDueAction = 0;
  let totalLowPriorityDueAction = 0;
  let totalMediumPriorityDueAction = 0;
  let totalHighPriorityAction = 0;
  let totalLowPriorityAction = 0;
  let totalNormalPrioprityAction = 0;

  let totalCancelledAction = 0;
  let totalCompletedAction = 0;
  let actionIds = [];
  console.log("meetingData===============================", meetingData);

  if (meetingData.length !== 0) {
    meetingData.map((meeting) => {
      const meetingDateTime = commonHelper
        .combineDateAndTime(meeting.date, meeting.fromTime)
        .getTime();

      const currentDate = commonHelper.convertIsoFormat(new Date());
      const currentDateTime = new Date(currentDate);
      console.log("currentDateTime==================", currentDate);
      console.log("currentDateTime==================", currentDateTime);
      console.log(
        "currentDateTime==================",
        new Date(currentDateTime).getTime()
      );
      console.log("meetingDateTime==================", meetingDateTime);
      // console.log("meetingDateTime==================",new Date(currentDateTime) .getTime());
      //  uvnsliufdvnhaps;dhvn;aisd
      // Calculate the time difference between the meeting and current time
      const diffTime = meetingDateTime - currentDateTime;

      // Log for debugging purposes
      console.log("Current Date and Time (ms):", currentDateTime);
      console.log("Meeting Date and Time (ms):", meetingDateTime);
      console.log("Time Difference (ms):", diffTime);

      // Check if the meeting is upcoming
      if (diffTime > 0 && meeting?.meetingStatus?.status !== "cancelled") {
        // Meeting is in the future
        upcommingMeetings += 1;
        console.log(
          `Upcoming Meeting detected. Total upcoming meetings: ${upcommingMeetings}`
        );
      } else {
        // Meeting has already passed
        console.log("This meeting has already passed.");
      }

      console.log(
        " meeting?.meetingStatus?.status=====================",
        meeting?.meetingStatus?.status
      );
      totalClosedMeetings =
        meeting?.meetingStatus?.status === "closed"
          ? totalClosedMeetings + 1
          : totalClosedMeetings;
      totalCancelledMeetings =
        meeting?.meetingStatus?.status === "cancelled"
          ? totalCancelledMeetings + 1
          : totalCancelledMeetings;
      if (meeting?.minutesDetail?.length !== 0) {
        meeting?.minutesDetail
          ?.filter((minute) => minute.actionStatus !== "REASSIGNED")
          .map((action) => {
            console.log("action====================================", action);

            totalAction = totalAction + 1;
            if (action.isComplete == false && action.isCancelled == false) {
              totalDueAction = totalDueAction + 1;
              actionIds.push(action);
            }

            if (
              action.priority == "HIGH" &&
              action.isComplete == false &&
              action.isCancelled === false
            ) {
              totalHighPriorityDueAction = totalHighPriorityDueAction + 1;
            }
            if (
              action.priority == "HIGH"
              // && action.isCancelled === false
            ) {
              totalHighPriorityAction = totalHighPriorityAction + 1;
            }
            if (
              action.priority == "LOW" &&
              action.isComplete == false &&
              action.isCancelled === false
            ) {
              totalLowPriorityDueAction = totalLowPriorityDueAction + 1;
            }

            if (
              action.priority == "LOW"
              // && action.isCancelled === false
            ) {
              totalLowPriorityAction = totalLowPriorityAction + 1;
            }

            if (
              action.priority == "NORMAL" &&
              action.isComplete == false &&
              action.isCancelled === false
            ) {
              totalMediumPriorityDueAction = totalMediumPriorityDueAction + 1;
            }

            if (
              action.priority == "NORMAL"
              // && action.isCancelled === false
            ) {
              totalNormalPrioprityAction = totalNormalPrioprityAction + 1;
            }

            if (action.isComplete == false && action.isCancelled === true) {
              totalCancelledAction = totalCancelledAction + 1;
            }

            if (action.isComplete == true && action.isCancelled === false) {
              totalCompletedAction = totalCompletedAction + 1;
            }
          });
      }
    });
  }
  console.log(actionIds);
  return {
    totalMeetings,
    upcommingMeetings,
    totalAction,
    totalMediumPriorityDueAction,
    totalLowPriorityDueAction,
    totalHighPriorityDueAction,
    totalDueAction,
    totalClosedMeetings,
    totalCancelledMeetings,
    totalNormalPrioprityAction,
    totalLowPriorityAction,
    totalHighPriorityAction,
    totalCompletedAction,
    totalCancelledAction,
  };
};

const sendAlertTime = async () => {
  console.log("cron jon-----------------");
  const alertTimeDetails = await Config.find(
    { isActive: true },
    { mettingReminders: 1, _id: 1, organizationId: 1 }
  );
  if (alertTimeDetails?.length !== 0) {
    alertTimeDetails.map(async (data) => {
      // console.log("config details-------", data);
      const organizationId = data.organizationId;
      const meetingDetails = await Meetings.find(
        {
          isActive: true,
          organizationId,
          date: {
            $gte: new Date().toISOString().split("T")[0], // Greater than or equal to startDate
            $lte: new Date().toISOString().split("T")[0], // Less than or equal to endDate
          },
          $or: [
            {
              "meetingStatus.status": "scheduled",
            },
            {
              "meetingStatus.status": "rescheduled",
            },
          ],
        },
        {
          _id: 1,
          attendees: 1,
          date: 1,
          fromTime: 1,
          toTime: 1,
          createdById: 1,
          title: 1,
          link: 1,
          meetingStatus: 1,
          organizationId: 1,
          hostDetails: 1,
        }
      );
      // console.log("meetingDetails------------", meetingDetails);
      // ddddddddddd
      if (meetingDetails?.length !== 0) {
        meetingDetails.map(async (meeting) => {
          let hostingPassword = null;
          let hours = meeting?.fromTime?.split(":")[0];
          let minutes = meeting?.fromTime?.split(":")[1];

          let meetingDateTime = hours * 60 * 60 * 1000 + minutes * 60 * 1000;

          const currentDateTime = commonHelper.convertIsoFormat(new Date());

          const diffHours = data?.mettingReminders?.hours * 60 * 60 * 1000;
          const diffMinutes = data?.mettingReminders?.minutes * 60 * 1000;
          const settingDiffTime = diffHours + diffMinutes;

          const currentHours =
            new Date(currentDateTime).getUTCHours() * 60 * 60 * 1000;
          const currentMinutes =
            new Date(currentDateTime).getUTCMinutes() * 60 * 1000;
          const currentDateTimeInMilliseconds = currentHours + currentMinutes;

          const timeDifferenceBetweenMeetingCurrent =
            meetingDateTime - currentDateTimeInMilliseconds;
          // console.log(
          //   "timeDifferenceBetweenMeetingCurrent---------179---------",
          //   timeDifferenceBetweenMeetingCurrent
          // );
          // if (meeting.attendees.length !== 0 && currentDateTimeInMilliseconds <= settingDiffTime) {
          // }
          if (
            settingDiffTime >= timeDifferenceBetweenMeetingCurrent &&
            timeDifferenceBetweenMeetingCurrent >= 0
          ) {
            console.log("innnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn---------");
            if (meeting.attendees.length !== 0) {
              console.log("innnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn------2---");
              meeting.attendees.map(async (attendeeData) => {
                console.log("innnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn----3-----");
                const empDetails = await Employee.findOne(
                  {
                    isActive: true,
                    _id: new ObjectId(attendeeData._id),
                  },
                  { id: 1, email: 1, name: 1 }
                );
                const email = empDetails.email;
                const name = empDetails.name;
                const userId = meeting.createdById;
                const createdByDetail = await Employee.findOne({
                  isActive: true,
                  _id: new ObjectId(userId),
                });
                const createdByName = createdByDetail.name;
                const attendeeDetails = empDetails;
                // const logo = process.env.LOGO;
                const singleMeetingDetails = await viewMeeting(
                  meeting?._id,
                  userId
                );
                // console.log(
                //   "singleMeetingDetails----------------------------",
                //   singleMeetingDetails
                // );
                const attendeesData = singleMeetingDetails?.attendees
                  .map((attendee) => {
                    return `${attendee.name}(${attendee.email})`;
                  })
                  .join(", ");

                // const agendaData = singleMeetingDetails?.agendasDetail
                //   .map((agenda) => {
                //     return `<table style="border: 1px solid black;border-collapse: collapse; width:100%;color:black;margin-top:5px;">
                //     <tr style="border: 1px solid black;border-collapse: collapse;" >
                //     <td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;" colspan="6">
                //     Agenda Title
                //     </td>
                //     <td colspan="6" style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;">${
                //       agenda.title
                //     }</td>
                //     </tr>
                //     ${
                //       agenda.topic !== (null || "")
                //         ? `<tr style="border: 1px solid black;border-collapse: collapse;">
                //           <td
                //             style="border: 1px solid black;border-collapse: collapse; width:20%;padding:3px;"
                //             colspan="6"
                //           >
                //             Topic to Discuss
                //           </td>
                //           <td
                //             colspan="6"
                //             style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;"
                //           >
                //             <p>${agenda.topic}</p>
                //           </td>
                //         </tr>`
                //         : `<tr style={{display:"none"}}></tr>`
                //     }
                //        ${
                //          agenda.timeLine !== (null || "" || 0)
                //            ? `<tr style="border: 1px solid black;border-collapse: collapse; ">
                //              <td
                //                style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;"
                //                colspan="6"
                //              >
                //                Timeline
                //              </td>
                //              <td
                //                colspan="6"
                //                style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;"
                //              >
                //                ${agenda.timeLine} Mins
                //              </td>
                //            </tr>`
                //            : `<tr style={{display:"none"}}></tr>`
                //        }
                //     </table><br />`;
                //   })
                //   .join(" ");
                const agendaData = singleMeetingDetails?.agendasDetail
                  .map((agenda) => {
                    return `<table style="border: 1px solid black;border-collapse: collapse; width:100%;color:black;margin-top:5px;">
              <tr style="border: 1px solid black;border-collapse: collapse;" >
              <td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;" colspan="4">
              Agenda Title
              </td>
              <td colspan="" style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;">${agenda.title
                      }</td>
              </tr>
              ${agenda.topic !== (null || "")
                        ? `<tr style="border: 1px solid black;border-collapse: collapse;">
                    <td
                      style="border: 1px solid black;border-collapse: collapse; width:20%;padding:3px;"
                      colspan="4"
                    >
                      Topic to Discuss
                    </td>
                    <td
                      colspan="8"
                      style="border: 1px solid black;border-collapse: collapse;width:50%;"
                    >
                    
                     ${agenda.topic
                          .replace(/<\/?h[1-6]>/g, (match) => {
                            return match.startsWith("</")
                              ? "</p>"
                              : '<p style="margin:0px;padding:1px">';
                          })
                          .replace(/<br\s*\/?>/g, "")
                          .replace(/<\/p>(?!.*<\/p>)/, "</span>")
                          .replace(/<p>(?!.*<p>)/, "<span>")}
                    </td>
                  </tr>`
                        : `<tr style={{display:"none"}}></tr>`
                      }
                 ${agenda.timeLine !== (null || "" || 0)
                        ? `<tr style="border: 1px solid black;border-collapse: collapse; ">
                       <td
                         style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;"
                         colspan="4"
                       >
                         Timeline
                       </td>
                       <td
                         colspan="8"
                         style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;"
                       >
                         ${agenda.timeLine} Mins
                       </td>
                     </tr>`
                        : `<tr style={{display:"none"}}></tr>`
                      }
              </table><br />`;
                  })
                  .join(" ");
                const meetingLink =
                  meeting?.createdById?.toString() ==
                    attendeeData?._id?.toString() &&
                    singleMeetingDetails?.hostDetails?.hostLink
                    ? singleMeetingDetails?.hostDetails?.hostLink?.split("?")[0]
                    : singleMeetingDetails?.link;
                const mailData =
                  await emailTemplates.meetingRemindersEmailTemplate(
                    singleMeetingDetails,
                    createdByDetail,
                    logo,
                    empDetails,
                    agendaData,
                    attendeesData,
                    meetingLink
                  );
                const emailSubject = await emailConstants.sendReminders(
                  meeting
                );
                console.log("innnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn-----4----");
                emailService.sendEmail(
                  email,
                  "Meeting Reminders",
                  emailSubject,
                  mailData
                );
              });
              console.log("innnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn-----5----");
            }
          } else {
            console.log("not in count-------------------------- ");
          }
        });
      }
    });
  }
};
/**FUNC- TO VIEW SINGLE MEETING DETAILS FOR RSVP */
const viewMeetingDetailsForRsvp = async (meetingId, userId) => {
  const meetingData = await Meeting.aggregate([
    {
      $match: {
        _id: new ObjectId(meetingId),
        isActive: true,
      },
    },
    {
      $lookup: {
        from: "organizations",
        localField: "organizationId",
        foreignField: "_id",
        as: "organizationDetails",
      },
    },
    {
      $project: {
        _id: 1,
        createdById: 1,
        attendees: 1,
        meetingId: 1,
        title: 1,
        mode: 1,
        link: 1,
        date: 1,
        fromTime: 1,
        toTime: 1,
        step: 1,
        meetingStatus: 1,
        locationDetails: 1,
        momGenerationDetails: 1,
        organizationDetails: {
          _id: 1,
          name: 1,
          email: 1,
          dashboardLogo: 1,
          loginLogo: 1,
        },
      },
    },
    { $unwind: "$organizationDetails" },
  ]);
  const baseUrl = `${process.env.BASE_URL}`;
  if (meetingData.length !== 0) {
    const meetingObject = meetingData.map((meeting) => {
      meeting.organizationName = meeting?.organizationDetails?.name;
      meeting.organizationEmail = meeting?.organizationDetails?.email;
      meeting.organizationDashboardLogo =
        baseUrl + meeting?.organizationDetails?.dashboardLogo;
      meeting.organizationLoginLogo = baseUrl + meeting?.organizationDetails?.loginLogo;
      delete meeting.organizationDetails;
      return meeting;
    });
    return meetingObject[0];
  }
}

/**FUNC- TO UPDATE RSVP SECTION BY EMAIL */
const updateRsvpByEmail = async (id, userId, data, userData, ipAddress = "1000") => {
  const result = await Meeting.findOneAndUpdate(
    {
      "attendees._id": new ObjectId(userId),
      _id: new ObjectId(id),
    },
    {
      $set: { "attendees.$.rsvp": data.rsvp },
    }
  );
  const inputKeys = Object.keys(data);
  const allowedUsers = [new ObjectId(userId), result?.createdById];
  const notificationData = {
    title: "RSVP UPDATED",
    organizationId: new ObjectId(result?.organizationId),
    meetingId: id,
    byUserId: new ObjectId(userId),
    details: {
      byDetails: `RSVP is updated by `,
      toDetails: null,
    },
    allowedUsers,
  };
  const addNotification = await notificationService.createNotification(
    notificationData
  );
  return result;
};

/**FUNC- SEND MEETING DETAILS TO SINGLE/ALL ATTENDEES */
const sendMeetingDetails = async (userId, data, userData, ipAddress = "1000") => {
  const meetingId = data?.meetingId;
  const requiredAttendees = data.attendees;
  const meetingDetails = await viewMeeting(meetingId, userId);
  if (meetingDetails?.attendees?.length !== 0) {
    const finalAttendees = meetingDetails?.attendees?.filter((o) =>
      requiredAttendees.some((_id) => o?._id?.toString() === _id?.toString())
    );
    finalAttendees.map(async (attendee) => {
      const attendeeData = meetingDetails?.attendees
        .map((attendee) => {
          return `${attendee.name}(${attendee.email})`;
        })
        .join(", ");
      // const agendaData = meetingDetails?.agendasDetail
      //   .map((agenda) => {
      //     return `<table style="border: 1px solid black;border-collapse: collapse; width:100%;color:black;margin-top:5px;">
      // <tr style="border: 1px solid black;border-collapse: collapse;" >
      // <td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;" colspan="6">
      // Agenda Title
      // </td>
      // <td colspan="6" style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;">${
      //   agenda.title
      // }</td>
      // </tr>
      // ${
      //   agenda.topic !== (null || "")
      //     ? `<tr style="border: 1px solid black;border-collapse: collapse;">
      //       <td
      //         style="border: 1px solid black;border-collapse: collapse; width:20%;padding:3px;"
      //         colspan="6"
      //       >
      //         Topic to Discuss
      //       </td>
      //       <td
      //         colspan="6"
      //         style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;"
      //       >
      //         <p>${agenda.topic}</p>
      //       </td>
      //     </tr>`
      //     : `<tr style={{display:"none"}}></tr>`
      // }
      //    ${
      //      agenda.timeLine !== (null || "" || 0)
      //        ? `<tr style="border: 1px solid black;border-collapse: collapse; ">
      //          <td
      //            style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;"
      //            colspan="6"
      //          >
      //            Timeline
      //          </td>
      //          <td
      //            colspan="6"
      //            style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;"
      //          >
      //            ${agenda.timeLine} Mins
      //          </td>
      //        </tr>`
      //        : `<tr style={{display:"none"}}></tr>`
      //    }
      // </table><br />`;
      //   })
      //   .join(" ");
      const agendaData = meetingDetails?.agendasDetail
        .map((agenda) => {
          return `<table style="border: 1px solid black;border-collapse: collapse; width:100%;color:black;margin-top:5px;">
    <tr style="border: 1px solid black;border-collapse: collapse;" >
    <td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;" colspan="4">
    Agenda Title
    </td>
    <td colspan="" style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;">${agenda.title
            }</td>
    </tr>
    ${agenda.topic !== (null || "")
              ? `<tr style="border: 1px solid black;border-collapse: collapse;">
          <td
            style="border: 1px solid black;border-collapse: collapse; width:20%;padding:3px;"
            colspan="4"
          >
            Topic to Discuss
          </td>
          <td
            colspan="8"
            style="border: 1px solid black;border-collapse: collapse;width:50%;"
          >
          
           ${agenda.topic
                .replace(/<\/?h[1-6]>/g, (match) => {
                  return match.startsWith("</")
                    ? "</p>"
                    : '<p style="margin:0px;padding:1px">';
                })
                .replace(/<br\s*\/?>/g, "")
                .replace(/<\/p>(?!.*<\/p>)/, "</span>")
                .replace(/<p>(?!.*<p>)/, "<span>")}
          </td>
        </tr>`
              : `<tr style={{display:"none"}}></tr>`
            }
       ${agenda.timeLine !== (null || "" || 0)
              ? `<tr style="border: 1px solid black;border-collapse: collapse; ">
             <td
               style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;"
               colspan="4"
             >
               Timeline
             </td>
             <td
               colspan="8"
               style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;"
             >
               ${agenda.timeLine} Mins
             </td>
           </tr>`
              : `<tr style={{display:"none"}}></tr>`
            }
    </table><br />`;
        })
        .join(" ");
      let finalMeetingLink = null;
      let meetingLinkCode = null;

      finalMeetingLink =
        meetingDetails?.hostDetails?.hostType === "ZOOM"
          ? meetingDetails?.hostDetails?.hostLink
          : meetingDetails?.link;
      meetingLinkCode = meetingDetails?.hostDetails?.hostingPassword
        ? meetingDetails?.hostDetails?.hostingPassword
        : null;

      // console.log("meeting==============", meeting);
      // console.log("updatedMeeting==============", updatedMeeting);
      console.log("finalMeetingLink==============", finalMeetingLink);
      console.log("meetingLinkCode==============", meetingLinkCode);

      //  const hostKey =
      //         meeting?.createdById?.toString() ==
      //           attendeeData?._id?.toString() &&
      //         singleMeetingDetails?.hostDetails?.hostLink
      //           ? singleMeetingDetails?.hostDetails?.hostLink?.split("?")[0]
      //
      //         : singleMeetingDetails?.link;
      let hostKey = null;

      const attendeeDetails = await Employee.findOne(
        { _id: new ObjectId(attendee?._id), isActive: true },
        { _id: 1, isAdmin: 1 }
      );
      const isAdmin = attendeeDetails?.isAdmin
        ? attendeeDetails?.isAdmin
        : false;
      if (
        (isAdmin ||
          meetingDetails?.createdById?.toString() ==
          attendee?._id?.toString()) &&
        meetingDetails?.hostDetails?.hostType === "ZOOM"
      ) {
        finalMeetingLink = meetingDetails?.hostDetails?.hostLink;
        const organizationHostingDetails = await HostingDetails.findOne({
          organizationId: meetingDetails?.organizationId,
          isActive: true,
        });
        console.log(
          "organizationHostingDetails==============",
          organizationHostingDetails
        );
        if (organizationHostingDetails) {
          hostKey = commonHelper.decryptWithAES(
            organizationHostingDetails?.zoomCredentials?.hostKey
          );
        }
      }
      console.log("hostKey==============", hostKey);

      // mailData = await emailTemplates.sendScheduledMeetingEmailTemplate(
      //   meeting,
      //   commonHelper.convertFirstLetterOfFullNameToCapital(attendee.name),
      //   logo,
      //   agendaData,
      //   attendeeData,
      //   attendee,
      //    meetingLinkCode,
      //   finalMeetingLink,
      //   hostKey
      //   // (meetingLink =
      //   //   meeting?.createdById?.toString() == attendee?._id?.toString()
      //   //     ? hostLink
      //   //     : meetingLink)
      // );

      // const logo = process.env.LOGO;
      const logo = organizationDetails?.dashboardLogo
        ? `${BASE_URL}/${organizationDetails.dashboardLogo.replace(/\\/g, "/")}`
        : process.env.LOGO;

      const mailData = await emailTemplates.reSendScheduledMeetingEmailTemplate(
        meetingDetails,
        commonHelper.convertFirstLetterOfFullNameToCapital(attendee.name),
        logo,
        agendaData,
        attendeeData,
        attendee,
        attendee?.rsvp,
        meetingLinkCode,
        finalMeetingLink,
        userData,
        hostKey
      );
      // const emailSubject = await emailConstants.scheduleMeetingSubject(
      //   meetingDetails
      // );
      const { emailSubject, mailData: mailBody } = mailData;

      emailService.sendEmail(
        attendee.email,
        "Meeting Scheduled",
        emailSubject,
        mailBody
      );
    });
    return true;
  }
  return false;
};
const fetchCurrentAttendeesList = async (organizationId, parentMeetingId) => {
  console.log("parentMeetingId----------", parentMeetingId, organizationId);
  const meetingData = await Meeting.aggregate([
    {
      $match: {
        _id: new ObjectId(parentMeetingId),
        organizationId: new ObjectId(organizationId),
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "attendees._id",
        foreignField: "_id",
        as: "attendeesDetail",
      },
    },
    {
      $project: {
        _id: 1,
        attendeesDetail: {
          email: 1,
          _id: 1,
          name: 1,
          isEmployee: 1,
        },
      },
    },
  ]);
  const attendeeData = meetingData.map((meeting) => {
    return meeting.attendeesDetail;
  });
  const uniqueAttendeeData = [].concat(...attendeeData);
  const filetrData = uniqueAttendeeData.filter(
    (obj, index, self) =>
      index === self.findIndex((o) => JSON.stringify(o) === JSON.stringify(obj))
  );
  return filetrData;
};

const callMeetingHost = async (meeting, linkType) => {
  console.log(linkType);

  let updatedMeeting = null;
  const duration =
    (parseFloat(meeting?.toTime.split(":").join(".")) -
      parseFloat(meeting?.fromTime.split(":").join("."))) *
    60;
  meeting?.toTime.split(":").join(".") - meeting?.fromTime.split(":").join(".");

  const attendeesEmailids = meeting?.attendees.map((item) => {
    return {
      email: item.email,
    };
  });
  const attendeesOnlyEmailids = meeting?.attendees.map((item) => item.email);
  console.log(duration);
  //   fffffffffffff
  let meetingHostData = await meetingStreamingService.createZoomMeetingForMOM(
    meeting?.title,
    Math.abs(duration),
    meeting?.date,
    //agenda,
    //password,
    process.env.TZ,
    attendeesEmailids,
    meeting
  );
  if (meetingHostData) {
    hostingPassword = meetingHostData?.password;
    meetingLink = meetingHostData?.meeting_url;
    hostLink = meetingHostData?.meeting_url;
    const linkTypeData = linkType ? linkType : meeting?.linkType;
    updatedMeeting = await Meeting.findByIdAndUpdate(
      { _id: new ObjectId(meeting?._id) },

      {
        $set: {
          link: meetingHostData?.meeting_url,
          hostDetails: {
            hostLink: meetingHostData?.meeting_url,
            hostingPassword,
            hostType: meeting?.hostDetails?.hostType,
          },
          linkType: linkTypeData,
        },
      },

      {
        new: true,
      }
    );
    console.log(updatedMeeting);

    const meetingHostDeatils = {
      hostedBy: "zoom",
      meetingId: meeting._id,
      hostMeetingId: meetingHostData.id,
      duration: meetingHostData.duration,
      meetingDateTime: meetingHostData.meetingTime,
      attendees: attendeesOnlyEmailids,
      meetingLink: meetingHostData.meeting_url,
      purpose: meetingHostData.purpose,
      // meeting_url: response_data.join_url,
      // meetingTime: response_data.start_time,
      // purpose: response_data.topic,
      // duration: response_data.duration,
      // message: "Success",
      // status: 1,
      // id: response_data.id,
      // password: response_data.password,
    };
    const meetingHostDatas = new meetingHostDetails(meetingHostDeatils);
    await meetingHostDatas.save();
  }
  return updatedMeeting;
};

const getRecordingsZoomMeetingForMOM = async (meetingId) => {
  return await meetingStreamingService.getRecordingsZoomMeetingForMOM(
    meetingId
  );
};

const newMeetingAsRescheduled = async (
  oldMeetingId,
  data,
  userId,
  ipAddress = "1000"
) => {
  let updatedAgendaIds = [];
  let rescheduledParentMeetingId = null;
  let sequence = 0;
  console.log("meetingId========", oldMeetingId);

  const meetingUpdate = await Meeting.findByIdAndUpdate(
    { _id: new ObjectId(oldMeetingId) },
    {
      isRescheduled: true,
    },
    {
      new: true,
    }
  );
  console.log("meetingUpdate============", meetingUpdate);
  rescheduledParentMeetingId = meetingUpdate?.rescheduledParentMeetingId
    ? meetingUpdate?.rescheduledParentMeetingId
    : oldMeetingId;
  const meetingId = await commonHelper.customMeetingId(
    meetingUpdate.date,
    meetingUpdate.organizationId
  );
  if (meetingId == false) {
    return {
      inActiveOrganization: true,
    };
  }
  console.log(
    "meetingUpdate.locationDetails============",
    meetingUpdate.locationDetails
  );
  const inputData = {
    meetingId,
    title: meetingUpdate.title.trim(),
    mode: meetingUpdate.mode,
    link: meetingUpdate.link.trim(),
    organizationId: meetingUpdate.organizationId,
    locationDetails: meetingUpdate.locationDetails,
    step: 3,
    createdById: new ObjectId(userId),
    linkType: meetingUpdate.linkType ? meetingUpdate.linkType : undefined,
    hostDetails: {
      hostType: meetingUpdate.hostDetails.hostType,
    },
    attendees: meetingUpdate.attendees,
    fromTime: data.fromTime,
    toTime: data.toTime,
    date: new Date(data.date),
    meetingStatus: {
      status: "rescheduled",
      remarks: data.remarks,
    },
    rescheduledForMeetingId: oldMeetingId,
    rescheduledParentMeetingId,
    createdById: new ObjectId(userId),
  };

  console.log(inputData);

  const meetingData = new Meeting(inputData);
  const newMeeting = await meetingData.save();
  //// GET ALL AGENDA FROM OLD MEETING
  if (meetingUpdate?.agendaIds?.length !== 0) {
    await Promise.all(
      meetingUpdate?.agendaIds.map(async (agendaId) => {
        let agendaData = await Agenda.aggregate([
          {
            $match: {
              _id: new ObjectId(agendaId),
            },
          },

          {
            $lookup: {
              from: "minutes",
              localField: "_id",
              foreignField: "agendaId",
              pipeline: [
                {
                  $match: {
                    isActive: true,
                    // isAction:true
                  },
                },
              ],
              as: "minutesDetails",
            },
          },
          {
            $project: {
              _id: 1,
              meetingId: 1,
              organizationId: 1,
              title: 1,
              topic: 1,
              timeLine: 1,
              isMOMGenerated: 1,
              isActive: 1,
              sequence: 1,
              minutesDetails: {
                _id: 1,
                isActive: 1,
                isAction: 1,
              },
            },
          },
          // {
          //   $unwind: {
          //     path: "$minutesDetails",
          //     preserveNullAndEmptyArrays: true,
          //   },
          // },
        ]);
        console.log("agendaData=========w====", agendaData);

        if (agendaData) {
          if (
            agendaData?.length !== 0 &&
            agendaData[0]?.minutesDetails?.length == 0
          ) {
            console.log(agendaData[0]);
            sequence = sequence + 1;
            const newAgendaData = {
              meetingId: newMeeting?._id,
              organizationId: newMeeting?.organizationId,
              title: agendaData[0]?.title,
              topic: agendaData[0]?.topic,
              timeLine: agendaData[0]?.timeLine,
              isMOMGenerated: false,
              isActive: true,
              sequence,
            };
            console.log("newAgendaData==========", newAgendaData);
            const agendaDatas = new Agenda(newAgendaData);
            const newAgenda = await agendaDatas.save();
            //  console.log("newAgenda==========", newAgenda);
            updatedAgendaIds.push(newAgenda?._id);
            console.log(
              "updatedAgendaIds-===========111============",
              updatedAgendaIds
            );
          }
        }
      })
    );

    console.log(
      "updatedAgendaIds-==============666=========",
      updatedAgendaIds
    );
    if (updatedAgendaIds.length !== 0) {
      console.log(
        "updatedAgendaIds-=======3333333333333333333================",
        updatedAgendaIds
      );
      const newUpdatedMeeting = await Meeting.findByIdAndUpdate(
        { _id: new ObjectId(newMeeting?._id) },
        {
          agendaIds: updatedAgendaIds,
        },
        {
          new: true,
        }
      );

      let mailData = null;
      let emailSubject = null;
      const meeting = await viewMeeting(newUpdatedMeeting?._id, userId);
      if (meeting?.attendees?.length !== 0) {
        emailSubject = await emailConstants.scheduleMeetingSubject(meeting);

        meeting?.attendees?.map(async (attendee) => {
          // const logo = process.env.LOGO;
          const attendeeData = meeting?.attendees
            .map((attendee) => {
              return `${attendee.name}(${attendee.email})`;
            })
            .join(", ");
          const agendaData = meeting?.agendasDetail
            .map((agenda) => {
              return `<table style="border: 1px solid black;border-collapse: collapse; width:100%;color:black;margin-top:5px;">
        <tr style="border: 1px solid black;border-collapse: collapse;" >
        <td  style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;" colspan="6">
        Agenda Title
        </td>
        <td colspan="6" style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;">${agenda.title
                }</td>
        </tr>
        ${agenda.topic !== (null || "")
                  ? `<tr style="border: 1px solid black;border-collapse: collapse;">
              <td
                style="border: 1px solid black;border-collapse: collapse; width:20%;padding:3px;"
                colspan="6"
              >
                Topic to Discuss
              </td>
              <td colspan="6" style="border: 1px solid black; border-collapse: collapse; width: 50%; padding: 3px;">
                <p>${agenda?.topic ? parse(agenda?.topic) : ""}</p>
              </td>
            </tr>`
                  : `<tr style={{display:"none"}}></tr>`
                }
           ${agenda.timeLine !== (null || "" || 0)
                  ? `<tr style="border: 1px solid black;border-collapse: collapse; ">
                 <td
                   style="border: 1px solid black;border-collapse: collapse;width:20%;padding:3px;"
                   colspan="6"
                 >
                   Timeline
                 </td>
                 <td
                   colspan="6"
                   style="border: 1px solid black;border-collapse: collapse;width:50%;padding:3px;"
                 >
                   ${agenda.timeLine} Mins
                 </td>
               </tr>`
                  : `<tr style={{display:"none"}}></tr>`
                }
        </table><br />`;
            })
            .join(" ");
          console.log(
            "updatedAgendaIds-=============456==========",
            updatedAgendaIds
          );
          let finalMeetingLink = null;
          let meetingLinkCode = null;

          if (newUpdatedMeeting) {
            (meetingLinkCode = newUpdatedMeeting?.hostDetails?.hostingPassword
              ? newUpdatedMeeting?.hostDetails?.hostingPassword
              : null),
              (finalMeetingLink =
                newUpdatedMeeting?.hostDetails?.hostType === "ZOOM"
                  ? newUpdatedMeeting?.hostDetails?.hostLink
                  : newUpdatedMeeting?.link);
          } else {
            finalMeetingLink =
              meeting?.hostDetails?.hostType === "ZOOM"
                ? meeting?.hostDetails?.hostLink?.split("?")[0]
                : meeting?.link;
            meetingLinkCode = meeting?.hostDetails?.hostingPassword
              ? meeting?.hostDetails?.hostingPassword
              : null;
          }
          console.log("meeting==============", meeting);
          // console.log("updatedMeeting==============", newUpdatedMeeting);
          console.log("finalMeetingLink==============", finalMeetingLink);
          console.log("meetingLinkCode==============", meetingLinkCode);
          mailData = await emailTemplates.sendScheduledMeetingEmailTemplate(
            meeting,
            commonHelper.convertFirstLetterOfFullNameToCapital(attendee.name),
            logo,
            agendaData,
            attendeeData,
            attendee,
            meetingLinkCode,
            finalMeetingLink
            // (meetingLink =
            //   meeting?.createdById?.toString() == attendee?._id?.toString()
            //     ? hostLink
            //     : meetingLink)
          );
          emailService.sendEmail(
            attendee.email,
            "Meeting Scheduled",
            emailSubject,
            mailData
          );
        });
        let allowedUsers = [new ObjectId(userId), meeting?.createdById];
        meeting?.attendees?.map((attendee) => {
          allowedUsers.push(attendee._id);
        });
        const notificationData = {
          title: "MEETING RESCHEDULED",
          organizationId: new ObjectId(meeting?.organizationId),
          meetingId: meeting?._id,
          byUserId: new ObjectId(userId),
          details: {
            byDetails: `Meeting is rescheduled by `,
            toDetails: null,
          },
          allowedUsers,
        };
        const addNotification = await notificationService.createNotification(
          notificationData
        );

        const logData = {
          moduleName: logMessages.Meeting.moduleName,
          userId,
          action: logMessages.Meeting.createMeeting,
          ipAddress,
          details:
            "Meeting Title: <strong>" + newUpdatedMeeting.title + "</strong>",
          subDetails: newUpdatedMeeting.rescheduledForMeetingId
            ? `Old Meeting Title: ${meetingUpdate.title} (${meetingUpdate.meetingId})`
            : undefined,
          organizationId: newUpdatedMeeting.organizationId,
        };
        await logService.createLog(logData);
      }
    }
  }

  return newMeeting;
};
/**FUNC- TO VIEW ALL MEETING LIST */
const totalMeetingListForChart = async (organizationId, userId, userData) => {
  // if (bodyData.attendeeId) {
  //   query["attendees._id"] = new ObjectId(bodyData.attendeeId);
  // }

  let query = null;
  if (userData.isAdmin) {
    query = {
      organizationId: new ObjectId(organizationId),
      isActive: true,
    };
  } else {
    query = {
      organizationId: new ObjectId(organizationId),
      isActive: true,
      $or: [
        { "attendees._id": new ObjectId(userId) },
        { createdById: new ObjectId(userId) },
      ],
      // assignedUserId: userId,
    };
  }

  let pipeLine = [
    {
      $match: query,
    },
    {
      $project: {
        _id: 1,
        meetingStatus: 1,
      },
    },
  ];
  // const totalCount = await Meeting.countDocuments(query);
  let totalCount = await Meeting.aggregate(pipeLine);
  let meetingData = await Meeting.aggregate(pipeLine);

  console.log(
    "meetingData------===========================================---",
    meetingData
  );
  // fffffffffff;

  const finalData = {
    totalCount: meetingData.length,
    scheduled: 0,
    rescheduled: 0,
    draft: 0,
    closed: 0,
    cancelled: 0,
  };

  if (meetingData?.length !== 0) {
    meetingData.map(async (meeting) => {
      if (meeting.meetingStatus.status === "scheduled") {
        finalData.scheduled = finalData.scheduled + 1;
      }

      if (meeting.meetingStatus.status === "rescheduled") {
        finalData.rescheduled = finalData.rescheduled + 1;
      }

      if (meeting.meetingStatus.status === "closed") {
        finalData.closed = finalData.closed + 1;
      }

      if (meeting.meetingStatus.status === "draft") {
        finalData.draft = finalData.draft + 1;
      }

      if (meeting.meetingStatus.status === "cancelled") {
        finalData.cancelled = finalData.cancelled + 1;
      }
    });
  }
  return finalData;
};

/**FUNC- TO VIEW ALL MEETINGS ACTION LIST BY PRIORITY**/
const getMeetingActionPriotityDetails = async (
  queryData,
  bodyData,
  userId,
  userData
) => {
  const { order } = queryData;
  const { organizationId, searchKey } = bodyData;

  // let query = searchKey
  //   ? {
  //       organizationId: new ObjectId(organizationId),
  //       $and: [
  //         {
  //           $or: [
  //             {
  //               title: { $regex: searchKey, $options: "i" },
  //             },
  //             {
  //               meetingId: { $regex: searchKey, $options: "i" },
  //             },
  //             // {
  //             //   createdById: { $in: attendeesIds },
  //             // },
  //           ],
  //         },
  //       ],

  //       isActive: true,
  //     }
  //   : {
  //       organizationId: new ObjectId(organizationId),
  //       isActive: true,
  //     };

  let query = {
    organizationId: new ObjectId(organizationId),
    isActive: true,
    $and: [
      {
        $or: [
          {
            "meetingStatus.status": "scheduled",
          },
          {
            "meetingStatus.status": "closed",
          },
          {
            "meetingStatus.status": "rescheduled",
          },
        ],
      },
    ],
  };
  let minuteQuery = {
    isActive: true,
    isAction: true,
  };

  if (searchKey) {
    query["$and"].push({
      $or: [
        {
          title: { $regex: searchKey, $options: "i" },
        },
        {
          meetingId: { $regex: searchKey, $options: "i" },
        },
        // {
        //   createdById: { $in: attendeesIds },
        // },
      ],
    });
  }

  if (userData?.isAdmin) {
  } else {
    const meetingIds = await meetingService.getMeetingIdsOfCreatedById(userId);
    query["$or"] = [
      { "attendees._id": new ObjectId(userId) },
      { createdById: new ObjectId(userId) },
    ];
    minuteQuery["$or"] = [
      { assignedUserId: new ObjectId(userId) },
      { createdById: new ObjectId(userId) },
      { meetingId: { $in: meetingIds } },
    ];
  }

  console.log("query==============", query);
  var limit = parseInt(queryData.limit);
  var skip = (parseInt(queryData.page) - 1) * parseInt(limit);

  const pipeLine = [
    {
      $match: query,
    },
    {
      $lookup: {
        from: "minutes",
        localField: "_id",
        foreignField: "meetingId",
        pipeline: [
          {
            $match: {
              isActive: true,
              isComplete: false,
              isAction: true,
              actionStatus: { $ne: "REASSIGNED" },
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
          {
            $match: minuteQuery,
          },
        ],
        as: "minutesDetail",
      },
    },

    {
      // Filter children based on the status (e.g., 'active')
      $project: {
        _id: 1,
        meetingId: 1,
        title: 1,
        date: 1,
        fromTime: 1,
        meetingStatus: 1,

        minutesDetail: {
          $filter: {
            input: "$minutesDetail", // The array from the $lookup stage
            as: "minutesDetailss",

            cond: {
              $and: [
                { $eq: ["$$minutesDetailss.isComplete", false] }, // Condition 1: status should be 'active'
                { $eq: ["$$minutesDetailss.isCancelled", false] },
                { $eq: ["$$minutesDetailss.isAction", true] },
                { $ne: ["$$minutesDetailss.actionStatus", "REASSIGNED"] }, // Condition 2: role should be 'admin'
              ],
            },
          },
        },
      },
    },
    {
      // Add a new field for the count of active children
      $addFields: {
        activeMinutesCount: { $size: "$minutesDetail" }, // Count the number of active children
      },
    },
    {
      // Filter out parents with no active children (active_child_count > 0)
      $match: {
        activeMinutesCount: { $gt: 0 }, // Only include parents with active children
      },
    },
    {
      // Sort by the count of active children in descending order
      $sort: { activeMinutesCount: -1 },
    },
    {
      // Sort by the count of active children in descending order
      $skip: skip,
    },
    {
      // Limit the results to 5 parent records
      $limit: limit,
    },
  ];
  console.log(pipeLine);

  const pipeLineForTotalCount = [
    {
      $match: query,
    },
    {
      $lookup: {
        from: "minutes",
        localField: "_id",
        foreignField: "meetingId",
        pipeline: [
          {
            $match: {
              isActive: true,
              isComplete: false,
              isAction: true,
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
          {
            $match: minuteQuery,
          },
        ],
        as: "minutesDetail",
      },
    },

    {
      // Filter children based on the status (e.g., 'active')
      $project: {
        _id: 1,
        meetingId: 1,
        title: 1,
        date: 1,
        fromTime: 1,
        meetingStatus: 1,

        minutesDetail: {
          $filter: {
            input: "$minutesDetail", // The array from the $lookup stage
            as: "minutesDetailss",

            cond: {
              $and: [
                { $eq: ["$$minutesDetailss.isComplete", false] }, // Condition 1: status should be 'active'
                { $eq: ["$$minutesDetailss.isCancelled", false] },
                { $eq: ["$$minutesDetailss.isAction", true] },
                { $ne: ["$$minutesDetailss.actionStatus", "REASSIGNED"] }, // Condition 2: role should be 'admin'
              ],
            },
          },
        },
      },
    },
    {
      // Add a new field for the count of active children
      $addFields: {
        activeMinutesCount: { $size: "$minutesDetail" }, // Count the number of active children
      },
    },
    {
      // Filter out parents with no active children (active_child_count > 0)
      $match: {
        activeMinutesCount: { $gt: 0 }, // Only include parents with active children
      },
    },
  ];

  const meetingData = await Meeting.aggregate(pipeLine);
  // .sort({ _id: parseInt(order) })
  // .skip(skip)
  // .limit(limit);
  console.log(
    "meetingData========================================================",
    meetingData
  );

  const totalCount = await Meeting.aggregate(pipeLineForTotalCount);
  let meetingsData = [];
  if (meetingData.length !== 0) {
    meetingData.map((meeting) => {
      console.log("meeting?.minutesDetail?=========", meeting?.minutesDetail);
      let totalDueAction = 0;
      let totalHighPriorityDueAction = 0;
      let totalLowPriorityDueAction = 0;
      let totalMediumPriorityDueAction = 0;
      if (meeting?.minutesDetail?.length !== 0) {
        meeting?.minutesDetail.map((action) => {
          //  console.log("action====================================", action);
          //console.log( "action===========2222",action.priority,action.title )

          totalDueAction = totalDueAction + 1;

          if (action.priority == "HIGH") {
            totalHighPriorityDueAction = totalHighPriorityDueAction + 1;
          }
          if (action.priority == "LOW") {
            totalLowPriorityDueAction = totalLowPriorityDueAction + 1;
          }
          if (action.priority == "NORMAL") {
            totalMediumPriorityDueAction = totalMediumPriorityDueAction + 1;
          }
        });
      }
      const data = {
        totalLowPriorityDueAction,
        totalHighPriorityDueAction,
        totalMediumPriorityDueAction,
        totalDueAction,
        meetingTitle: meeting?.title,
        meetingId: meeting?._id,
      };
      //  console.log("data-----------",data)
      //  if (meeting?.minutesDetail?.length !== 0) {
      meetingsData.push({
        totalLowPriorityDueAction,
        totalHighPriorityDueAction,
        totalMediumPriorityDueAction,
        totalDueAction,
        meetingTitle: meeting?.title,
        meetingId: meeting?.meetingId,
      });
      //   }
    });
  }

  return {
    meetingsData,
    totalCount: totalCount?.length,
  };
};



const getCreatedByDetails = async (meetingId, userId) => {
  console.log("meetingId===============", meetingId);
  const meetingData = await Meeting.findOne(
    { _id: new ObjectId(meetingId), isActive: true },
    { _id: 1, title: 1, meetingId: 1, createdById: 1 }
  );
  console.log("meetingData=====================", meetingData);
  console.log("userId=====================", userId);
  if (meetingData) {
    if (meetingData?.createdById?.toString() === userId.toString()) {
      return true;
    }
  } else {
    return false;
  }
};

const getMeetingIdsOfCreatedById = async (userId) => {
  const meetingData = await Meeting.find(
    { createdById: new ObjectId(userId), isActive: true },
    { _id: 1, title: 1, meetingId: 1, createdById: 1 }
  );
  if (meetingData?.length !== 0) {
    const meetingIds = meetingData.map((meeting) => {
      return meeting._id;
    });
    return meetingIds;
  } else {
    return [];
  }
};
const deleteZoomRecording = async (body, userId) => {
  return await meetingStreamingService.deleteZoomRecording(
    body.meetingId,
    body.recordingId,
    body.organizationId
  );
};

const downloadZoomRecordingsInZip = async (bodyData, userId) => {
  console.log(bodyData);

  const zip = new JSZip();
  for (const [index, url] of bodyData?.downloadUrls.entries()) {
    // Download the file
    const response = await axios({
      url,
      method: "GET",
      responseType: "arraybuffer", // Download the file as a buffer
    });

    // Add the file to the ZIP archive
    const fileName = `Recording${index + 1}${path.extname(url) || ".bin"}`; // Use .bin if no extension
    zip.file(fileName, response.data);
  }

  // Generate the ZIP file
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  // Create the result object
  const result = {
    file: zipBuffer.toString("base64"), // Convert buffer to Base64 string if necessary
    fileName: "Recordings.zip",
    contentType: "application/zip",
  };
  return result;
};


const notifyMeetingCreatorAboutDraft = async (meetingId) => {
  console.log("Starting draft meetings notification process...");

  const config = await Configuration.findOne();

  const reminderDays = config?.draftMeetingReminderDays;
  console.log(`draftMeetingReminderDays: ${reminderDays}`);

  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() - reminderDays);

  console.log(`Searching for draft meetings from: ${reminderDate.toISOString()} to: ${new Date().toISOString()}`);

  const draftMeetings = await Meeting.find({
    "meetingStatus.status": "draft",
    createdAt: {
      $gte: reminderDate,
      $lte: new Date(),
    },
  });

  console.log(`Found ${draftMeetings.length} draft meetings.`);

  if (!draftMeetings.length) {
    console.log(`No draft meetings found in the past ${reminderDays} days.`);
    return null;
  }

  const meetingsByCreator = draftMeetings.reduce((acc, meeting) => {
    if (!acc[meeting.createdById]) acc[meeting.createdById] = [];
    acc[meeting.createdById].push(meeting);
    return acc;
  }, {});

  const creatorIds = Object.keys(meetingsByCreator);
  const creators = await Employee.find({ _id: { $in: creatorIds } });

  const notificationDetails = [];

  for (const creator of creators) {
    const meetings = meetingsByCreator[creator._id];
    if (!meetings || meetings.length === 0) continue;

    console.log(`Sending notification to: ${creator.name} (${creator.email})`);
    meetings.forEach((meeting) => {
      console.log(`Meeting title: ${meeting.title}`);
    });

    const organizationDetails = await Organization.findOne({ _id: meetings[0].organizationId });
    const BASE_URL = process.env.BASE_URL || "";
    const logo = organizationDetails?.dashboardLogo
      ? `${BASE_URL}/${organizationDetails.dashboardLogo.replace(/\\/g, "/")}`
      : process.env.LOGO;

    const mailData = await emailTemplates.sendDraftMeetingNotification(meetings, creator, logo);
    const { emailSubject, mailBody } = mailData;


    await emailService.sendEmail(creator.email, "Draft Meetings Reminder", emailSubject, mailBody);

    console.log(`Email successfully sent to ${creator.email}`);
    console.log(`Processed ${meetings.length} draft meetings for ${creator.name}`);


    notificationDetails.push({
      creatorName: creator.name,
      creatorEmail: creator.email,
      meetingCount: meetings.length,
      meetings: meetings.map((meeting) => ({
        title: meeting.title,
        meetingId: meeting._id,
        createdAt: meeting.createdAt,
      })),
    });
  }

  console.log(`Successfully processed ${draftMeetings.length} draft meetings.`);
  return notificationDetails;
};



const deleteOldDraftMeetings = async () => {
  console.log("Starting old draft meetings cleanup process...");

  const config = await Configuration.findOne();
  if (!config) {
    console.error("Configuration not found!");
    return { success: false, message: "Configuration not found" };
  }
  console.log("Config Data:", config);

  const draftMeetingReminderDays = config.draftMeetingReminderDays;
  const draftMeetingCleanupDays = config.draftMeetingCleanupDays;

  console.log(`draftMeetingReminderDays: ${draftMeetingReminderDays}`);
  console.log(`draftMeetingCleanupDays: ${draftMeetingCleanupDays}`);


  if (draftMeetingReminderDays + 1 > draftMeetingCleanupDays) {
    console.error("Error: Cleanup days must be at least 1 day greater than reminder days.");
    return {
      success: false,
      message: "Cleanup days must be at least 1 day greater than reminder days.",
    };
  }


  const cleanupDate = new Date();
  cleanupDate.setDate(cleanupDate.getDate() - draftMeetingCleanupDays);
  cleanupDate.setHours(0, 0, 0, 0);

  console.log("Cleaning up meetings before:", cleanupDate);


  const meetingsToDelete = await Meeting.find({
    "meetingStatus.status": "draft",
    createdAt: { $lt: cleanupDate },
    isDeleted: { $ne: true },
  });


  if (meetingsToDelete.length === 0) {
    console.log("No old draft meetings to delete.");
    return {
      success: false,
      message: "No old draft meetings to delete.",
    };
  }


  const meetingsByCreator = meetingsToDelete.reduce((acc, meeting) => {
    if (!acc[meeting.createdById]) acc[meeting.createdById] = [];
    acc[meeting.createdById].push(meeting);
    return acc;
  }, {});


  const creatorIds = Object.keys(meetingsByCreator);
  const creators = await Employee.find({ _id: { $in: creatorIds } });


  const creatorDeletions = creators.map(creator => {
    const deletedMeetings = meetingsByCreator[creator._id];
    return {
      creatorName: creator.name,
      creatorEmail: creator.email,
      deletedMeetingsCount: deletedMeetings.length,
      deletedMeetings: deletedMeetings.map(meeting => ({
        title: meeting.title,
        meetingId: meeting._id,
        createdAt: meeting.createdAt,
      })),
    };
  });
//soft delete
  const result = await Meeting.updateMany(
    {
      "meetingStatus.status": "draft",
      createdAt: { $lt: cleanupDate },
      isDeleted: { $ne: true }
    },
    { $set: { isDeleted: true } }
  );

  console.log(`Soft deleted ${result.modifiedCount} old draft meetings.`);


  return {
    success: true,
    message: `Soft deleted ${result.modifiedCount} old draft meetings.`,
    meetingCount: result.modifiedCount,
    creatorDeletions: creatorDeletions,
  };
};






const getMeetingActionPriorityDetailsforChart = async (
  queryData,
  bodyData,
  userId,
  userData
) => {
  const { order } = queryData;
  const { organizationId, searchKey, meetingId } = bodyData;

  let query = {
    organizationId: new ObjectId(organizationId),
    isActive: true,
    $and: [
      {
        $or: [
          { "meetingStatus.status": "scheduled" },
          { "meetingStatus.status": "closed" },
          { "meetingStatus.status": "rescheduled" },
        ],
      },
    ],
  };

  let minuteQuery = {
    isActive: true,
    isAction: true,
  };


  if (meetingId) {
    query.meetingId = meetingId;
  }

  if (searchKey) {
    query["$and"].push({
      $or: [
        { title: { $regex: searchKey, $options: "i" } },
        { meetingId: { $regex: searchKey, $options: "i" } },
      ],
    });
  }

  if (!userData?.isAdmin) {
    const meetingIds = await meetingService.getMeetingIdsOfCreatedById(userId);
    query["$or"] = [
      { "attendees._id": new ObjectId(userId) },
      { createdById: new ObjectId(userId) },
    ];
    minuteQuery["$or"] = [
      { assignedUserId: new ObjectId(userId) },
      { createdById: new ObjectId(userId) },
      { meetingId: { $in: meetingIds } },
    ];
  }

  const limit = parseInt(queryData.limit);
  const skip = (parseInt(queryData.page) - 1) * limit;

  const pipeLine = [
    { $match: query },
    {
      $lookup: {
        from: "minutes",
        localField: "_id",
        foreignField: "meetingId",
        pipeline: [
          { $match: { isActive: true, isComplete: false, isAction: true, actionStatus: { $ne: "REASSIGNED" } } },
          { $sort: { _id: -1 } },
          { $group: { _id: "$minuteId", latestEntry: { $first: "$$ROOT" } } },
          { $replaceRoot: { newRoot: "$latestEntry" } },
          { $match: minuteQuery },
        ],
        as: "minutesDetail",
      },
    },
    {
      $project: {
        _id: 1,
        meetingId: 1,
        title: 1,
        date: 1,
        fromTime: 1,
        meetingStatus: 1,
        minutesDetail: {
          $filter: {
            input: "$minutesDetail",
            as: "minutesDetailss",
            cond: {
              $and: [
                { $eq: ["$$minutesDetailss.isComplete", false] },
                { $eq: ["$$minutesDetailss.isCancelled", false] },
                { $eq: ["$$minutesDetailss.isAction", true] },
                { $ne: ["$$minutesDetailss.actionStatus", "REASSIGNED"] },
              ],
            },
          },
        },
      },
    },
    { $addFields: { activeMinutesCount: { $size: "$minutesDetail" } } },
    { $match: { activeMinutesCount: { $gt: 0 } } },
    { $sort: { activeMinutesCount: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const meetingData = await Meeting.aggregate(pipeLine);

  const totalCount = await Meeting.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "minutes",
        localField: "_id",
        foreignField: "meetingId",
        pipeline: [
          { $match: { isActive: true, isComplete: false, isAction: true } },
          { $sort: { _id: -1 } },
          { $group: { _id: "$minuteId", latestEntry: { $first: "$$ROOT" } } },
          { $replaceRoot: { newRoot: "$latestEntry" } },
          { $match: minuteQuery },
        ],
        as: "minutesDetail",
      },
    },
    { $addFields: { activeMinutesCount: { $size: "$minutesDetail" } } },
    { $match: { activeMinutesCount: { $gt: 0 } } },
  ]);

  let meetingsData = meetingData.map((meeting) => {
    // Sort the minutesDetail array by priority (HIGH > NORMAL > LOW)
    let sortedMinutesDetail = meeting.minutesDetail.sort((a, b) => {
      const priorityOrder = { HIGH: 3, NORMAL: 2, LOW: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority]; // Sort descending
    });

    let totalDueAction = sortedMinutesDetail.length;
    let totalHighPriorityDueAction = sortedMinutesDetail.filter(action => action.priority === "HIGH").length;
    let totalLowPriorityDueAction = sortedMinutesDetail.filter(action => action.priority === "LOW").length;
    let totalMediumPriorityDueAction = sortedMinutesDetail.filter(action => action.priority === "NORMAL").length;

    return {
      meetingTitle: meeting.title,
      meetingId: meeting.meetingId,
      totalDueAction,
      totalHighPriorityDueAction,
      totalLowPriorityDueAction,
      totalMediumPriorityDueAction,
      actionDetails: sortedMinutesDetail,
    };
  });

  return {
    meetingsData,
    totalCount: totalCount.length,
  };
};

// const deleteDraftMeeting = async (id, userId, data, ipAddress) => {
//   const meeting = await Meeting.findOne({ _id: new ObjectId(id) });

//   if (!meeting) {
//     throw new Error("Meeting not found.");
//   }
  

//   if (meeting.createdById.toString() !== userId.toString()) {
//     throw new Error("Only the meeting creator can delete the draft.");
//   }

  
//   const result = await Meeting.findOneAndUpdate(
//     { _id: new ObjectId(id) },
//     {
//       $set: {
//         "meetingStatus.status": "deleted",  
//         "meetingStatus.remarks": data.remarks,
//         "isDeleted": true, 
//       },
//     },
//     { new: true }  
//   );


//   const details = await commonHelper.generateLogObject(
//     { status: "deleted" },
//     userId,
//     { status: "draft deleted" }
//   );

//   if (details.length !== 0) {
//     const logData = {
//       moduleName: logMessages.Meeting.moduleName,
//       userId,
//       action: logMessages.Meeting.deleteDraftMeeting,
//       ipAddress,
//       details: commonHelper.convertFirstLetterToCapital(details.join(" , ")),
//       subDetails: `Meeting Title: ${result.title} (${result.meetingId})`,
//       organizationId: result.organizationId,
//     };
//     await logService.createLog(logData);
//   }

//   return result; 
// };

const deleteDraftMeeting = async (id, createdById, data, ipAddress) => {

  const meeting = await Meeting.find({ 
    _id: new ObjectId(id),
    "meetingStatus.status": "draft", 
    createdById: new ObjectId(createdById) 
  });

  if (!meeting) {
    throw new Error("Meeting not found or you are not the creator of this draft.");
  }

  const draftCount = await Meeting.countDocuments({
    "meetingStatus.status": "draft",
    createdById: new ObjectId(createdById)
  });
  console.log(`${draftCount} draft meeting(s) found for user ${createdById}`);

  // Soft delete the draft meeting by updating its status and setting isDeleted flag
  const result = await Meeting.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        "meetingStatus.status": "deleted",  // Mark as deleted
        "meetingStatus.remarks": data.remarks,
        "isDeleted": true, // Soft delete flag
      },
    },
    { new: true }  // Return the updated meeting
  );

  // Generate log details for the action
  const details = await commonHelper.generateLogObject(
    { status: "deleted" },
    createdById,  // Use createdById for logging
    { status: "draft deleted" }
  );

  if (details.length !== 0) {
    const logData = {
      moduleName: logMessages.Meeting.moduleName,
      userId: createdById,  // Log the user's ID
      action: logMessages.Meeting.deleteDraftMeeting,
      ipAddress,
      details: commonHelper.convertFirstLetterToCapital(details.join(" , ")),
      //subDetails: `Meeting Title: (${result.meetingId})`,
      organizationId: result.organizationId,
    };
    await logService.createLog(logData);
  }

  return result; 
};









exports.viewMeeting = viewMeeting;
exports.createMeeting = createMeeting;
exports.updateRsvp = updateRsvp;
exports.cancelMeeting = cancelMeeting;
exports.updateMeeting = updateMeeting;
exports.viewAllMeetings = viewAllMeetings;
exports.getCreateMeetingStep = getCreateMeetingStep;
exports.getAllAttendees = getAllAttendees;
exports.viewMeetingActivities = viewMeetingActivities;
exports.createMeetingActivities = createMeetingActivities;
exports.listAttendeesFromPreviousMeeting = listAttendeesFromPreviousMeeting;
exports.updateMeetingAttendance = updateMeetingAttendance;
exports.generateMOM = generateMOM;
exports.downloadMOM = downloadMOM;
exports.rescheduleMeeting = rescheduleMeeting;
exports.giveMomWritePermission = giveMomWritePermission;
exports.getTimelineList = getTimelineList;
exports.updateMeetingStatus = updateMeetingStatus;
exports.viewParentAgendas = viewParentAgendas;
exports.viewMeetingStatistics = viewMeetingStatistics;
exports.sendAlertTime = sendAlertTime;
exports.viewMeetingDetailsForRsvp = viewMeetingDetailsForRsvp;
exports.updateRsvpByEmail = updateRsvpByEmail;
exports.sendMeetingDetails = sendMeetingDetails;
exports.fetchCurrentAttendeesList = fetchCurrentAttendeesList;
exports.getRecordingsZoomMeetingForMOM = getRecordingsZoomMeetingForMOM;
exports.newMeetingAsRescheduled = newMeetingAsRescheduled;
exports.totalMeetingListForChart = totalMeetingListForChart;
exports.getMeetingActionPriotityDetails = getMeetingActionPriotityDetails;
exports.getCreatedByDetails = getCreatedByDetails;
exports.getMeetingIdsOfCreatedById = getMeetingIdsOfCreatedById;
exports.deleteZoomRecording = deleteZoomRecording;
exports.downloadZoomRecordingsInZip = downloadZoomRecordingsInZip;
exports.checkAttendeeAvailability = checkAttendeeAvailability;
exports.checkMeetingRoomAvailability = checkMeetingRoomAvailability;
exports.checkAttendeeArrayAvailability = checkAttendeeArrayAvailability;
exports.notifyMeetingCreatorAboutDraft = notifyMeetingCreatorAboutDraft;
exports.deleteOldDraftMeetings = deleteOldDraftMeetings;
exports.getMeetingActionPriorityDetailsforChart = getMeetingActionPriorityDetailsforChart;
exports.deleteDraftMeeting = deleteDraftMeeting;
