const express = require("express");
const router = express.Router();
const leadValidator = require("../validators/leadValidator");
const authMiddleware = require("../middlewares/authMiddleware");
const leadController = require("../controllers/leadController");


router.post("/contact-list", 
    leadValidator.contactListValidator,
    authMiddleware.verifyUserToken,
    leadController.getAllContacts);


 router.put("/cancel-lead/:contactId",
    leadValidator.cancelLeadValidator,
    authMiddleware.verifyUserToken, 
    leadController.cancelLead);

router.put("/close-lead/:contactId",
    leadValidator.closeLeadValidator,
    authMiddleware.verifyUserToken,  
    leadController.closeLead);


router.put("/reject-lead/:contactId",
    leadValidator.rejectLeadValidator,
    authMiddleware.verifyUserToken,  
    leadController.rejectLead);

 router.post("/forward-lead/:contactId", 
    leadValidator.forwardLeadValidator,
    authMiddleware.verifyUserToken,
    leadController.forwardLead);

router.get("/lead/:contactId", 
    leadValidator.viewSingleLeadValidator, 
    leadController.viewSingleLeadById);


 module.exports = router;