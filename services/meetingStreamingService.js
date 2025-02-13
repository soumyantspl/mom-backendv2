const MeetingHostDetails = require("../models/meetingHostDetails");
const commonHelper = require("../helpers/commonHelper");
const axios = require("axios");
const ObjectId = require("mongoose").Types.ObjectId;
const Meetings = require("../models/meetingModel");
const HostingDetails = require("../models/hostingDetailsModel");
const { schedule } = require("node-cron");
const api_base_url = "https://api.zoom.us/v2"; // base url for zoom api call
// config as a auth required for auth login;
let config = {
  method: "post",
  maxBodyLength: Infinity,
  url: `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
  headers: {
    "Content-Type": "application/json",
  },
  auth: {
    username: process.env.ZOOM_CLIENT_ID,
    password: process.env.ZOOM_CLIENT_SECRET,
  },
};
// function to create a zoom meeting, it's requires 3 parameters (topic as String, duratioin as Numbers, start_time as Date)
const createZoomMeeting = async () =>
  // topic,
  // duration,
  // start_time,
  // //agenda,
  // //password,
  // timezone
  {
    try {
      console.log("in--------------------------------1-", config);
      let authResponse;
      await axios
        .request(config)
        .then((response) => {
          authResponse = response.data;
          console.log("authResponse==================", authResponse);
        })
        .catch((error) => {
          console.log(error);
        });
      const access_token = authResponse.access_token;
      const headers = {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      };
      console.log("in----------------------------22-----");
      // let data = JSON.stringify({
      //   agenda: "my agenda",
      //   default_password: false,
      //   topic: "my topic",
      //   type: 2,
      //   //start_time: new Date().toLocaleDateString(),
      //   start_time: "2025-01-14T14:28:57Z",
      //   duration: 48,
      //   timezone: "UTC",

      //   //password: "Demo@123", //10 characters and only contain alphanumeric characters and the @, -, _, and * characters.
      //   settings: {
      //     alternative_hosts: "soumya.mishra@ntspl.co.in",
      //    // email_notification: true,
      //     meeting_authentication: true,
      //     // //  schedule_for: "node.js@ntspl.co.in",
      //     // // authentication_exception: [
      //     // //   {
      //     // //     email: "node.js@ntspl.co.in",
      //     // //   },
      //     // // ],
      //     meeting_invitees: [
      //       {
      //         email: "soumyamishra.mishra8@gmail.com",
      //       },
      //       {
      //         email: "node.js@ntspl.co.in",
      //       },
      //       {
      //         email: "soumya.mishra@ntspl.co.in",
      //       }
      //     ],
      //     // // breakout_room: {
      //     // //   enable: true,
      //     // //   rooms: [
      //     // //     {
      //     // //       name: "room1",
      //     // //       participants: ["node.js@ntspl.co.in"],
      //     // //     },
      //     // //   ],
      //     // // },

      //      alternative_hosts_email_notification: true,
      //      calendar_type: 2,
      //     // watermark: true,
      //      auto_recording: "cloud",
      //     // calendar_type: 1,
      //      join_before_host: true,
      //     // participant_video: true,
      //     // private_meeting: true,
      //     // meeting_authentication: true
      //   },
      // });

      let data = JSON.stringify({
        topic: "my topic2",
        agenda: "my agenda",
        type: 2, // Scheduled meeting
        start_time: "2024-12-31T12:52:57Z", // Start time in ISO 8601 format (UTC)
        duration: 48, // Duration in minutes
        timezone: "Asia/Kolkata", // Meeting timezone
        private_meeting: true,
        password: commonHelper.generateAlphaNumericPasscode(6),
        // alternative_hosts: "soumya.mishra@ntspl.co.in", // Alternative host email
        settings: {
          enforce_login: false,
          email_notification: true,
          meeting_authentication: false,
          calendar_type: 2,
          watermark: true,
          // meeting_invitees,
          // auto_recording: "cloud",
          join_before_host: true,
          participant_video: true,
          private_meeting: true,
          waiting_room: false,
          calendar_type: 2,
          //  registration_type: 3,
          //  approval_type: 0,
          meeting_invitees: [
            { email: "node.js@ntspl.co.in" },
            { email: "soumya.mishra@ntspl.co.in" },
          ],
        },
      });
      console.log("in-----------------------------33----", data);
      const meetingResponse = await axios.post(
        `${api_base_url}/users/me/meetings`,
        data,
        { headers }
      );
      console.log("in---------------------------44------");
      console.log(meetingResponse);
      if (meetingResponse.status !== 201) {
        return "Unable to generate meeting link";
      }
      const response_data = meetingResponse.data;
      let content = {
        meeting_url: response_data.join_url,
        meetingTime: response_data.start_time,
        purpose: response_data.topic,
        duration: response_data.duration,
        message: "Success",
        status: 1,
        id: response_data.id,
        password: response_data.password,
        start_url: response_data.start_url,
      };
      console.log("response_data=>>>>>>>>>>>>>>>>>>>>>>", response_data);
      // let hostKey = commonHelper.generateRandomSixDigitNumber();

      // const userUpdateResponse = await axios.patch(
      //   `${api_base_url}/users/${response_data?.host_id}`,
      //   {
      //     host_key: hostKey, // New host key (must be 6 digits)
      //   },
      //   { headers }
      // );

      // console.log("a=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", userUpdateResponse);
      // if (userUpdateResponse) {
      //   content["hostKey"] = hostKey;
      // }

      // const userUpdateResponse = await axios.patch(
      //   `${api_base_url}/users/${response_data?.host_id}/settings`,
      //   {
      //     "schedule_meeting": {
      //       "host_key": "654321"
      //     }
      //   },
      //   { headers }
      // );

      //  console.log("a=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", userUpdateResponse);

      // Replace with your meeting ID
      // const meetingId = response_data.id;

      // // Create a meeting registrant
      // const participantsRes = await axios.get(
      //   `https://api.zoom.us/v2/meetings/${meetingId}/participants`,
      //   {
      //     headers,
      //   }
      // );
      // console.log("participantsRes--------------", participantsRes);

      // // Define the registrant's details
      // const registrantData = {
      //   email: "soumya.mishra@ntspl.co.in", // Registrant's email address
      //   first_name: "soumya",
      //   last_name: "Ntspl",
      //   // address: '123 Street, City, Country', // Optional field
      //   // city: 'City', // Optional field
      //   // zip: '12345', // Optional field
      //   // country: 'US' // Optional field
      // };

      // // Create a meeting registrant
      // const createRegistrantResponse = await axios.post(
      //   `https://api.zoom.us/v2/meetings/${meetingId}/registrants`,
      //   registrantData,
      //   {
      //     headers,
      //   }
      // );
      // console.log(
      //   "createRegistrantResponse--------------",
      //   createRegistrantResponse
      // );

      // const registrantId = createRegistrantResponse?.data?.registrant_id;
      // const apiEndpoint = `https://api.zoom.us/v2/meetings/${meetingId}/registrants/${registrantId}`;
      // console.log("apiEndpoint===============>", apiEndpoint);
      // // Set the user as a co-host
      // const updateData = {
      //   co_host: true,
      // };

      // // Add a co-host to the meeting
      // const addCoHost = await axios.patch(apiEndpoint, updateData, {
      //   headers,
      // });

      // console.log("addCoHost--------------", addCoHost);

      // const userResponse = await axios.get(
      //   `https://api.zoom.us/v2/users/${response_data?.host_id}/settings`,
      //   { headers }
      // );

      // console.log(userResponse.data);
      console.log("content===================????????????", content);
      return content;
    } catch (e) {
      console.log(e);

      return e;
    }
  };

