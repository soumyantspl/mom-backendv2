const fs = require("fs");
const MeetingHostDetails = require("../models/meetingHostDetails");
const { google } = require("googleapis");
const { v4: uuidv4 } = require("uuid");
const commonHelper = require("../helpers/commonHelper");
const ObjectId = require("mongoose").Types.ObjectId;
const HostingDetails = require("../models/hostingDetailsModel");
// Load credentials
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar",
];

const redirect_uris = [
  "https://mom.ntspl2222.co.in",
  "http://localhost222:3000",
];
const client_id =
  "260087855691-e91cmkn3allf0gagu5sfas2jfifhv1in.apps.googleusercontent.com";

const client_secret = "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";
const code =
  "4/0ASVgi3LyrYaudzwBc-eqfSPpPyGaIvgHYEPubfWZFfO286eeMsguy4444fSfeeOnLWgRaQ";

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  "http://localhost:3000/hosting-details"
);

// Generate an authentication URL
const getAuthUrl = () => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    access_type: "offline",
  });
  console.log("Authorize this app by visiting:", authUrl);
};

// Exchange authorization code for an access token
const getAccessToken = async (code) => {
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync("token.json", JSON.stringify(tokens));
  console.log("Access token stored to token.json");
};

// Authenticate using OAuth2
async function authenticate() {
  console.log("===========================================11111=");
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    "http://localhost:3000/hosting-details"
  );

  // Load previously stored token or generate new one
  const TOKEN_PATH = "token.json";
  if (!fs.existsSync(TOKEN_PATH)) {
    console.log("===========================================22222=");

    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));

    console.log("===========================================3567=", token);

    const newToken = await refreshAccessToken(token?.refresh_token);
    oAuth2Client.setCredentials(newToken);
    // //  Listen for token refresh events and update the file
    // oAuth2Client.on("tokens", (newTokens) => {
    //   console.log("===========================================33333=");
    //   if (newTokens.refresh_token) {
    //     token.refresh_token = newTokens.refresh_token; // Only update if we get a new refresh token
    //   }
    //   console.log(
    //     "newTokens.access_token===========================",
    //     newTokens.access_token
    //   );
    //   token.access_token = newTokens.access_token;
    //   fs.writeFileSync("token.json", JSON.stringify(token));
    // });
  } else {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent", // Forces Google to issue a new refresh token
      scope: SCOPES,
    });
    console.log("Authorize this app by visiting:", authUrl);
  }

  return oAuth2Client;
}

const refreshAccessToken = async (refresh_token) => {
  oAuth2Client.setCredentials({
    refresh_token,
  });
  const { credentials } = await oAuth2Client.refreshAccessToken();
  //  fs.writeFileSync("token.json", JSON.stringify(credentials));
  console.log("New Access Token:", credentials);
  return credentials;
};

// Function to get a new token
function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this URL:", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("Enter the code from that page here: ", (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          console.error("Error retrieving access token", err);
          return;
        }
        oAuth2Client.setCredentials(token);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        console.log("Token stored to", TOKEN_PATH);
        resolve(oAuth2Client);
      });
    });
  });
}

const getRefreshToken = async () => {
  try {
    const { tokens } = await oauth2Client.getToken(authCode);
    console.log("Tokens received:", tokens);
  } catch (error) {
    console.error("Error getting refresh token:", error);
  }
};

