const express = require("express");
const router = express.Router();
const organizationValidator = require("../validators/organizationValidator");
const authMiddleware = require("../../middlewares/authMiddleware");
const organizationController = require("../controllers/organizationController");



router.post("/organization-list", 
    organizationValidator.organizationListValidator,
    organizationController.getOrganizations);



 module.exports = router;