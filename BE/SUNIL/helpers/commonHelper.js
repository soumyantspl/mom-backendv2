const bcrypt = require("bcrypt");
const CryptoJS = require("crypto-js");
const saltRounds = 10;
const Organization = require("../models/organizationModel");
const Meeting = require("../models/meetingModel");
const ObjectId = require("mongoose").Types.ObjectId;
const requestIp = require("request-ip");
process.env.TZ = "Asia/Calcutta";
/**FUNC- TO GENERATE OTP */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
/**FUNC- TO GENERATE OTP EXPIRY TIME*/
const otpExpiryTime = (minutes) => {
  let now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  return now;
};
/**FUNC- TO GET TIME DIFFERENCE BETWEEN FROM & TO TIME*/
const checkTimeDifference = (toTime, fromTime) => {
  var difference = Math.abs(fromTime.getTime() - toTime.getTime());
  var resultInMinutes = Math.round(difference / 60000);
  return resultInMinutes;
};
/*FUNC TO GENERATE HASH PASSWORD*/
const generetHashPassword = async (normalPassword) => {
  return bcrypt.hashSync(normalPassword, saltRounds);
};

/*FUNC TO VERIFY PASSWORD*/
const verifyPassword = async (plianPassword, hashPass) => {
  return bcrypt.compareSync(plianPassword, hashPass);
};

const generateLogObject = async (result, userId, data) => {
  let details = [];
  Object.keys(data).map((key) => {
    if (data[key].toString() !== result[key].toString()) {
      details.push(
        `${camelToFlat(key)} changed from <strong>${typeof result[key] == "string"
          ? convertFirstLetterToCapital(result[key])
          : result[key]
        }</strong> to <strong>${typeof result[key] == "string"
          ? convertFirstLetterToCapital(data[key])
          : data[key]
        }</strong>`
      );
    }
  });
  return details;
};


const generateLogObjectForDesignation = async (result, userId, data) => {
  let details = [];
  Object.keys(data).map((key) => {
    if (data[key].toString() !== result[key].toString()) {
      details.push(
        `${camelToFlat(key)} changed from <strong>${typeof result[key] == "string"
          ? convertFirstLetterToCapital(result[key])
          : result[key]
        }</strong> to <strong>${typeof result[key] == "string"
          ? convertFirstLetterToCapital(data[key])
          : data[key]
        }</strong>`
      );
    }
  });
  return details;
};

const generateLogObjectDepartment = async (result, userId, data) => {
  let details = [];
  Object.keys(data).map((key) => {
    if (data[key].toString() !== result[key].toString()) {
      details.push(
        `Department ${camelToFlat(key)} changed from <strong>${typeof result[key] == "string"
          ? convertFirstLetterToCapital(result[key])
          : result[key]
        }</strong> to <strong>${typeof result[key] == "string"
          ? convertFirstLetterToCapital(data[key])
          : data[key]
        }</strong>`
      );
    }
  });
  return details;
};
const generateLogObjectForOrganization = async (
  currentData,
  userId,
  updatedData
) => {
  let details = [];
  const baseUrl = process.env.BASE_URL || "";

  Object.keys(updatedData).forEach((key) => {
    if (key === "dashboardLogo" || key === "loginLogo" || key === "image") {
      if (currentData[key] !== updatedData[key]) {
        details.push(
          `${camelToFlat(key)} changed from <img src="${baseUrl + currentData[key]
          }" alt="${key}" height="15px"> to <img src="${baseUrl + updatedData[key]
          }" alt="${key}" height="15px">`
        );
      }
    } else if (currentData[key]?.toString() !== updatedData[key]?.toString()) {
      details.push(
        `${camelToFlat(key)} changed from <strong> ${currentData[key]
        }</strong> to <strong> ${updatedData[key]}</strong> `
      );
    }
  });

  return details;
};

