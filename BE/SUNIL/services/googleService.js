// Refer to the Node.js quickstart on how to setup the environment:
// https://developers.google.com/calendar/quickstart/node
// Change the scope to 'https://www.googleapis.com/auth/calendar' and delete any
// stored credentials.
const express = require("express");
const { google } = require("googleapis");
//const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";
const GOOGLE_PRIVATE_KEY =
  "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDZ+ORe5oIK9+YA\n4hRmLZXO5TM+ni/M1be7f0rPWqLxEIjk6lHlfqwrtxkv3FFnlmcjC+gKYSXLFjb0\nhMr+4hcETMIRmFI9G4ddDLOAJ+4o/+h43NgJtYM0Cp8iioDxeZcNhtdkceMfMW/k\nkg9UEIK41qrM7T4QxH6tFxPXyF6/wVtrF85Tjq8d5L8p4cr2t4DRTYvkY7PG8TsQ\nX9bB1o+FvDJskxg69qyuwMzvOjjnj5HQL0k8bIYYjsipEwo8olLabC36HEbgAVHS\nPhJtcJ17cMHGIDT3g/jGNv1lYj+GjWBZxGB//OeCqzLSJOAIx4XBExldCsQqroO9\ng5PDRpIvAgMBAAECggEAM5vPjnyrW6d4SMs+oza12qe/61qO3MPZXcZ00wWVwNf2\nYaTtQRYt86fFieRzTcB5qP2fsh1wUlZvKpPqcFDdvEHkTUAwcJF9ClYAhh5uMDzv\nMPaxHBNi/kZpiUcb4pC0aBp+EyU37mHJKWg/wtqp6NPC2wRtBpFPoPHu289wR5wz\niL62HE1n3wP86AoqCPY+UGLQi/8GADTZCwEAdF7O8lNV4xPcb0HyVotSm6UezblL\nL2/zs5C5yhJhhvw3FsIYhrCNU05aUDqoY5mV7m2KxdZFKsjnWONyRqb4zEJz0zVK\nHq8gH3LYNz6zzUaARi66ZvkssHQZNVzUKE2hKqKWYQKBgQDuBPyj+25mEBntV33p\nxUPl8aMbxZR55KesjzuCO7GiHXyrZ8HkUFSDGCkQuEk4H/9XxKrCnb90pniBwoCb\nc0EigXvc5JT67JOTRPk9RSTlbRc5tRcwfdv3aaf9+Yv2UZsLh/VAQ7L5tKS3U9+A\nYsaXPkUq6Nucj555okWtf0qfPwKBgQDqcDchyBLBDbqFViRtTxPUTzkuGSya43pJ\nqR2shLRfX5k5RfSh0xFmHIeD39YWXI43KYq12FzVFSrS2PLpe6NKssTtOU0yZv92\nFpUacuzRp52ipNs/8AQ+PNhj24IUHyrU6SZWdH+FI8iQgxmUKrr0MPK6RtWokDCZ\nF7sxvV1BEQKBgQDY78qkWwGgHITFAb1NV/IunjIfmdFd173LVTDT3jxkmaOLRiI+\nScj9QwQKrSxu7xr3j9RjVQuu8htbiT9Wb5GqNYIDLoNqwD0xOOhBo8ehI/DLM/ZS\nyCO4OKBYpx2d/3rk46HwVMPHO5H1VYibp2uBZcv89AdVhsDV88S2ARKuWQKBgFYx\nQaPS6ko+IOhq3mOt4i15nx06tjKQFeLFIZrPA33ZKP1sod9pOYlgTdaHUi/QgZz4\nUf4/eQoCiUcR6mU7RrLs/Qf2vFIemiexb8pUnIsMZCFrGQzt0rGLL0evaai6OMYk\nnirFFClAGbo/6QSXnTqwUF16M42Qzb1Lg1BrPcDxAoGAGWWqtVxIzkdXpXbiPq/6\nah+hxnb5LsWv4g+kREI1HjUx2qoUpCUzOzVhtbBx3Ru+VBo/O6MT6Fn44lwYX2m2\nCHBWD2bDmbA5Bc3zB4AUux0f8sH+a1XmCiKYPs4LOz6hooeJ56WVwolud88vJCib\nvq+gn5fK++muLBddrcqTqow=\n-----END PRIVATE KEY-----\n";