const createZoomMeetingForMOMOld = async (
  topic,
  duration,
  start_time,
  //agenda,
  //password,
  timezone,
  meeting_invitees,
  meeting
) => {
  const organizationHostingDetails = await HostingDetails.findOne({
    organizationId: meeting?.organizationId,
    isActive: true,
  });

  if (organizationHostingDetails) {
    const clientId = organizationHostingDetails?.zoomCredentials?.clientId;
    const accountId = organizationHostingDetails?.zoomCredentials?.accountId;
    const secretToken =
      organizationHostingDetails?.zoomCredentials?.secretToken;

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
      headers: {
        "Content-Type": "application/json",
      },
      auth: {
        username: clientId,
        password: secretToken,
      },
    };
    console.log("in--------------------------------1-", meeting_invitees);

    let authResponse;
    await axios
      .request(config)
      .then((response) => {
        authResponse = response.data;
      })
      .catch((error) => {
        console.log(error);
      });
    const access_token = authResponse.access_token;
    const headers = {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    };
    console.log("in----------------------------22-----");
    // let data = JSON.stringify({
    //   topic: topic,
    //   type: 2,
    //   start_time: start_time,
    //   duration: duration,
    //   timezone: timezone,
    //   // agenda: agenda,
    //   // password: password,
    //   settings: {
    //     allow_multiple_devices: true,
    //     join_before_host: false,
    //     waiting_room: false,
    //   },
    // });
    const meetingDate = new Date(meeting.date);
    console.log("meetingDate============", meetingDate);
    const meetingDateTime = commonHelper.combineDateAndTime(
      meetingDate,
      meeting.fromTime
    );
    console.log("meetingDateTime--------------", meetingDateTime);

    const startTime = new Date(commonHelper.convertIsoFormat(meetingDateTime));
    console.log("startTime===============", startTime, duration);
    console.log(startTime, duration);

    let data = JSON.stringify({
      // agenda: "my agenda",
      default_password: false,
      topic,
      type: 2,
      start_time: startTime,
      //start_time: new Date().toLocaleDateString(),
      //start_time: "2024-11-14T14:28:57Z",
      duration: Math.round(duration),
      // timezone: "UTC",
      timezone: "Asia/Kolkata",
      //password: "Demo@123", //10 characters and only contain alphanumeric characters and the @, -, _, and * characters.
      settings: {
        email_notification: true,
        meeting_authentication: true,
        // meeting_invitees,
        // alternative_hosts: "node.js@ntspl.co.in;",
        calendar_type: 2,
        watermark: true,
        meeting_invitees,
        // auto_recording: "cloud",
        join_before_host: true,
        participant_video: true,
        private_meeting: true,
        waiting_room: false,
      },
    });

    console.log("in-----------------------------33----");
    const meetingResponse = await axios.post(
      `${api_base_url}/users/me/meetings`,
      data,
      { headers }
    );
    console.log("in---------------------------44------");
    console.log(meetingResponse);
    if (meetingResponse.status !== 201) {
      return "Unable to generate meeting link";
    }
    const response_data = meetingResponse.data;
    const content = {
      meeting_url: response_data.join_url,
      meetingTime: response_data.start_time,
      purpose: response_data.topic,
      duration: response_data.duration,
      message: "Success",
      status: 1,
      id: response_data.id,
      password: response_data.password,
      host_url: response_data.start_url,
    };
    return content;
  } else {
    return false;
  }
  // } catch (e) {
  //   return e;
  // }
};