const generateAgendaLogObject = async (result, userId, data) => {
  let details = [];
  Object.keys(data).map((key) => {
    if (data[key].toString() !== result[key].toString()) {
      if (key == "timeLine") {
        details.push(
          `${convertFirstLetterToCapital(key)} changed from <strong> ${result[key]
          }</strong> mins to <strong> ${data[key]}</strong> mins`
        );
      } else {
        details.push(
          `${convertFirstLetterToCapital(
            key
          )} changed from <strong> ${convertFirstLetterToCapital(
            result[key]
          )}</strong> to <strong> ${convertFirstLetterToCapital(
            data[key]
          )}</strong> `
        );
      }
    }
  });
  return details;
};

const generateLogObjectForRescheduleMeeting = async (result, userId, data) => {
  let details = [];
  const oldDate = formatDateTimeFormat(result.date).formattedDate;

  const newDate = formatDateTimeFormat(new Date(data.date)).formattedDate;
  if (oldDate !== newDate) {
    details.push(
      `Meeting date changed from <strong> ${oldDate}</strong> to <strong> ${newDate}</strong> `
    );
  }
  const oldFromTime = formatTimeFormat(result.fromTime);
  const newFromTime = formatTimeFormat(data.fromTime);
  if (oldFromTime !== newFromTime) {
    details.push(
      `Meeting from time changed from <strong> ${oldFromTime}</strong> to <strong> ${newFromTime}</strong> `
    );
  }
  const oldToTime = formatTimeFormat(result.toTime);
  const newToTime = formatTimeFormat(data.toTime);
  if (oldToTime !== newToTime) {
    details.push(
      `Meeting to time changed from <strong> ${oldToTime}</strong> to <strong> ${newToTime}</strong> `
    );
  }
  return details;
};

const generateLogObjectForMeeting = async (result, userId, data) => {
  let details = [];
  Object.keys(data).map((key) => {
    if (typeof data[key] == "string" && key in result) {
      if (data[key].toString() !== result[key].toString()) {
        const resultValue =
          result[key] === null || "" ? "Not Available" : result[key];
        details.push(
          `${convertFirstLetterToCapital(
            key
          )} changed from <strong> ${resultValue}</strong> to <strong> ${data[key]
          }</strong> `
        );
      }
    }
    if (typeof data[key] == "boolean" && key in result) {
      if (data[key] !== result[key]) {
        details.push(
          `${convertFirstLetterToCapital(key)} changed from <strong> ${result[key] === true ? "Yes" : "No"
          }</strong> to <strong> ${data[key] === true ? "Yes" : "No"}</strong> `
        );
      }
    }
    if (typeof data[key] == "object" && key == "locationDetails") {
      if (data[key]?.isMeetingRoom == result[key]?.isMeetingRoom) {
        if (data[key]?.roomId?.toString() !== result[key]?.roomId?.toString()) {
          details.push(
            `<strong> ${convertFirstLetterToCapital(key)}</strong> changed`
          );
        }
      }
      if (data[key]?.isMeetingRoom !== result[key]?.isMeetingRoom) {
        details.push(
          `<strong> ${convertFirstLetterToCapital(key)}</strong> changed`
        );
      }
    }
  });
  return details;
};

const formatDateTimeFormat = (d) => {
  const date = new Date(d);
  const sourceTime = new Date(date).toLocaleTimeString();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);

  const sourceDate = new Date(date).toDateString();
  const [, month, day, year] = sourceDate.split(" ");
  const formattedDate = [day, month, year].join(" ");
  const [hour, minute, second] = sourceTime.split(" ")[0].split(":");
  const formattedTime =
    [hour, minute].join(":") + " " + sourceTime.split(" ")[1];
  return {
    formattedTime,
    formattedDate,
  };
};

const getTimeSession = (time) => {
  const timeArray = time.split(":");
  const timeHour = timeArray[0];

  if (timeHour > 12) {
    return "PM";
  }
  return "AM";
};

