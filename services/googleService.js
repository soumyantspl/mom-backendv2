const fs = require("fs");
const { google } = require("googleapis");

// Load credentials
const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

const client_id =
  "260087855691-e91cmkn3allf0gagu5sfas2jfifhv1in.apps.googleusercontent.com";
const client_secret = "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";
const redirect_uris = ["https://mom.ntspl.co.in", "http://localhost:3000"];
const code =
  "4/0ASVgi3KJwYFIZhak-5IFHg43J9B14wuhhvPcTBKoBpL4t3pGRFG44nKxRfiOkaT1z0so5g";

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
      fs.writeFileSync("token.json", JSON.stringify(token));
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
  refreshAccessToken();
  const auth = await authenticate();
  const calendar = google.calendar({ version: "v3", auth });

  const event = {
    summary: "Google Meet Meeting test 1",
    description: "This is a test meeting created using the Google Calendar API.",
    location: "Online (Google Meet)",
    start: {
      dateTime: "2024-02-15T10:00:00-07:00",
      timeZone: "America/Los_Angeles",
    },
    end: {
      dateTime: "2024-02-15T11:00:00-07:00",
      timeZone: "America/Los_Angeles",
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
    ],
    sendUpdates: "all", // Options: "none", "externalOnly", "all"
    visibility: "private", // Options: "default", "public", "private"
    guestsCanModify: true, // Allows guests to edit the event
    guestsCanInviteOthers: true, // Allows guests to invite others
    guestsCanSeeOtherGuests: false, // Hides guest list from attendees
    attachments: [
      {
        fileUrl: "https://drive.google.com/file/d/1234567890/view",
        title: "Meeting Agenda",
        mimeType: "application/pdf",
      },
    ],
    recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR"], // Weekly on Monday, Wednesday, and Friday
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 60 }, // Email reminder 1 hour before
        { method: "popup", minutes: 10 }, // Popup reminder 10 minutes before
      ],
    },
    organizer: { email: "organizer@example.com" }, // The host/creator of the event
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
    conferenceDataVersion: 1,
  });

  // console.log("Google Meet Link:", response);
}

module.exports = { createGMeeting };
