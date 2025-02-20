const express = require("express");
const router = express.Router();
const hostController = require("../controllers/hostingController");
const hostValidator = require("../validators/hostValidator");
const authMiddleware = require("../middlewares/authMiddleware");

/* UPDATE HOST DETAILS  */
router.put(
  "/updateHostDetails/:organizationId",
  hostValidator.updateHostDetails,
  authMiddleware.verifyUserToken,
  hostController.updateHostDetails
);

/* GET HOST DETAILS */
router.get(
  "/getHostDetails/:organizationId",
  hostValidator.getHostDetails,
  authMiddleware.verifyUserToken,
  hostController.getHostDetails
);



/* UPDATE HOST STATUS */
router.put(
  "/updateHostStatus/:organizationId",
  hostValidator.updateHostStatus,
  authMiddleware.verifyUserToken,
  hostController.updateHostStatus
);


/* GENERATE GMEET AUTH URL  */
router.get(
  "/googleMeetAuthUrl/:organizationId",
  hostValidator.googleMeetAuthUrl,
  authMiddleware.verifyUserToken,
  hostController.googleMeetAuthUrl
);


/* UPDATE HOST STATUS */
router.post(
  "/getAccessToken",
  hostValidator.getAccessToken,
  authMiddleware.verifyUserToken,
  hostController.getAccessToken
);
module.exports = router;