const convertTimetoIST = (time) => {
  const timeArray = time.split(":");
  const timeHour = timeArray[0];

  if (timeHour >= 12 && timeHour !== 24) {
    let finalHour = timeHour == 12 ? 12 : timeHour - 12;
    finalHour = finalHour.toString().length == 1 ? "0" + finalHour : finalHour;
    return finalHour + ":" + timeArray[1] + " PM";
  } else if (timeHour == 24) {
    return "00" + ":" + timeArray[1] + " AM";
  } else {
    return timeHour + ":" + timeArray[1] + " AM";
  }
};
const formatTimeFormatOld = (time) => {
  const timeArray = time.split(":");
  let session = "AM";
  let hour = timeArray[0];
  let minute = timeArray[1];
  if (hour >= 12) {
    session = "PM";
    if (hour !== 12) {
      if (hour - 12 < 10) {
        hour = `0${hour - 12} `;
      } else {
        hour = `${hour - 12} `;
      }
    }
  }
  let finalTime = `${hour}:${minute}`;
  console.log("session===========", session);
  console.log("finalTime===========", finalTime);
  const result = `${finalTime} ${session}`;
  console.log("result===========", result);
  return result;
};

const formatTimeFormat = (time) => {
  const timeArray = time.split(":");
  console.log("timeArray===========", timeArray);
  let session = "AM";
  let hour = timeArray[0];
  let minute = timeArray[1];
  if (hour >= 12) {
    session = "PM";
    if (hour != 12) {
      console.log("in hour===========", hour);
      if (hour - 12 < 10) {
        hour = `0${hour - 12}`;
      } else {
        hour = `${hour - 12}`;
      }
    }
  }
  console.log("hour===========", hour);
  let finalTime = `${hour}:${minute}`;
  console.log("session===========", session);
  console.log("finalTime===========", finalTime);
  const result = `${finalTime} ${session}`;
  console.log("result===========", result);
  return result;
};

const formatTimeFormat2 = (time) => {
  const timeArray = time.split(":");
  let session = "AM";
  let hour = timeArray[0];
  let minute = timeArray[1];
  if (hour >= 12) {
    session = "PM";
    if (hour !== 12) {
      if (hour - 12 < 10) {
        hour = `0${hour - 12} `;
      } else {
        hour = `${hour - 12} `;
      }
    }
  }
  const finalTime = [hour, minute].join(":");
  console.log("session===========", session);
  console.log("finalTime===========", finalTime);
  return finalTime;
  // console.log("finalTime========5555===",finalTime)
  // const result = `${finalTime} ${session}`;
  // console.log("result===========",result)

  // return result;
};
const convertFirstLetterToCapital = (text) => {
  return text?.charAt(0)?.toUpperCase() + text?.slice(1)?.toLowerCase();
};

const customMeetingId = async (meetingDate, id) => {
  let organizationData = await Organization.findById({
    _id: new ObjectId(id),
    isActive: true,
  });
  if (!organizationData) {
    return false;
  }
  const organizationCode = organizationData.organizationCode;
  const meetingNewDate = new Date(meetingDate);
  const date = meetingNewDate.getDate().toString().padStart(2, "0");
  const month = (meetingNewDate.getMonth() + 1).toString().padStart(2, "0");
  const year = meetingNewDate.getFullYear().toString();
  const meetingData = await Meeting.find({
    organizationId: new ObjectId(id),
    date: meetingNewDate,
    isActive: true,
  }).sort({ serialNumber: -1 });
  // console.log("meetingData-->", meetingData);

  let serialNumber = 1;
  if (meetingData.length > 0) {
    serialNumber = meetingData.length + 1;
  }
  const formattedSerial = String(serialNumber).padStart(4, "0");
  const newMeetingId = `${organizationCode} /${date}${month}${year}/${formattedSerial} `;
  return newMeetingId;
};