const GOOGLE_CLIENT_EMAIL = "calenderkey@momgcalender.iam.gserviceaccount.com";
const GOOGLE_PROJECT_NUMBER = "493457969757";
const GOOGLE_CALENDAR_ID =
  "c_5cc63e87664cc9eaba126ca358ad4be5409ca2ed93b5fc6707d34227cfaf26c8@group.calendar.google.com";

// {
//   "type": "service_account",
//   "project_id": "momgcalender",
//   "private_key_id": "ebffd35932c4b00ae3dec97eb8ab57718787fdab",
//   "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDZ+ORe5oIK9+YA\n4hRmLZXO5TM+ni/M1be7f0rPWqLxEIjk6lHlfqwrtxkv3FFnlmcjC+gKYSXLFjb0\nhMr+4hcETMIRmFI9G4ddDLOAJ+4o/+h43NgJtYM0Cp8iioDxeZcNhtdkceMfMW/k\nkg9UEIK41qrM7T4QxH6tFxPXyF6/wVtrF85Tjq8d5L8p4cr2t4DRTYvkY7PG8TsQ\nX9bB1o+FvDJskxg69qyuwMzvOjjnj5HQL0k8bIYYjsipEwo8olLabC36HEbgAVHS\nPhJtcJ17cMHGIDT3g/jGNv1lYj+GjWBZxGB//OeCqzLSJOAIx4XBExldCsQqroO9\ng5PDRpIvAgMBAAECggEAM5vPjnyrW6d4SMs+oza12qe/61qO3MPZXcZ00wWVwNf2\nYaTtQRYt86fFieRzTcB5qP2fsh1wUlZvKpPqcFDdvEHkTUAwcJF9ClYAhh5uMDzv\nMPaxHBNi/kZpiUcb4pC0aBp+EyU37mHJKWg/wtqp6NPC2wRtBpFPoPHu289wR5wz\niL62HE1n3wP86AoqCPY+UGLQi/8GADTZCwEAdF7O8lNV4xPcb0HyVotSm6UezblL\nL2/zs5C5yhJhhvw3FsIYhrCNU05aUDqoY5mV7m2KxdZFKsjnWONyRqb4zEJz0zVK\nHq8gH3LYNz6zzUaARi66ZvkssHQZNVzUKE2hKqKWYQKBgQDuBPyj+25mEBntV33p\nxUPl8aMbxZR55KesjzuCO7GiHXyrZ8HkUFSDGCkQuEk4H/9XxKrCnb90pniBwoCb\nc0EigXvc5JT67JOTRPk9RSTlbRc5tRcwfdv3aaf9+Yv2UZsLh/VAQ7L5tKS3U9+A\nYsaXPkUq6Nucj555okWtf0qfPwKBgQDqcDchyBLBDbqFViRtTxPUTzkuGSya43pJ\nqR2shLRfX5k5RfSh0xFmHIeD39YWXI43KYq12FzVFSrS2PLpe6NKssTtOU0yZv92\nFpUacuzRp52ipNs/8AQ+PNhj24IUHyrU6SZWdH+FI8iQgxmUKrr0MPK6RtWokDCZ\nF7sxvV1BEQKBgQDY78qkWwGgHITFAb1NV/IunjIfmdFd173LVTDT3jxkmaOLRiI+\nScj9QwQKrSxu7xr3j9RjVQuu8htbiT9Wb5GqNYIDLoNqwD0xOOhBo8ehI/DLM/ZS\nyCO4OKBYpx2d/3rk46HwVMPHO5H1VYibp2uBZcv89AdVhsDV88S2ARKuWQKBgFYx\nQaPS6ko+IOhq3mOt4i15nx06tjKQFeLFIZrPA33ZKP1sod9pOYlgTdaHUi/QgZz4\nUf4/eQoCiUcR6mU7RrLs/Qf2vFIemiexb8pUnIsMZCFrGQzt0rGLL0evaai6OMYk\nnirFFClAGbo/6QSXnTqwUF16M42Qzb1Lg1BrPcDxAoGAGWWqtVxIzkdXpXbiPq/6\nah+hxnb5LsWv4g+kREI1HjUx2qoUpCUzOzVhtbBx3Ru+VBo/O6MT6Fn44lwYX2m2\nCHBWD2bDmbA5Bc3zB4AUux0f8sH+a1XmCiKYPs4LOz6hooeJ56WVwolud88vJCib\nvq+gn5fK++muLBddrcqTqow=\n-----END PRIVATE KEY-----\n",
//   "client_email": "calenderkey@momgcalender.iam.gserviceaccount.com",
//   "client_id": "118296529458497782302",
//   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//   "token_uri": "https://oauth2.googleapis.com/token",
//   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/calenderkey%40momgcalender.iam.gserviceaccount.com",
//   "universe_domain": "googleapis.com"
// }
// const jwtClient = new google.auth.JWT(
//   GOOGLE_CLIENT_EMAIL,
//   null,
//   GOOGLE_PRIVATE_KEY,
//   SCOPES
// );