// try {
//   const code2="4%2F0ASVgi3JFqPqLUuj_ToBpkBEOTLJRD7jP4PDlR87X1CEzwcg8hWWCZmxhxsLbA4laNkjnfg"
// const decodedCode = decodeURIComponent(code2);
// const { tokens } = await oAuth2Client.getToken(decodedCode);
// oAuth2Client.setCredentials(tokens);
// fs.writeFileSync("token.json", JSON.stringify(tokens));
// console.log("Token saved successfully!");
// } catch (error) {
// console.error("Error fetching token:", error.message);
// }
// MMM
// Create a Google Meet meeting
async function createGMeeting() {
  // const decodedCode = decodeURIComponent(code);
  // const { tokens } = await oAuth2Client.getToken(decodedCode);
  // oAuth2Client.setCredentials(tokens);
  // fs.writeFileSync("token.json", JSON.stringify(tokens));
  // console.log("Token saved successfully!", tokens);
  const auth = await authenticate();
  const calendar = google.calendar({ version: "v3", auth });
  const event = {
    summary: "Google Meet Meeting test 1",
    description:
      "This is a test meeting created using the Google Calendar API.",
    location: "Online (Google Meet)",
    start: {
      dateTime: "2025-02-12T05:05:00-07:00",
      timeZone: "Asia/Kolkata",
    },

    end: {
      dateTime: "2025-02-12T06:15:00-07:00",
      timeZone: "Asia/Kolkata",
    },
    conferenceData: {
      createRequest: {
        requestId: "unique-request-id-12345", // Must be unique per request
        conferenceSolutionKey: { type: "hangoutsMeet" }, // Required for Google Meet
      },
    },
    attendees: [
      { email: "node.js@ntspl.co.in" },
      { email: "soumyamishra.mishra8@gmail.com" },
      //  { email: "monalisamahantantspl@gmail.com"  },
      // { email: "seo@ntspl.co.in" },
    ],
    sendUpdates: "all", // Options: "none", "externalOnly", "all"
    visibility: "private", // Options: "default", "public", "private"
    guestsCanModify: true, // Allows guests to edit the event
    guestsCanInviteOthers: true, // Allows guests to invite others
    guestsCanSeeOtherGuests: true, // Hides guest list from attendees
    reminders: { useDefault: true },
    // attachments: [
    //   {
    //     fileUrl: "https://drive.google.com/file/d/1234567890/view",
    //     title: "Meeting Agenda",
    //     mimeType: "application/pdf",
    //   },
    // ],
    // recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR"], // Weekly on Monday, Wednesday, and Friday
    // reminders: {
    //   useDefault: false,
    //   overrides: [
    //     { method: "email", minutes: 10 }, // Email reminder 10 minutes before
    //     { method: "popup", minutes: 5 }, // Popup reminder 5 minutes before
    //   ],
    // },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
    sendUpdates: "all", // Sends email invitations to all attendees
    conferenceDataVersion: 1,
  });
  // console.log("Google Meet Link:", response.data);

  const eventId = response.data.id; // Replace with your event ID

  // await calendar.events.patch({
  //   //auth: jwtClient,
  //   calendarId: 'primary',
  //   eventId: eventId,
  //   resource: {
  //     attendees: [
  //       { email: 'soumyamishra.mishra8@gmail.com', responseStatus: 'accepted', role: 'co-host' }, // Set role to co-host
  //     ],
  //   },
  // }, (err, event) => {
  //   if (err) {
  //     console.error('Error updating event:', err);
  //     return;
  //   }
  //   else{
  //     console.log('Event updated with co-host:======================4567777777777777',event.data.attendees)
  //   }
  //   console.log('Event updated with co-host:======================', event.data.htmlLink);
  // });

  return response.data.hangoutLink;
}

// Function to Add Event
async function addEvent() {
  const auth = await authenticate();
  const calendar = google.calendar({ version: "v3", auth });
  const event = {
    summary: "Meeting with Team",
    location: "Google Meet",
    description: "Discuss project updates.",
    start: { dateTime: "2025-02-19T10:00:00Z", timeZone: "UTC" },
    end: { dateTime: "2025-02-19T11:00:00Z", timeZone: "UTC" },
    attendees: [
      { email: "node.js@ntspl.co.in" },
      { email: "soumyamishra.mishra8@gmail.com" },
      { email: "soumya.mishra8@ntspl.co.in" },
    ],
    reminders: { useDefault: true },
  };

  calendar.events.insert(
    {
      calendarId: "primary",
      resource: event,
    },
    (err, event) => {
      if (err) return console.error("Error adding event:", err);
      console.log("Event created:", event.data.htmlLink);
    }
  );
}


