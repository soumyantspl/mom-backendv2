const express = require("express");
const router = express.Router();
const adminPanelValidator = require("../validators/adminPanelValidator");
const authMiddleware = require("../middlewares/authMiddleware");
const adminPanelController = require("../controllers/adminPanelController");

router.post(
  "/contact-list",
  adminPanelValidator.contactListValidator,
  adminPanelController.getAllContacts
);

router.post(
  "/organization-list",
  adminPanelValidator.organizationListValidator,
  adminPanelController.getOrganizations
);

router.put(
  "/cancel-lead/:contactId",
  adminPanelValidator.cancelLeadValidator,
  adminPanelController.cancelLead
);

router.put(
  "/close-lead/:contactId",
  adminPanelValidator.closeLeadValidator,
  adminPanelController.closeLead
);

router.put(
  "/reject-lead/:contactId",
  adminPanelValidator.rejectLeadValidator,
  adminPanelController.rejectLead
);

router.post(
  "/forward-lead/:contactId",
  adminPanelValidator.forwardLeadValidator,
  adminPanelController.forwardLead
);

router.get(
  "/lead/:contactId",
  adminPanelValidator.viewSingleLeadValidator,
  adminPanelController.viewSingleLeadById
);

router.put("/organizationstatus/:orgId",
    adminPanelController.OrganizationStatusById
)

module.exports = router;