const combineDateAndTime = (date, time) => {
  console.log("date------------", date);
  let timeString = time.split(":")[0] + ":" + time.split(":")[1] + ":00";
  const modifiedHour =
    time.split(":")[0] < 10
      ? time.split(":")[0].split("")[1]
      : time.split(":")[0];
  const modifiedMinute =
    time.split(":")[1] < 10
      ? time.split(":")[1].split("")[1]
      : time.split(":")[1];
  date.setHours(date.getHours() + parseInt(modifiedHour));
  date.setMinutes(date.getMinutes() + parseInt(modifiedMinute));
  return date;
};
const convertFirstLetterOfFullNameToCapital = (textData) => {
  const textArray = textData.split(" ");
  const convertedTextArray = textArray.map((text) => {
    return text.charAt(0).toUpperCase() + text.toLowerCase().slice(1);
  });
  return convertedTextArray.join(" ");
};

// //The Function Below To Encrypt Text
const encryptWithAES = (text) => {
  const passphrase = process.env.PASSWORD_KEY;
  console.log("Backend Key:", process.env.PASSWORD_KEY);
  return CryptoJS.AES.encrypt(text, passphrase).toString();
};


// //The Function Below To Decrypt Text
const decryptWithAES = (ciphertext) => {
  const passphrase = process.env.PASSWORD_KEY;
  
  const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};





const generateLogObjectForMeetingRoom = async (result, data) => {
  const details = [];

  Object.keys(data).forEach((key) => {
    let resultValue = result[key];
    let dataValue = data[key];

    // Handle ObjectId and Date transformations
    if (resultValue && typeof resultValue === "object" && resultValue.$oid) {
      resultValue = resultValue.$oid;
    }
    if (dataValue && typeof dataValue === "object" && dataValue.$oid) {
      dataValue = dataValue.$oid;
    }
    if (resultValue instanceof Date || resultValue?.$date) {
      resultValue = new Date(resultValue?.$date || resultValue).toISOString();
    }
    if (dataValue instanceof Date || dataValue?.$date) {
      dataValue = new Date(dataValue?.$date || dataValue).toISOString();
    }

    // Log changes and unchanged fields
    if (dataValue.toString() !== resultValue.toString()) {
      details.push(
        `Meeting Room ${convertFirstLetterToCapital(
          key
        )} changed from <strong>${resultValue}</strong> to <strong>${dataValue}</strong>`
      );
    }
  });

  return details;
};

const generateLogObjectForAlert = async (result, data) => {
  let details = [];
  if (result && result.mettingReminders && result.chaseOfAction) {
    if (data.mettingReminders.hours !== result.mettingReminders.hours) {
      details.push(
        `Meeting Reminder hour changed from <strong> ${result.mettingReminders.hours} hours</strong> to <strong> ${data.mettingReminders.hours} hours</strong> `
      );
    }

    if (data.mettingReminders.minutes !== result.mettingReminders.minutes) {
      details.push(
        `Meeting Reminder minutes changed from <strong> ${result.mettingReminders.minutes} miniutes</strong> to <strong> ${data.mettingReminders.minutes} miniutes <strong> `
      );
    }

    if (data.chaseOfAction !== result.chaseOfAction) {
      details.push(
        `Chase of Action changed from <strong> ${result.chaseOfAction}</strong> days to <strong> ${data.chaseOfAction}</strong> days`
      );
    }
  } else {
    details.push("Previous meeting reminders not found or undefined.");
  }

  return details;
};

const convertHoursToDays = (totalHours) => {
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  console.log("days", days);
  return { days, hours };
};

const generateLogObjectForConfig = (oldConfig, newConfig) => {
  const logs = [];

  if (
    oldConfig.writeMinuteMaxTimeInHour !== newConfig.writeMinuteMaxTimeInHour
  ) {
    const { days: oldDays, hours: oldHours } = convertHoursToDays(
      oldConfig.writeMinuteMaxTimeInHour
    );
    const { days: newDays, hours: newHours } = convertHoursToDays(
      newConfig.writeMinuteMaxTimeInHour
    );

    logs.push(
      `Allow write minutes / Add new agenda / Generate new MOM of meeting within <strong>${oldDays} days and <strong>${oldHours} hours</strong> changed to <strong>${newDays} days and ${newHours} hours.</strong>`
    );
  }

  if (
    oldConfig.acceptanceRejectionEndtime !==
    newConfig.acceptanceRejectionEndtime
  ) {
    logs.push(
      `Allow acceptance of meeting minutes within <strong>${oldConfig.acceptanceRejectionEndtime} hours</strong> changed to <strong>${newConfig.acceptanceRejectionEndtime} hours</strong>.`
    );
  }

  console.log("Generated Logs:", logs);
  return logs;
};

