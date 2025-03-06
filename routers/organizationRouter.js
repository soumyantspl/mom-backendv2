const express = require("express");
const router = express.Router();
const organzationController = require("../controllers/organizationController");
const organizationValidator = require("../validators/organizationValidator");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// Creating new organization
router.post(
  "/createOrganization/",
  organzationController.organizationRegistrationController
);
//VIEWING LIST OF ORGANIZATION
router.get(
  "/viewOrganization/:id",
  organizationValidator.viewOrganizationValidator,
  authMiddleware.verifyUserToken,
  organzationController.viewOrganizationController
);
//VIEWING SINGLE ORGANIZATION
router.get(
  "/viewSingleOrganization/:id",
  authMiddleware.verifyUserToken,
  organzationController.viewSingleOrganizationController
);
//EDIT ORGANIZATION
router.post(
  "/editOrganization/:id",
  upload.fields([
    { name: "dashboardLogo", maxCount: 1 },
    { name: "loginLogo", maxCount: 1 },
  ]),
  authMiddleware.verifyUserToken,
  organzationController.editOrganizationController
);

router.post("/sendOtp", organizationValidator.registrationSendOtpValidator, organzationController.registrationSendOtp)

router.post("/verifyOtp", organizationValidator.registrationVerifyOtpValidator, organzationController.verifyRegistrationOtp)

router.post("/editEmail/:id", authMiddleware.verifyUserToken, organzationController.editOrganizationEmailController)


module.exports = router;
