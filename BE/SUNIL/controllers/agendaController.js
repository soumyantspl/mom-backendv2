const agendaService = require("../services/agendaService");
const meetingService = require("../services/meetingService");
const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");
const { errorLog } = require("../middlewares/errorLog");
const minutesService = require("../services/minutesService");
const commonHelper = require("../helpers/commonHelper");

/**FUNC- TO CREATE AGENDA **/
const createAgenda = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const result = await agendaService.createAgendaForMeeting(
      req.userId,
      req.body,
      ip
    );
    if (!result) {
      return Responses.failResponse(req, res, null, messages.createError, 409);
    }
    return Responses.successResponse(
      req,
      res,
      result.data,
      messages.createdSuccess,
      201
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO CREATE AGENDA WITH MINUTE **/
const createAgendaWithMinutes = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const isMeetingOrganiser=await meetingService.getCreatedByDetails(req.body?.agendaData[0]?.meetingId,req.userId);
    if (!req.userData.isAdmin && isMeetingOrganiser===false) {
      const checkMomWritePermission =
        await minutesService.checkMomWritePermission(
          req.body?.agendaData[0]?.meetingId,
          req.userId
        );
      if (!checkMomWritePermission) {
        return Responses.failResponse(
          req,
          res,
          null,
          messages.momWritePermissionDenied,
          200
        );
      }
    }
    const result = await agendaService.createAgendaWithMinutes(
      req.userId,
      req.body,
      ip
    );
    if (!result) {
      return Responses.failResponse(req, res, null, messages.createError, 200);
    }

    if (result.isWriteMinuteNotAllowedForClosedMinutes) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.writeMinuteNotAllowed,
        200
      );
    }

    return Responses.successResponse(
      req,
      res,
      result.data,
      messages.createdSuccess,
      201
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO VIEW AGENDA **/
const viewAgendas = async (req, res) => {
  try {
    const result = await agendaService.viewAgendas(req.params.id, req.userId);
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        200
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.recordsFound,
      200
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO UPDATE AGENDA **/
const updateAgenda = async (req, res) => {
  try {
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    console.log("req.body?===============",req.body)
    const isMeetingOrganiser=await meetingService.getCreatedByDetails(req.body?.meetingId,req.userId);
    console.log("isMeetingOrganiser================",isMeetingOrganiser)
    if (!req.userData.isAdmin && isMeetingOrganiser===false) {
      const checkMomWritePermission =
        await minutesService.checkMomWritePermission(
          req.body?.agendaData?.meetingId,
          req.userId
        );
      if (!checkMomWritePermission) {
        return Responses.failResponse(
          req,
          res,
          null,
          messages.momWritePermissionDenied,
          200
        );
      }
    }
    const result = await agendaService.updateAgenda(
      req.params.agendaId,
      req.body,
      req.userId,
      ip
    );


    if (result.isWriteMinuteNotAllowedForClosedMinutes) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.editAgendaNotAllowed,
        200
      );
    }

    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.recordsNotFound,
        409
      );
    }
    return Responses.successResponse(
      req,
      res,
      result,
      messages.updateSuccess,
      200
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
/**FUNC- TO DELETE AGENDA **/
const deleteAgenda = async (req, res) => {
  try {
    console.log(req.body)
    let ip = req.headers.ip ? req.headers.ip : await commonHelper.getIp(req);
    const isMeetingOrganiser=await meetingService.getCreatedByDetails(req.body?.meetingId,req.userId);
    if (!req.userData.isAdmin && isMeetingOrganiser===false) {
      const checkMomWritePermission =
        await minutesService.checkMomWritePermission(
          req.body?.agendaData?.meetingId,
          req.userId
        );
      if (!checkMomWritePermission) {
        return Responses.failResponse(
          req,
          res,
          null,
          messages.momWritePermissionDenied,
          200
        );
      }
    }
    const result = await agendaService.deleteAgenda(
      req.params.agendaId,
      req.body,
      req.userId,
      ip
    );
    if (result.isWriteMinuteNotAllowedForClosedMinutes) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.deleteAgendaNotAllowed,
        200
      );
    }
    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.deleteFailedRecordNotFound,
        200
      );
    }
    if (result && result.isDeleteNotAllowed == true) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.isDeleteNotAllowed,
        200
      );
    }

    return Responses.successResponse(
      req,
      res,
      result,
      messages.deleteSuccess,
      200
    );
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

module.exports = {
  createAgenda,
  viewAgendas,
  createAgendaWithMinutes,
  updateAgenda,
  deleteAgenda,
  
};
