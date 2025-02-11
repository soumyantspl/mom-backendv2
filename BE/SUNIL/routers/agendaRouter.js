const express = require("express");
const router = express.Router();
const agendaController = require("../controllers/agendaController");
const agendaValidator = require("../validators/agendaValidator");
const authMiddleware = require("../middlewares/authMiddleware");
// CREATE AGENDA
router.post(
  "/createAgenda",
  agendaValidator.createAgendaValidator,
  authMiddleware.verifyUserToken,
  agendaController.createAgenda
);


// CREATE AGENDA WITH MINUTES
router.post(
  "/createAgendaWithMinutes",
  agendaValidator.createAgendaWithMinutesValidator,
  authMiddleware.verifyUserToken,
  agendaController.createAgendaWithMinutes
);

/* UPDATE AGENDA  */
router.put(
  "/updateAgenda/:agendaId",
  agendaValidator.updateAgendaValidator,
  authMiddleware.verifyUserToken,
  agendaController.updateAgenda
);


/* DELETE AGENDA */
router.put(
  "/deleteAgenda/:agendaId",
  agendaValidator.deleteAgendaValidator,
  authMiddleware.verifyUserToken,
  agendaController.deleteAgenda
);




module.exports = router;