// Authenticate using OAuth2
async function authenticate() {
  console.log("===========================================11111=");
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    "http://localhost:3000/hosting-details"
  );

  // Load previously stored token or generate new one
  const TOKEN_PATH = "token.json";
  if (!fs.existsSync(TOKEN_PATH)) {
    console.log("===========================================22222=");

    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));

    console.log("===========================================3567=", token);

    const newToken = await refreshAccessToken(token?.refresh_token);
    oAuth2Client.setCredentials(newToken);
    // //  Listen for token refresh events and update the file
    // oAuth2Client.on("tokens", (newTokens) => {
    //   console.log("===========================================33333=");
    //   if (newTokens.refresh_token) {
    //     token.refresh_token = newTokens.refresh_token; // Only update if we get a new refresh token
    //   }
    //   console.log(
    //     "newTokens.access_token===========================",
    //     newTokens.access_token
    //   );
    //   token.access_token = newTokens.access_token;
    //   fs.writeFileSync("token.json", JSON.stringify(token));
    // });
  } else {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent", // Forces Google to issue a new refresh token
      scope: SCOPES,
    });
    console.log("Authorize this app by visiting:", authUrl);
  }

  return oAuth2Client;
}
const authenticateData=async (organizationId)=>{
  const gmailCrtedentialsData = await HostingDetails.findOne(
    { organizationId: new ObjectId(organizationId) },
    { gMeetCredentials: 1, organizationId: 1 }
  );
  console.log("gmailCrtedentialsData=================", gmailCrtedentialsData);
  if (gmailCrtedentialsData) {
    const clientId = commonHelper?.decryptWithAES(
      gmailCrtedentialsData?.gMeetCredentials?.clientId
    );
    const secretToken = commonHelper?.decryptWithAES(
      gmailCrtedentialsData?.gMeetCredentials?.secretToken
    );
    const refreshToken = gmailCrtedentialsData?.gMeetCredentials?.tokenData?.refreshToken;
    console.log(clientId);
    console.log(secretToken);
    console.log(refreshToken);
    // Generate authentication URL
    const oAuth2Client = new google.auth.OAuth2(
      clientId,
      secretToken,
      "http://localhost:3000/hosting-details"
    );
   // const newToken = await refreshAccessToken(refreshToken);

    oAuth2Client.setCredentials({
      refresh_token:refreshToken
    });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    //  fs.writeFileSync("token.json", JSON.stringify(credentials));
    console.log("New Access Token:======================", credentials);
   // return credentials;

    const tokenData = {
      accessToken: credentials?.access_token,
      refreshToken: credentials?.refresh_token,
      scope: credentials?.scope,
      tokenType: credentials?.token_type,
      expiryDate: credentials?.expiryDate,
    };
    const saveToenInHostDetails = await HostingDetails.updateOne(
      { organizationId: new ObjectId(organizationId) },
      { $set: { "gMeetCredentials.tokenData": tokenData } }
    );
    oAuth2Client.setCredentials(credentials);
    return oAuth2Client;
}
return false
}


const googleMeetAuthUrl = async (organizationId) => {
  const gmailCrtedentialsData = await HostingDetails.findOne(
    { organizationId: new ObjectId(organizationId) },
    { gMeetCredentials: 1, organizationId: 1 }
  );
  console.log("gmailCrtedentialsData=================", gmailCrtedentialsData);
  if (gmailCrtedentialsData) {
    const clientId = commonHelper?.decryptWithAES(
      gmailCrtedentialsData?.gMeetCredentials?.clientId
    );
    const secretToken = commonHelper?.decryptWithAES(
      gmailCrtedentialsData?.gMeetCredentials?.secretToken
    );
    console.log(clientId);
    console.log(secretToken);
    // Generate authentication URL
    const oauth2Clients = new google.auth.OAuth2(
      clientId,
      secretToken,
      "http://localhost:3000/hosting-details"
    );
    const authUrl = oauth2Clients.generateAuthUrl({
      access_type: "offline",
      prompt: "consent", // Forces Google to issue a new refresh token
      scope: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
    });
    return authUrl;
  }
  return false;
};

