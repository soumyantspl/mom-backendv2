const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const validator = require("../validators/employeeValidator");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const path=require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads'); 
    console.log(`File is being uploaded to: ${uploadPath}`);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};
const uploadpicture = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});


/* CREATE EMPLOYEE  */
router.post(
  "/createEmployee",
  validator.createEmployeeValidator,
  authMiddleware.verifyUserToken,
  employeeController.createEmployee
);
/* EDIT EMPLOYEE  */
router.put(
  "/editEmployee/:id",
  validator.editEmployeeValidator,
  authMiddleware.verifyUserToken,
  employeeController.editEmployee
);
/* DELETE EMPLOYEE  */
router.delete(
  "/deleteEmployee/:id",
  validator.deleteEmployeValidator,
  authMiddleware.verifyUserToken,
  employeeController.deleteEmploye
);
/* VIEW EMPLOYEE  */
router.post(
  "/listEmployee",
  validator.listEmployesValidator,
  authMiddleware.verifyUserToken,
  employeeController.listEmployee
);
/* VIEW SINGLE EMPLOYEE  */
router.get(
  "/viewSingleEmployee/:id",
  validator.viewSingleEmployeeValidator,
  authMiddleware.verifyUserToken,
  employeeController.viewSingleEmploye
);
/* MASTER DATA */
router.get(
  "/masterData/:organizationId",
  validator.masterDataValidator,
  authMiddleware.verifyUserToken,
  employeeController.masterData
);

/* MASTER DATA */
router.get(
  "/listOnlyEmployee/:organizationId",
  validator.listOnlyEmployeeValidator,
  authMiddleware.verifyUserToken,
  employeeController.listOnlyEmployee
);
/* CHECK DUPLICATE VISITOR USER  */
router.post(
  "/checkDuplicateUser",
  validator.checkDuplicateUser,
  authMiddleware.verifyUserToken,
  employeeController.checkDuplicateUser
);
/* MASTER DATA */
router.get(
  "/getEmployeeListAsPerUnit/:unitId",
  validator.listOnlyEmployeeAsUnitValidator,
  authMiddleware.verifyUserToken,
  employeeController.getEmployeeListAsPerUnit
);

router.post(
  "/import-employee/:organizationId",
  authMiddleware.verifyUserToken,
  upload.single("file"),
  employeeController.importEmployee
);
/* VIEW PROFILE  */
router.put(
  "/viewProfile/:id",
  uploadpicture.single("profilePicture"),
  validator.viewProfileValidator,
  authMiddleware.verifyUserToken,
  employeeController.viewProfile
);


module.exports = router;