const updateZoomMeetingForMOM = async (
  topic,
  duration,
  start_time,
  //agenda,
  //password,
  timezone,
  meeting_invitees,
  meeting
) => {
  try {
    const organizationHostingDetails = await HostingDetails.findOne({
      organizationId: meeting?.organizationId,
      isActive: true,
    });

    if (organizationHostingDetails) {
      const clientId = commonHelper?.decryptWithAES(
        organizationHostingDetails?.zoomCredentials?.clientId
      );
      const accountId = commonHelper?.decryptWithAES(
        organizationHostingDetails?.zoomCredentials?.accountId
      );
      const secretToken = commonHelper?.decryptWithAES(
        organizationHostingDetails?.zoomCredentials?.secretToken
      );
      const hostKey = commonHelper?.decryptWithAES(
        organizationHostingDetails?.zoomCredentials?.hostKey
      );

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
        headers: {
          "Content-Type": "application/json",
        },
        auth: {
          username: clientId,
          password: secretToken,
        },
      };
      console.log("in--------------------------------1-", meeting_invitees);

      console.log("in--------------------------------1-", meeting_invitees);
      console.log("in--------------------------------1-", config);
      //fffffffffff
      let authResponse;
      await axios
        .request(config)
        .then((response) => {
          authResponse = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
      const access_token = authResponse.access_token;
      const headers = {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      };
      console.log("in----------------------------22-----");
      console.log("meeting.date============", meeting.date);
      console.log("meeting.fromtime============", meeting.fromTime);
      const meetingDate = new Date(meeting.date);
      console.log("meetingDate============", meetingDate);
      const meetingDateTime = commonHelper.combineDateAndTime(
        meetingDate,
        meeting.fromTime
      );
      console.log("meetingDateTime--------------", meetingDateTime);

      const startTime = new Date(
        commonHelper.convertIsoFormat(meetingDateTime)
      );
      console.log("startTime===============", startTime, duration);

      let data = JSON.stringify({
        default_password: false,
        topic,
        type: 2,
        start_time: startTime,
        duration: Math.round(duration),
        timezone: "Asia/Kolkata",
        settings: {
          email_notification: true,
          enforce_login: false,
          meeting_authentication: false,
          calendar_type: 2,
          watermark: true,
          meeting_invitees,
          join_before_host: true,
          participant_video: true,
          private_meeting: true,
          waiting_room: false,
        },
      });

      console.log("in-----------------------------33----");

      const meetingHostDetails = await MeetingHostDetails.find(
        { meetingId: new ObjectId(meeting?._id) },
        { _id: 1, meetingId: 1, hostMeetingId: 1 }
      )
        .sort({ _id: -1 })
        .limit(1);
      console.log("meetingHostDetails===========", meetingHostDetails);

      if (meetingHostDetails?.length !== 0) {
        const zoomMeetingId = meetingHostDetails[0].hostMeetingId;

        const meetingResponse = await axios.patch(
          `${api_base_url}/meetings/${parseInt(zoomMeetingId)}`,
          data,
          { headers }
        );
        console.log("in---------------------------44------");
        console.log(meetingResponse);
        if (meetingResponse.status !== 204) {
          return "Unable to generate meeting link";
        }
        return { zoomMeetingId, startTime };
      }
    } else {
      return false;
    }
  } catch (meetingResponse) {
    console.log("err===============>>>>>>>>", meetingResponse);

    const responseData = meetingResponse.response.data;
    console.log("responseData--------------ww", responseData);

    return responseData;
  }
};

const getRecordingsZoomMeetingForMOM = async (meetingId) => {
  try {
    const meeting = await Meetings.findOne(
      {
        _id: new ObjectId(meetingId),
        isActive: true,
      },
      { _id: 1, organizationId: 1 }
    );

    const organizationHostingDetails = await HostingDetails.findOne({
      organizationId: meeting?.organizationId,
      isActive: true,
    });
    console.log(
      "organizationHostingDetails====================================>>>>>>>>>>",
      organizationHostingDetails
    );
    if (organizationHostingDetails) {
      const clientId = commonHelper?.decryptWithAES(
        organizationHostingDetails?.zoomCredentials?.clientId
      );
      const accountId = commonHelper?.decryptWithAES(
        organizationHostingDetails?.zoomCredentials?.accountId
      );
      const secretToken = commonHelper?.decryptWithAES(
        organizationHostingDetails?.zoomCredentials?.secretToken
      );
      const hostKey = commonHelper?.decryptWithAES(
        organizationHostingDetails?.zoomCredentials?.hostKey
      );
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
        headers: {
          "Content-Type": "application/json",
        },
        auth: {
          username: clientId,
          password: secretToken,
        },
      };

      const authResponse = await axios.request(config);
      console.log(
        "authResponse=====================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
        authResponse
      );
      const access_token = authResponse?.data?.access_token;
      const headers = {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      };

      const meetingHostDetails = await MeetingHostDetails.find(
        { meetingId: new ObjectId(meetingId) },
        { _id: 1, meetingId: 1, hostMeetingId: 1 }
      )
        .sort({ _id: -1 })
        .limit(1);
      console.log("meetingHostDetails===========22", meetingHostDetails);

      if (meetingHostDetails?.length !== 0) {
        const zoomMeetingId = meetingHostDetails[0].hostMeetingId;
        // Fetch the Meeting UUID
        // const meetingUUID = await fetchMeetingUUID(zoomMeetingId,access_token);
        console.log("Meeting UUID:");
        const meetingResponse = await axios.get(
          `${api_base_url}/meetings/${parseInt(zoomMeetingId)}/recordings`,
          { headers }
        );
        console.log("Recordings:", meetingResponse.data);
        if (
          meetingResponse.data.recording_files &&
          meetingResponse.data.recording_files.length > 0
        ) {
          const recording_files = meetingResponse.data.recording_files.filter(
            (recording) => recording?.file_type === "MP4"
          );
          meetingResponse.data.recording_files = recording_files;
          return { success: true, data: meetingResponse.data };
        } else {
          return {
            success: true,
            message: "No recordings found for this meeting.",
          };
        }
      }
      return {
        success: true,
        message: "No recordings found for this meeting.",
      };
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        return {
          success: false,
          message: "No recordings found or meeting does not exist.",
        };
      } else {
        return {
          success: false,
          message: `API Error: ${error.response.data.message}`,
        };
      }
    } else {
      return { success: false, message: `Network Error: ${error.message}` };
    }
  }
};