// const calendar = google.calendar({
//   version: "v3",
//   project: GOOGLE_PROJECT_NUMBER,
//   auth: jwtClient,
// });

const event = {
  summary: "Google I/O 2015",
  location: "800 Howard St., San Francisco, CA 94103",
  description: "A chance to hear more about Google's developer products.",
  start: {
    dateTime: "2024-09-24T19:30:00+05:30",
    timeZone: "Asia/Kolkata",
  },
  end: {
    dateTime: "2024-09-25T20:30:00+05:30",
    timeZone: "Asia/Kolkata",
  },
  recurrence: ["RRULE:FREQ=DAILY;COUNT=2"],
  attendees: [
    { email: "soumya.mishra@ntspl.co.in" },
    { email: "node.js@ntspl.co.in" },
    { email: "soumyamishra.mishra@gmail.com" },
  ],
  reminders: {
    useDefault: false,
    overrides: [
      { method: "email", minutes: 24 * 60 },
      { method: "popup", minutes: 10 },
    ],
  },
};

//   const event = {
//     summary: 'Tech Talk with Arindam',
//     location: 'Google Meet',

//     description: "Demo event for Arindam's Blog Post.",
//     start: {
//         dateTime: "2024-09-24T19:30:00+05:30",
//         timeZone: 'Asia/Kolkata'
//     },
//     end: {
//         dateTime: "2024-09-25T20:30:00+05:30",
//         timeZone: 'Asia/Kolkata'
//     },
//     colorId: 1,
//     // conferenceData: {
//     //     createRequest: {
//     //         requestId: uuid(),
//     //     }
//     // },

//     attendees: [
//         {email: 'arindammajumder2020@gmail.com'},
//     ]

// };

//   calendar.events.insert({
//     auth: auth,
//     calendarId: 'primary',
//     resource: event,
//   }, function(err, event) {
//     if (err) {
//       console.log('There was an error contacting the Calendar service: ' + err);
//       return;
//     }
//     console.log('Event created: %s', event.htmlLink);
//   });

//Creating an aunthenticated client to call events.insert()

// const auth = new google.auth.GoogleAuth({
//     keyFile: '<FULL-PATH-OF-JSON-FILE>',
//     scopes: 'https://www.googleapis.com/auth/calendar', //full access to edit calendar
//   });

