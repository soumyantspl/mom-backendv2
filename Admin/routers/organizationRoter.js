const express = require("express");
const router = express.Router();
const organizationValidator = require("../validators/organizationValidator");
const authMiddleware = require("../../middlewares/authMiddleware");
const organizationController = require("../controllers/organizationController");

router.post(
  "/organization-list",
  organizationValidator.organizationListValidator,
  organizationController.getOrganizations
);

// organization status
router.put(
  "/organizationstatus/:orgId",
  organizationController.OrganizationStatusById
);

module.exports = router;