// Function to fetch the meeting UUID
const fetchMeetingUUID = async (meetingId, access_token) => {
  try {
    const response = await axios.get(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    console.log("response.data;=============", response.data);
    return response.data.uuid;
  } catch (error) {
    console.error(
      "Error fetching meeting UUID:",
      error.response ? error.response.data : error.message
    );
  }
};

const createZoomMeetingForMOM = async (
  topic,
  duration,
  start_time,
  //agenda,
  //password,
  timezone,
  meeting_invitees,
  meeting
) => {
  const organizationHostingDetails = await HostingDetails.findOne({
    organizationId: meeting?.organizationId,
    isActive: true,
  });
  console.log(
    "organizationHostingDetails====================================>>>>>>>>>>",
    organizationHostingDetails
  );
  if (organizationHostingDetails) {
    const clientId = commonHelper?.decryptWithAES(
      organizationHostingDetails?.zoomCredentials?.clientId
    );
    const accountId = commonHelper?.decryptWithAES(
      organizationHostingDetails?.zoomCredentials?.accountId
    );
    const secretToken = commonHelper?.decryptWithAES(
      organizationHostingDetails?.zoomCredentials?.secretToken
    );
    const hostKey = commonHelper?.decryptWithAES(
      organizationHostingDetails?.zoomCredentials?.hostKey
    );
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
      headers: {
        "Content-Type": "application/json",
      },
      auth: {
        username: clientId,
        password: secretToken,
      },
    };

    const authResponse = await axios.request(config);
    console.log(
      "authResponse=====================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
      authResponse
    );
    const access_token = authResponse?.data?.access_token;
    const headers = {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    };
    console.log("in----------------------------22-----");

    const meetingDate = new Date(meeting.date);
    console.log("meetingDate============", meetingDate);
    const meetingDateTime = commonHelper.combineDateAndTime(
      meetingDate,
      meeting.fromTime
    );
    console.log("meetingDateTime--------------", meetingDateTime);

    const startTime = new Date(commonHelper.convertIsoFormat(meetingDateTime));
    console.log("startTime===============", startTime, duration);
    console.log(startTime, duration);

    let data = JSON.stringify({
      default_password: false,
      topic,
      type: 2,
      start_time: startTime,
      duration: Math.round(duration),
      timezone: "Asia/Kolkata",
      private_meeting: true,
      password: commonHelper.generateAlphaNumericPasscode(6),
      settings: {
        enforce_login: false,
        meeting_authentication: false,
        email_notification: true,
        calendar_type: 2,
        watermark: true,
        meeting_invitees,
        // auto_recording: "cloud",
        join_before_host: true,
        participant_video: true,
        private_meeting: true,
        waiting_room: false,
      },
    });

    console.log("in-----------------------------33----");
    const meetingResponse = await axios.post(
      `${api_base_url}/users/me/meetings`,
      data,
      { headers }
    );
    console.log("in---------------------------44------");
    console.log(meetingResponse);
    if (meetingResponse.status !== 201) {
      return "Unable to generate meeting link";
    }
    const response_data = meetingResponse.data;
    const content = {
      meeting_url: response_data.join_url,
      meetingTime: response_data.start_time,
      purpose: response_data.topic,
      duration: response_data.duration,
      message: "Success",
      status: 1,
      id: response_data.id,
      password: response_data.password,
      host_url: response_data.start_url,
      hostKey,
    };
    return content;
  } else {
    return false;
  }
  // } catch (e) {
  //   return e;
  // }
};