// Exchange code for tokens and save to MongoDB
const getAccessTokens = async (code, organizationId) => {
  const gmailCrtedentialsData = await HostingDetails.findOne(
    { organizationId: new ObjectId(organizationId) },
    { gMeetCredentials: 1, organizationId: 1 }
  );

  if (gmailCrtedentialsData) {
    const clientId = commonHelper?.decryptWithAES(
      gmailCrtedentialsData?.gMeetCredentials?.clientId
    );
    const secretToken = commonHelper?.decryptWithAES(
      gmailCrtedentialsData?.gMeetCredentials?.secretToken
    );
    console.log(clientId);
    console.log(secretToken);
    // Generate authentication URL
    const oauth2Clients = new google.auth.OAuth2(
      clientId,
      secretToken,
      "http://localhost:3000/hosting-details"
    );
    const { tokens } = await oauth2Clients.getToken(code);
    oauth2Clients.setCredentials(tokens);
    console.log("tokens==================", tokens);
    // SAVE ACCESS TOKEN IN HOSTING DETAILS GOOGLE MEET DATA
    if (tokens) {
      const tokenData = {
        accessToken: tokens?.access_token,
        refreshToken: tokens?.refresh_token,
        scope: tokens?.scope,
        tokenType: tokens?.token_type,
        expiryDate: tokens?.expiryDate,
      };
      const saveToenInHostDetails = await HostingDetails.updateOne(
        { organizationId: new ObjectId(organizationId) },
        { $set: { "gMeetCredentials.tokenData": tokenData } }
      );
      return saveToenInHostDetails;
    }

   
  }
  return false;
};


