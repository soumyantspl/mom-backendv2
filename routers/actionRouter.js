const express = require("express");
const router = express.Router();
const actionValidator = require("../validators/actionValidator");
const authMiddleware = require("../middlewares/authMiddleware");
const actionController = require("../controllers/actionController");

/* ACTION COMMENT  */
router.post(
  "/actionComment/:id",
  actionValidator.actionCommentsValidator,
  authMiddleware.verifyUserToken,
  actionController.actionCommentsCreate
);
/* ACTION REASSIGN REQUEST  */
router.put(
  "/actionReAssignRequest/:id",
  actionValidator.actionReassignRequestValidator,
  authMiddleware.verifyUserToken,
  actionController.actionReassignRequest
);

/* VIEW SINGLE ACTION DETAILS  */
router.get(
  "/viewSingleAction/:id",
  actionValidator.viewSingleActionValidator,
  authMiddleware.verifyUserToken,
  actionController.viewSingleAction
);

/* VIEW ALL ACTION LIST  */
router.get(
  "/viewAllActions",
  actionValidator.viewAllActionsValidator,
  authMiddleware.verifyUserToken,
  actionController.viewAllActions
);

/* VIEW ACTION COMMENT  */
router.get(
  "/viewActionComment",
  actionValidator.viewActionCommentValidator,
  authMiddleware.verifyUserToken,
  actionController.viewActionComment
);

/* REASSIGN ACTION  */
router.put(
  "/reAssignAction/:id",
  actionValidator.reAssignActionValidator,
  authMiddleware.verifyUserToken,
  actionController.reAssignAction
);

/* VIEW USER ALL ACTION LIST  */
router.post(
  "/viewUserAllActions",
  actionValidator.viewAllActionsValidator,
  authMiddleware.verifyUserToken,
  actionController.viewUserAllActions
);

/* UPDATE ACTION   */
router.put(
  "/updateAction/:id",
  actionValidator.updateActionValidator,
  authMiddleware.verifyUserToken,
  actionController.updateAction
);

/* VIEW ACTION   */
router.get(
  "/viewActionActivities/:id",
  actionValidator.viewActionActivities,
  authMiddleware.verifyUserToken,
  actionController.viewActionActivities
);

/* UPDATE ACTION   */
router.put(
  "/reopenAction/:id",
  actionValidator.reopenActionValidator,
  authMiddleware.verifyUserToken,
  actionController.reopenAction
);

/* APPROVE ACTION   */
router.put(
  "/approveAction/:id",
  actionValidator.approveActionValidator,
  authMiddleware.verifyUserToken,
  actionController.approveAction
);

/* REJECT REASSIGN REQUEST ACTION   */
router.put(
  "/rejectReasignRequest/:id",
  actionValidator.rejectReasignRequestValidator,
  authMiddleware.verifyUserToken,
  actionController.rejectReasignRequest
);

/* CANCEL ACTION   */
router.put(
  "/cancelAction/:id",
  actionValidator.cancelActionValidator,
  authMiddleware.verifyUserToken,
  actionController.cancelAction
);

/* VIEW ACTION ALL STATUS DATA   */
router.get(
  "/totalActionList/:organizationId",
  actionValidator.totalActionList,
  authMiddleware.verifyUserToken,
  actionController.totalActionList
);



/* VIEW ACTION ALL STATUS DATA   */
router.post(
  "/getUserActionPriotityDetails",
  actionValidator.getUserActionPriotityDetailsValidator,
  authMiddleware.verifyUserToken,
  actionController.getUserActionPriotityDetails
);

//prority wise data fetch
router.post(
  "/getAllActions",
  actionValidator.priorityWiseAllActionsValidator,
  authMiddleware.verifyUserToken,
  actionController.getAllActions
);

//PRATISHRUTI
///VIEW ALL DUEACTION PRORITY WISE ON RECHARTS BAR ??
router.post(
  "/prioritywiseactionduelist",
  actionValidator.ChartbarClickforalldata,
  authMiddleware.verifyUserToken,
  actionController.getMeetingDueActionPriorityDetails
);
///VIEW ALL DUEACTION PRORITY WISE ON RECHARTS BAR ??
router.post(
  "/attendeeprioritywiseactionduelist",
  actionValidator.ChartbarClickattendee,
  authMiddleware.verifyUserToken,
  actionController.getAttendeeDueActionPriorityDetails
);

module.exports = router;