const generateMinuteLogObject = async (result, userId, data) => {
  let details = [];
  if (Object.keys(data).includes("isAction")) {
    if (data.isAction !== result.isAction) {
      if (data.isAction) {
        details.push(
          `<strong> Minute</strong> changed to <strong> Action</strong> `
        );
      } else {
        details.push(
          `<strong> Action</strong> changed to <strong> Minute</strong> `
        );
      }
    } else {
      Object.keys(data).forEach((key) => {
        let resultValue = result[key];
        let dataValue = data[key];

        if (typeof resultValue === "string" && typeof dataValue === "string") {
          if (dataValue.toString() !== resultValue.toString()) {
            details.push(
              `${convertFirstLetterToCapital(
                key
              )} changed from <strong> ${convertFirstLetterToCapital(
                resultValue
              )}</strong> to <strong> ${convertFirstLetterToCapital(
                dataValue
              )}</strong> `
            );
          }
        }
        if (key === "dueDate") {
          const oldDate = formatDateTimeFormat(result.dueDate).formattedDate;

          const newDate = formatDateTimeFormat(
            new Date(data.dueDate)
          ).formattedDate;
          if (oldDate !== newDate) {
            details.push(
              `Due date changed from <strong> ${oldDate}</strong> to <strong> ${newDate}</strong> `
            );
          }
        }
      });
    }
    return details;
  } else {
    Object.keys(data).forEach((key) => {
      let resultValue = result[key];
      let dataValue = data[key];

      if (typeof resultValue === "string" && typeof dataValue === "string") {
        if (dataValue.toString() !== resultValue.toString()) {
          details.push(
            `${convertFirstLetterToCapital(
              key
            )} changed from <strong> ${convertFirstLetterToCapital(
              resultValue
            )}</strong> to <strong> ${convertFirstLetterToCapital(
              dataValue
            )}</strong> `
          );
        }
      }
      if (key === "dueDate") {
        const oldDate = formatDateTimeFormat(result.dueDate).formattedDate;
        const newDate = formatDateTimeFormat(
          new Date(data.dueDate)
        ).formattedDate;
        if (oldDate !== newDate) {
          details.push(
            `Due date changed from <strong> ${oldDate}</strong> to <strong> ${newDate}</strong> `
          );
        }
      }
    });
  }
};

const generateLogObjectForUpdateAttendance = async (
  result,
  userId,
  data,
  attendedUsersDetails,
  absentUsersDetails
) => {
  let details = [];
  const oldFromTime = formatTimeFormat(result.fromTime);
  const newFromTime = formatTimeFormat(data.fromTime);
  if (oldFromTime !== newFromTime) {
    details.push(
      `Meeting from time changed from <strong> ${oldFromTime}</strong> to <strong> ${newFromTime}</strong> `
    );
  }
  const oldToTime = formatTimeFormat(result.toTime);
  const newToTime = formatTimeFormat(data.toTime);
  if (oldToTime !== newToTime) {
    details.push(
      `Meeting to time changed from <strong> ${oldToTime}</strong> to <strong> ${newToTime}</strong> `
    );
  }
  const attendedUserList =
    attendedUsersDetails.length &&
    attendedUsersDetails.map((user) => {
      return "<strong>" + user.name + " (" + user.email + ")" + "</strong>";
    });

  const absentUserList =
    absentUsersDetails.length &&
    absentUsersDetails.map((user) => {
      return "<strong>" + user.name + " (" + user.email + ")" + "</strong>";
    });
  let attendMessage =
    attendedUsersDetails?.length !== 0
      ? attendedUserList.length == 1
        ? attendedUserList.join("") + " is marked as present"
        : attendedUserList.join(",") + " are marked as present"
      : null;
  let absentMessage =
    absentUsersDetails?.length !== 0
      ? absentUserList.length === 1
        ? absentUserList.join("") + " is marked as absent "
        : absentUserList.join(",") + " are marked as absent "
      : null;
  let finalAttendeeMessage =
    attendMessage !== null && absentMessage !== null
      ? attendMessage + " & " + absentMessage
      : attendMessage == null && absentMessage !== null
        ? absentMessage
        : attendMessage !== null && absentMessage == null
          ? attendMessage
          : null;
  details.push(finalAttendeeMessage);
  return details;
};