const getRecordingsZoomMeetingForMOM1 = async () => {
  try {
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
      headers: {
        "Content-Type": "application/json",
      },
      auth: {
        username: process.env.ZOOM_CLIENT_ID,
        password: process.env.ZOOM_CLIENT_SECRET,
      },
    };

    const authResponse = await axios.request(config);
    console.log(
      "authResponse=====================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
      authResponse
    );
    const access_token = authResponse?.data?.access_token;
    const headers = {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    };

    const zoomMeetingId = "87367978455";
    // Fetch the Meeting UUID
    // const meetingUUID = await fetchMeetingUUID(zoomMeetingId,access_token);
    console.log("Meeting UUID:");
    const meetingResponse = await axios.get(
      `${api_base_url}/meetings/${parseInt(zoomMeetingId)}/recordings`,
      { headers }
    );
    console.log("Recordings:", meetingResponse.data);
    if (
      meetingResponse.data.recording_files &&
      meetingResponse.data.recording_files.length > 0
    ) {
      const recording_files = meetingResponse.data.recording_files.filter(
        (recording) => recording?.file_type === "MP4"
      );
      meetingResponse.data.recording_files = recording_files;
      return { success: true, data: meetingResponse.data };
    } else {
      return {
        success: true,
        message: "No recordings found for this meeting.",
      };
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        return {
          success: false,
          message: "No recordings found or meeting does not exist.",
        };
      } else {
        return {
          success: false,
          message: `API Error: ${error.response.data.message}`,
        };
      }
    } else {
      return { success: false, message: `Network Error: ${error.message}` };
    }
  }
};

