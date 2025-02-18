require("dotenv").config();
const express = require("express");
const app = express();
const mainRouter = require("./routers/index");
const PORT = process.env.PORT || 8000;
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./dbLayer/connection");
const socket = require("socket.io"); // Add this
const path = require("path");
const minuteService = require("./services/minutesService");
const Minute = require("./models/minutesModel");
const Agenda = require("./models/agendaModel");
const Employee=require("./models/employeeModel");
const commonHelper = require("./helpers/commonHelper");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
process.env.TZ = "Asia/Calcutta";
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));
// Set EJS as templating engine
app.set("view engine", "ejs");
const allowOrigin = [
  "*",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://192.168.1.125:3000",
  "http://192.168.1.5:3000",
  "http://192.168.1.5:3001",
  "http://192.168.1.8:3000",
  "http://192.168.1.8:3001",
  "https://mom.ntspl.co.in",
  "http://192.168.1.86:4200",
  "https://localhost",
  "https://mom.ntspl.co.in",
];
const corsOpts = {
  origin: allowOrigin,
  methods: ["GET, POST, PUT, DELETE, OPTIONS, PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use("/pdfFiles", express.static("pdfFiles"));
app.use(cors());
app.use('/Downloads', express.static(path.join(__dirname, 'Downloads')));


// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", allowOrigin);
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization, timeZone, x-token"
//   );
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE, OPTIONS, PATCH"
//   );
//   next();
// });
const ObjectId = require("mongoose").Types.ObjectId;
//mongodb connection using mongoose
connectDB();
app.get("/", async (req, res) => {
   try {
  //    const result = await Employee.updateMany(
  //     {
  //     //  meetingId: { $ne: new ObjectId("67612c142b60c36a94ba4ff7") },
  //     },
  //     {
  //       $set: {
  //         isMeetingOrganiser: true,
  //       },
  //     }
  //   );
    res.send("Welcome to MOM API MOM!");
  } catch (err) {
    console.log(err);
  }
});
// app.get('/', (req, res) => {

//   // The render method takes the name of the HTML
//   // page to be rendered as input
//   // This page should be in the views folder
//   // in the root directory.
//   res.render('pdfData', { name: "soumyamishra" });

// });
app.use("/api", mainRouter);

// SOCKET IO
console.log("frontend", process.env.FRONTEND_URL);
const io = socket(
  app.listen(PORT, () => {
    console.info(`Server is running on port.... ${PORT}`);
  }),
  {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET, POST, PUT, DELETE, OPTIONS, PATCH"],
    },
  }
);
//const io = require('socket.io')(server);
// Listen for when the client connects via socket.io-client
io.on("connection", (socket) => {
  console.log(`Client connected`, socket.id);
  socket.emit("connection", null);
  // We can write our socket event listeners in here...
  socket.on("disconect", () => {
    console.log(`Client disconnected-----------------------`);
    // We can write our socket event listeners in here...
  });
}); 
app.set("io", io);
// Run the cron job
const cronJob = require("./cronJob/index");
// cronJob.acceptAllPendingMomsCronJob();
// cronJob.alertsCron();
 cronJob.chaseOfActionCron()
 cronJob.checkDraftMeetingsCron()
 cronJob.scheduleDraftMeetingCleanup()
//"dev": "set NODE_TLS_REJECT_UNAUTHORIZED='0'&& nodemon server.js",

//NODE_TLS_REJECT_UNAUTHORIZED='0' node server.js
