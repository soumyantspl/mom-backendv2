const minuteService = require("../services/minutesService");
const meetingService = require("../services/meetingService");
const cron = require("node-cron");
const acceptAllPendingMomsCronJob = () => {
  try {
    //cron.schedule("*/5 * * * *", minuteService.acceptAllPendingMoms);// RUN AT EVERY 5 MINUTES
    cron.schedule("0 0 */1 * * *", minuteService.acceptAllPendingMoms); // RUN AT EVERY HALF AN HOUR
  } catch (error) {
    console.log(error);
  }
};
const alertsCron = () => {
  try {
    cron.schedule("*/5 * * * *", meetingService.sendAlertTime); // RUN AT EVERY 5 MINUTES
  } catch (error) {
    console.log(error);
  }
};

const chaseOfActionCron = () => {
  try {
    //cron.schedule("*/1 * * * *", minuteService.chaseOfActionService);// RUN AT EVERY 3 MINUTES
    // Schedule a task to run at 11:59 PM
    //cron.schedule('59 23 * * *', () => {
    cron.schedule("59 23 * * *", minuteService.chaseOfActionService); // Schedule a task to run at 11:59 PM
    //  cron.schedule("0 0 * * *", minuteService.chaseOfActionService); // RUN AT EVERY MIDNIGHT
  } catch (error) {
    console.log(error);
  }
};
const checkDraftMeetingsCron = () => {
  try {
    cron.schedule("0 0 * * *", async () => { 
      console.log("Running checkDraftMeetings cron job...");
      await meetingService.notifyMeetingCreatorAboutDraft();
    });

    console.log("checkDraftMeetingsCron scheduled to run every midnight.");
  } catch (error) {
    console.error("Error in checkDraftMeetingsCron:", error);
  }
};

const scheduleDraftMeetingCleanup = () => {
  cron.schedule("0 0 * * *", async () => { 
    console.log("Running deleteOldDraftMeetings cron job...");
    await meetingService.deleteOldDraftMeetings();
  });

  console.log("Scheduled deleteOldDraftMeetings to run daily at midnight.");
};

module.exports = {
  acceptAllPendingMomsCronJob,
  alertsCron,
  chaseOfActionCron,
  checkDraftMeetingsCron,
  scheduleDraftMeetingCleanup
  
};
