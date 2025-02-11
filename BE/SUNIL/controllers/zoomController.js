
const meetingStreamingService=require("../services/meetingStreamingService");
/**FUNC- TO CREATE ZOOM MEETING**/
const createMeeting = async (req, res) => {
  const { topic } = req.body || "";
  const { duration } = req.body || 30;
  const { start_time } = req.body || new Date();
  const { timezone } = req.body || "Asia/Kolkata";
  try {
    const createdMeeting = await meetingStreamingService.createZoomMeeting(
    //   topic,
    //   duration,
    //   start_time,
    //  // req.body.agenda,
    //  // req.body.password,
    // timezone
    );
    return res
      .status(200)
      .json({ msg: "Meeting created successfully", meeting: createdMeeting });
  } catch (err) {
    return res.status(400).json({ msg: err.message });
  }
};
module.exports = {
  createMeeting,
};
