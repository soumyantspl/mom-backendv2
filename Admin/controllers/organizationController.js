const { errorLog } = require("../../middlewares/errorLog");
const Responses = require("../../helpers/response");
const organizationService = require("../services/organizationService");
const messages = require("../../constants/constantMessages");
const commonHelper = require("../../helpers/commonHelper");

/** FUNC- TO GET ORGANIZATION LIST **/
const getOrganizations = async (req, res) => {
  try {
    const organizationList = await organizationService.organizationList(
      req.body,
      req.query
    );

    if (
      !organizationList ||
      organizationList.totalCount === 0 ||
      !organizationList.data.length
    ) {
      return Responses.failResponse(
        req,
        res,
        { totalCount: 0, data: [] },
        messages.recordNotFound,
        200
      );
    }

    return Responses.successResponse(
      req,
      res,
      organizationList,
      messages.organizationsFetched,
      200
    );
  } catch (error) {
    errorLog(error);
    console.error("Error fetching organization list:", error);
    return Responses.errorResponse(req, res, error);
  }
};

const OrganizationStatusById = async (req, res) => {
  try {
    const result = await organizationService.OrganizationStatusById(
      req.params.orgId,
      req.body
    );

    if (!result) {
      return Responses.failResponse(
        req,
        res,
        null,
        messages.updateFailedRecordNotFound,
        200
      );
    }

    const message =
      req.body.isActive === true
        ? messages.activatedOrganization
        : req.body.isActive === false
        ? messages.deactivatedOrganization
        : messages.updateSuccess;

    return Responses.successResponse(req, res, result, message, 200);
  } catch (error) {
    console.log("Controller error:", error);
    return Responses.errorResponse(req, res, error);
  }
};

module.exports = {
  getOrganizations,
  OrganizationStatusById,
};