// Function to Add Event
const addEventForMOM=async ( meeting,
  meetingTimeZone)=> {

    const attendeesEmailids = meeting?.attendees.map((item) => {
      return {
        email: item.email,
      };
    });
    const meetingDate = new Date(meeting.date);

    console.log("meetingDate============", meetingDate);
    const meetingStartDateTime = commonHelper.combineDateAndTimeInISO(
      meeting.date,
      meeting.actualFromTime
    );
    console.log("meetingStartDateTime--------------", meetingStartDateTime);
    console.log(
      "meetingStartDateTime------------in new date",
      new Date(meetingStartDateTime)
    );
  
    const meetingStartDateTimeUTC = new Date(meetingStartDateTime);
  
    // // Add 5 hours and 30 minutes
    // meetingStartDateTimeUTC.setUTCHours(
    //   meetingStartDateTimeUTC.getUTCHours() + 5
    // );
    // meetingStartDateTimeUTC.setUTCMinutes(
    //   meetingStartDateTimeUTC.getUTCMinutes() + 30
    // );
    // console.log(meetingStartDateTimeUTC);
    // console.log(meetingStartDateTimeUTC.toISOString()); // Updated timestamp
    const meetingEndDateTime = commonHelper.combineDateAndTimeInISO(
      meeting.date,
      meeting.actualToTime
    );
    console.log("meetingEndDateTime--------------", meetingEndDateTime);
    console.log(
      "meetingEndDateTime------------in new date",
      new Date(meetingEndDateTime)
    );
    const meetingEndDateTimeUTC = new Date(meetingEndDateTime);
    console.log("meetingEndDateTimeUTC--------------", meetingEndDateTimeUTC);
  const auth = await authenticateData(meeting?.organizationId);
  const calendar = google.calendar({ version: "v3", auth });
  const event = {
    summary:meeting?.title,
    location: "Google Meet",
    description: meeting?.title,
    start: {
      dateTime: meetingStartDateTimeUTC.toISOString().split(".")[0],
      timeZone: meetingTimeZone,
    },
    end: {
      dateTime: meetingEndDateTimeUTC.toISOString().split(".")[0],
      timeZone: meetingTimeZone,
    },
    attendees: [
      { email: "node.js@ntspl.co.in" },
      { email: "soumyamishra.mishra8@gmail.com" },
      { email: "soumya.mishra8@ntspl.co.in" },
    ],
  //  attendees: attendeesEmailids,
    sendUpdates: "all", // Options: "none", "externalOnly", "all"
    visibility: "private", // Options: "default", "public", "private"
    guestsCanModify: true, // Allows guests to edit the event
    guestsCanInviteOthers: true, // Allows guests to invite others
    guestsCanSeeOtherGuests: true, // Hides guest list from attendees
    reminders: { useDefault: true }
  };


  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
    sendUpdates: "all", // Sends email invitations to all attendees
  });
  console.log("Google new event created response:", response.data);
  console.log("ENDDDDDDDDDDDDDDDDDDDDDDDDDDDD==========");
  return response.data;

  // calendar.events.insert(
  //   {
  //     calendarId: "primary",
  //     resource: event,
  //   },
  //   (err, event) => {
  //     if (err) return console.error("Error adding event:", err);
  //     console.log("Event created:", event.data.htmlLink);
  //   }
  // );
}
const createGMeetingMOM = async (
  meeting,
  attendeesEmailids,
  meetingTimeZone
) => {
  console.log("START======================================");
  console.log("MEETING------------------", meeting);
  console.log("MEETING DATE", meeting?.date);
  console.log("MEETING FROM TIME", meeting?.fromTime);
  console.log("MEETING TO TIME", meeting?.toTime);
  const meetingDate = new Date(meeting.date);

  console.log("meetingDate============", meetingDate);
  const meetingStartDateTime = commonHelper.combineDateAndTimeInISO(
    meeting.date,
    meeting.actualFromTime
  );
  console.log("meetingStartDateTime--------------", meetingStartDateTime);
  console.log(
    "meetingStartDateTime------------in new date",
    new Date(meetingStartDateTime)
  );

  const meetingStartDateTimeUTC = new Date(meetingStartDateTime);

  // // Add 5 hours and 30 minutes
  // meetingStartDateTimeUTC.setUTCHours(
  //   meetingStartDateTimeUTC.getUTCHours() + 5
  // );
  // meetingStartDateTimeUTC.setUTCMinutes(
  //   meetingStartDateTimeUTC.getUTCMinutes() + 30
  // );
  // console.log(meetingStartDateTimeUTC);
  // console.log(meetingStartDateTimeUTC.toISOString()); // Updated timestamp
  const meetingEndDateTime = commonHelper.combineDateAndTimeInISO(
    meeting.date,
    meeting.actualToTime
  );
  console.log("meetingEndDateTime--------------", meetingEndDateTime);
  console.log(
    "meetingEndDateTime------------in new date",
    new Date(meetingEndDateTime)
  );
  const meetingEndDateTimeUTC = new Date(meetingEndDateTime);
  console.log("meetingEndDateTimeUTC--------------", meetingEndDateTimeUTC);
  const auth = await authenticateData(meeting?.organizationId);
  console.log(
    "after call============================================================="
  );
  const calendar = google.calendar({ version: "v3", auth });
  // start: {
  //   dateTime: "2025-02-12T05:05:00-07:00",
  //   timeZone: "Asia/Kolkata",
  // },
  const event = {
    summary: meeting?.title,
    description: meeting?.title,
    location: "Online (Google Meet)",
    start: {
      dateTime: meetingStartDateTimeUTC.toISOString().split(".")[0],
      timeZone: meetingTimeZone,
    },
    end: {
      dateTime: meetingEndDateTimeUTC.toISOString().split(".")[0],
      timeZone: meetingTimeZone,
    },
    conferenceData: {
      createRequest: {
        requestId: uuidv4(), // Must be unique per request
        conferenceSolutionKey: { type: "hangoutsMeet" }, // Required for Google Meet
      },
    },
    attendees: attendeesEmailids,
    sendUpdates: "all", // Options: "none", "externalOnly", "all"
    visibility: "private", // Options: "default", "public", "private"
    guestsCanModify: true, // Allows guests to edit the event
    guestsCanInviteOthers: true, // Allows guests to invite others
    guestsCanSeeOtherGuests: true, // Hides guest list from attendees
    reminders: { useDefault: true },
  };
  console.log("event==========", event);

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
    sendUpdates: "all", // Sends email invitations to all attendees
    conferenceDataVersion: 1,
  });
  console.log("Google Meet response:", response.data);
  console.log("ENDDDDDDDDDDDDDDDDDDDDDDDDDDDD==========");
  return response.data;
};