const createEvent1 = () => {
  // var event = {
  //   summary: "My first event!",
  //   location: "Hyderabad,India",
  //   description: "First event with nodeJS!",
  //   start: {
  //     dateTime: "2024-12-15T09:00:00-07:00",
  //     timeZone: "Asia/Kolkata",
  //   },
  //   end: {
  //     dateTime: "2024-12-15T09:03:00-07:00",
  //     timeZone: "Asia/Kolkata",
  //   },
  //   attendees: [],
  //   reminders: {
  //     useDefault: false,
  //     overrides: [
  //       { method: "email", minutes: 24 * 60 },
  //       { method: "popup", minutes: 10 },
  //     ],
  //   },
  // };

  const event = {
    summary: "Google I/O 2015",
    location: "800 Howard St., San Francisco, CA 94103",
    description: "A chance to hear more about Google's developer products.",
    start: {
      dateTime: "2025-01-01T19:30:00+05:30",
      timeZone: "Asia/Kolkata",
    },
    end: {
      dateTime: "2025-01-1T20:30:00+05:30",
      timeZone: "Asia/Kolkata",
    },
    recurrence: ["RRULE:FREQ=DAILY;COUNT=2"],
    attendees: [
      { email: "soumya.mishra@ntspl.co.in" },
      { email: "node.js@ntspl.co.in" },
      { email: "soumyamishra.mishra@gmail.com" },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 10 },
      ],
    },
  };

  const auth = new google.auth.GoogleAuth({
    keyFile: "./services/credentials.json",
    scopes: "https://www.googleapis.com/auth/calendar",
  });
  auth.getClient().then((a) => {
    calendar.events.insert(
      {
        auth: auth,
        calendarId: "primary",
        resource: event,
        sendUpdates: "all", // Notify attendees
      },
      function (err, event) {
        if (err) {
          console.log(
            "There was an error contacting the Calendar service: " + err
          );
          return;
        }
        console.log("Event created: %s", event.data);
        return event.data;
      }
    );
  });
};

const createEvent2 = () => {
  var event = {
    summary: "My first event!",
    location: "Hyderabad,India",
    description: "First event with nodeJS!",
    start: {
      dateTime: "2022-01-12T09:00:00-07:00",
      timeZone: "Asia/Dhaka",
    },
    end: {
      dateTime: "2022-01-14T17:00:00-07:00",
      timeZone: "Asia/Dhaka",
    },
    attendees: [],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 10 },
      ],
    },
  };

  const auth = new google.auth.GoogleAuth({
    keyFile: "<full-path-of-JSON-file>",
    scopes: "https://www.googleapis.com/auth/calendar",
  });
  auth.getClient().then((a) => {
    calendar.events.insert(
      {
        auth: a,
        calendarId: GOOGLE_CALENDAR_ID,
        resource: event,
      },
      function (err, event) {
        if (err) {
          console.log(
            "There was an error contacting the Calendar service: " + err
          );
          return;
        }
        console.log("Event created: %s", event.data);
        res.jsonp("Event successfully created!");
      }
    );
  });
};

//const { google } = require("googleapis");
const path = require("path");

// Path to your service account key file
const SERVICE_ACCOUNT_FILE = path.join(__dirname, "credentials.json");

// The email of the user to impersonate
const IMPERSONATED_USER = "calenderkey@momgcalender.iam.gserviceaccount.com";

// Required OAuth scopes for Calendar API
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

async function createEvent() {
  // Authenticate using the service account key and impersonate the user
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: SCOPES,
    clientOptions: {
      subject: IMPERSONATED_USER,
    },
  });

  // Build the Calendar API client
  const calendar = google.calendar({ version: "v3", auth });

  // Define the event
  const event = {
    summary: "Team Meeting",
    location: "Virtual (Google Meet)",
    description: "Discuss project updates and next steps.",
    start: {
      dateTime: "2024-12-16T05:40:25.886+00:00",
      timeZone: "Asia/Kolkata",
    },
    end: {
      dateTime: "2024-12-16T05:40:25.886+00:00",
      timeZone: "Asia/Kolkata",
    },
    attendees: [
      { email: "soumya.mishra@ntspl.co.in" },
      { email: "node.js@ntspl.co.in" },
    ],
    conferenceData: {
      createRequest: {
        requestId: "random-request-id", // Unique ID for generating a Google Meet link
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  try {
    // // Create the event in the primary calendar of the impersonated user
    // const response = await calendar.events.insert({
    //   calendarId: "primary",
    //   requestBody: event,
    //   conferenceDataVersion: 1, // Required for Google Meet integration
    // });

    // console.log("Event created: ", response.data.htmlLink);

    calendar.events.insert(
      {
        auth: auth,
        calendarId: GOOGLE_CALENDAR_ID,
        requestBody: event,
        conferenceDataVersion: 1,
        sendNotifications: true,
      },
      function (err, event) {
        if (err) {
          console.log(
            "There was an error contacting the Calendar service: " + err
          );
          return;
        }
        console.log("Event created: %s", event.htmlLink);
      }
    );
  } catch (err) {
    console.error("Error creating event: ", err);
  }
}

module.exports = { createEvent };