const deleteZoomRecording = async (meetingId, recordingId, organizationId) => {
  const organizationHostingDetails = await HostingDetails.findOne({
    organizationId: organizationId,
    isActive: true,
  });
  console.log(
    "organizationHostingDetails====================================>>>>>>>>>>",
    organizationHostingDetails
  );
  if (organizationHostingDetails) {
    const clientId = commonHelper?.decryptWithAES(
      organizationHostingDetails?.zoomCredentials?.clientId
    );
    const accountId = commonHelper?.decryptWithAES(
      organizationHostingDetails?.zoomCredentials?.accountId
    );
    const secretToken = commonHelper?.decryptWithAES(
      organizationHostingDetails?.zoomCredentials?.secretToken
    );
    const hostKey = commonHelper?.decryptWithAES(
      organizationHostingDetails?.zoomCredentials?.hostKey
    );
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
      headers: {
        "Content-Type": "application/json",
      },
      auth: {
        username: clientId,
        password: secretToken,
      },
    };

    const authResponse = await axios.request(config);
    console.log(
      "authResponse=====================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
      authResponse
    );
    const access_token = authResponse?.data?.access_token;
    const headers = {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    };

    const meetingHostDetails = await MeetingHostDetails.findOne(
      { meetingId: new ObjectId(meetingId) },
      { _id: 1, meetingId: 1, hostMeetingId: 1 }
    );

    console.log("meetingHostDetails===========22", meetingHostDetails);

    if (meetingHostDetails) {
      const zoomMeetingId = meetingHostDetails?.hostMeetingId;

      // const url = `https://api.zoom.us/v2/meetings/${meetingId}/recordings/${recordingId}`;
      const meetingResponse = await axios.delete(
        `${api_base_url}/meetings/${parseInt(
          zoomMeetingId
        )}/recordings/${recordingId}`,
        { headers }
      );

      console.log("Recording deleted successfully:", meetingResponse.data);
      return true;
    }
  }
};

module.exports = {
  createZoomMeeting,
  createZoomMeetingForMOM,
  updateZoomMeetingForMOM,
  getRecordingsZoomMeetingForMOM,
  deleteZoomRecording,
};
