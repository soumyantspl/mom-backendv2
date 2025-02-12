const fs = require("fs");
const { google } = require("googleapis");

// Load credentials
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar",
];

const client_id =
  "260087855691-e91cmkn3allf0gagu5sfas2jfifhv1in.apps.googleusercontent.com";
const client_secret = "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";
const redirect_uris = ["https://mom.ntspl.co.in", "http://localhost:3000"];
const code =
  "4/0ASVgi3KA7eHJNenfAsQDmuFmQj855bEeL-omYL8uZjrHTyyQvm7picqjGyIEHCpkLCWuAg";

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

// Generate an authentication URL
const getAuthUrl = () => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
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
    redirect_uris[0]
  );

  // Load previously stored token or generate new one
  const TOKEN_PATH = "token.json";
  if (fs.existsSync(TOKEN_PATH)) {
    console.log("===========================================22222=");

    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    console.log("===========================================44444=", token);
    oAuth2Client.setCredentials(token);
    // Listen for token refresh events and update the file
    oAuth2Client.on("tokens", (newTokens) => {
      console.log("===========================================33333=");
      if (newTokens.refresh_token) {
        token.refresh_token = newTokens.refresh_token; // Only update if we get a new refresh token
      }
      console.log(
        "newTokens.access_token===========================",
        newTokens.access_token
      );
      token.access_token = newTokens.access_token;
      // fs.writeFileSync("token.json", JSON.stringify(token));
    });
  } else {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      //prompt: 'consent', // Forces Google to issue a new refresh token
      scope: SCOPES,
    });
    console.log("Authorize this app by visiting:", authUrl);
  }

  return oAuth2Client;
}
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
// Function to force token refresh (useful for testing)
async function refreshAccessToken() {
  console.log("🔄 Manually refreshing access token...");

  await oAuth2Client.getAccessToken(); // This triggers Google to refresh the token if needed
}

// Create a Google Meet meeting
async function createGMeeting() {
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
    // attachments: [
    //   {
    //     fileUrl: "https://drive.google.com/file/d/1234567890/view",
    //     title: "Meeting Agenda",
    //     mimeType: "application/pdf",
    //   },
    // ],
    // recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR"], // Weekly on Monday, Wednesday, and Friday
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 10 }, // Email reminder 10 minutes before
        { method: "popup", minutes: 5 }, // Popup reminder 5 minutes before
      ],
    },
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

module.exports = { createGMeeting, addEvent };