const generateLogObjectForMOMWrite = async (
  result,
  userId,
  data,
  addedUsersDetails,
  removedUsersDetails
) => {
  let details = [];

  // Function to format user list with bold HTML
  const formatUserList = (userList) => {
    return userList.map((user) => `<strong>${user.name} (${user.email})</strong>`).join(", ");
  };

  // Message for users granted MOM write permission
  const attendMessage = addedUsersDetails.length
    ? `${formatUserList(addedUsersDetails)} ${addedUsersDetails.length === 1 ? "is" : "are"} given MOM write permission`
    : null;

  // Message for users whose MOM write permission was removed
  const absentMessage = removedUsersDetails.length
    ? `${formatUserList(removedUsersDetails)} ${removedUsersDetails.length === 1 ? "is" : "are"} removed from MOM write permission`
    : null;

  // Push messages to details array
  console.log("attendMessage", attendMessage)
  if (attendMessage) {
    details.push(attendMessage);
  }
  console.log("absentMessage-->", absentMessage)
  if (absentMessage) {
    details.push(absentMessage);
  }


  // Return all messages as a single string
  return details.join(" , ");
};





const convertIsoFormat = (date) => {
  const utcDate = new Date(date);
  const utcOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istDate = new Date(utcDate.getTime() + utcOffset);
  return istDate.toISOString();
};

const getDaysDiiference = (fromDate, toDate) => {
  let date1 = new Date(fromDate.toString());
  let date2 = new Date(toDate.toString());
  let utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  let utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  let timeDiff = utc2 - utc1;
  let daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return daysDiff;
};

const getIp = (req) => {
  let ip = requestIp.getClientIp(req);
  if (ip.substr(0, 7) == "::ffff:") {
    ip = ip.substr(7);
  }
  return ip;
};

const camelToFlat = (camel) => {
  const camelCase = camel.replace(/([a-z])([A-Z])/g, "$1 $2");

  return (
    camelCase.trimStart().charAt(0).toUpperCase() +
    camelCase.toLowerCase().slice(1)
  );
};


const generateRandomSixDigitNumber = () => {
  return Math.floor(100000 + Math.random() * 900000); // Generates a number between 100000 and 999999
};

const generateAlphaNumericPasscode = (length) => {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let passcode = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    passcode += characters[randomIndex];
  }
  return passcode;
};

module.exports = {
  generateOtp,
  otpExpiryTime,
  checkTimeDifference,
  generetHashPassword,
  verifyPassword,
  generateLogObject,
  formatDateTimeFormat,
  getTimeSession,
  formatTimeFormat,
  formatTimeFormat2,
  convertFirstLetterToCapital,
  customMeetingId,
  combineDateAndTime,
  convertFirstLetterOfFullNameToCapital,
  decryptWithAES,
  generateLogObjectForMeetingRoom,
  generateLogObjectForConfig,
  generateLogObjectForAlert,
  generateLogObjectForOrganization,
  generateAgendaLogObject,
  generateMinuteLogObject,
  generateLogObjectForMeeting,
  generateLogObjectForRescheduleMeeting,
  generateLogObjectForUpdateAttendance,
  generateLogObjectForMOMWrite,
  convertTimetoIST,
  convertIsoFormat,
  getDaysDiiference,
  getIp,
  camelToFlat,
  encryptWithAES,
  generateRandomSixDigitNumber,
  generateAlphaNumericPasscode,
  generateLogObjectDepartment,
  generateLogObjectForDesignation
};
