const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const validator = require("../validators/employeeValidator");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const uploadpicture = require("../helpers/uploadpicture")




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
  // validator.masterDataValidator,
  authMiddleware.verifyUserToken,
  employeeController.masterData
);
/* MASTER DATA */
router.post(
  "/masterDataXLSX/:organizationId",
  // validator.masterDataValidator,
  // authMiddleware.verifyUserToken,
  employeeController.masterDataXLSX
);

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
  "/updateProfile/:id",
  uploadpicture.single("profilePicture"),
  validator.updateProfileValidator,
  authMiddleware.verifyUserToken,
  employeeController.updateProfile
);

module.exports = router;