const updateGMeetingMOM = async (
  meeting,
  meetingTimeZone
) => {
  console.log("START======================================");
  console.log("MEETING------------------", meeting);
  console.log("MEETING DATE", meeting?.date);
  console.log("MEETING FROM TIME", meeting?.fromTime);
  console.log("MEETING TO TIME", meeting?.toTime);

  const attendeesEmailids = meeting?.attendees.map((item) => {
    return {
      email: item.email,
    };
  });
  const meetingDate = new Date(meeting.date);

  console.log("meetingDate============", meetingDate);
  const meetingStartDateTime = commonHelper.combineDateAndTimeInISO(
    meeting.date,
    meeting.actualFromTime
  );
  console.log("meetingStartDateTime--------------", meetingStartDateTime);
  console.log(
    "meetingStartDateTime------------in new date",
    new Date(meetingStartDateTime)
  );

  const meetingStartDateTimeUTC = new Date(meetingStartDateTime);

  // // Add 5 hours and 30 minutes
  // meetingStartDateTimeUTC.setUTCHours(
  //   meetingStartDateTimeUTC.getUTCHours() + 5
  // );
  // meetingStartDateTimeUTC.setUTCMinutes(
  //   meetingStartDateTimeUTC.getUTCMinutes() + 30
  // );
  // console.log(meetingStartDateTimeUTC);
  // console.log(meetingStartDateTimeUTC.toISOString()); // Updated timestamp
  const meetingEndDateTime = commonHelper.combineDateAndTimeInISO(
    meeting.date,
    meeting.actualToTime
  );
  console.log("meetingEndDateTime--------------", meetingEndDateTime);
  console.log(
    "meetingEndDateTime------------in new date",
    new Date(meetingEndDateTime)
  );
  const meetingEndDateTimeUTC = new Date(meetingEndDateTime);
  console.log("meetingEndDateTimeUTC--------------", meetingEndDateTimeUTC);
  const auth = await authenticateData(meeting?.organizationId);
  console.log(
    "after call============================================================="
  );
  const calendar = google.calendar({ version: "v3", auth });
  // start: {
  //   dateTime: "2025-02-12T05:05:00-07:00",
  //   timeZone: "Asia/Kolkata",
  // },
  const event = {
    summary: meeting?.title,
    description: meeting?.title,
    location: "Online (Google Meet)",
    start: {
      dateTime: meetingStartDateTimeUTC.toISOString().split(".")[0],
      timeZone: meetingTimeZone,
    },
    end: {
      dateTime: meetingEndDateTimeUTC.toISOString().split(".")[0],
      timeZone: meetingTimeZone,
    },
    conferenceData: {
      createRequest: {
        requestId: uuidv4(), // Must be unique per request
        conferenceSolutionKey: { type: "hangoutsMeet" }, // Required for Google Meet
      },
    },
   // attendees: attendeesEmailids,
    attendees: [
      { email: "node.js@ntspl.co.in" },
      { email: "soumyamishra.mishra8@gmail.com" },
      //  { email: "monalisamahantantspl@gmail.com"  },
      // { email: "seo@ntspl.co.in" },
    ],
    sendUpdates: "all", // Options: "none", "externalOnly", "all"
    visibility: "private", // Options: "default", "public", "private"
    guestsCanModify: true, // Allows guests to edit the event
    guestsCanInviteOthers: true, // Allows guests to invite others
    guestsCanSeeOtherGuests: true, // Hides guest list from attendees
    reminders: { useDefault: true },
  };
  console.log("event==========", event);
  const meetingHostDetails = await MeetingHostDetails.find(
    { meetingId: new ObjectId(meeting?._id) },
    { _id: 1, meetingId: 1, hostMeetingId: 1 }
  )
    .sort({ _id: -1 })
    .limit(1);
  console.log("meetingHostDetails===========", meetingHostDetails);

  if (meetingHostDetails?.length !== 0) {
    const eventId = meetingHostDetails[0].hostMeetingId;
  const response = await calendar.events.update({
    eventId, // Required field
    calendarId: "primary",
    resource: event,
    sendUpdates: "all", // Sends email invitations to all attendees
    conferenceDataVersion: 1,
  });
  console.log("Google Meet response:", response.data);
  console.log("ENDDDDDDDDDDDDDDDDDDDDDDDDDDDD==========");
  return response.data;
}
return false;
};

module.exports = {
  createGMeeting,
  addEvent,
  createGMeetingMOM,
  updateGMeetingMOM,
  googleMeetAuthUrl,
  getAccessTokens,
  addEventForMOM
};
