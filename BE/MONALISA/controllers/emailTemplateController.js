const emailTemplateService = require("../services/emailTemplateService");
const Responses = require("../helpers/response");
const messages = require("../constants/constantMessages");

const createEmailTemplate = async (req, res) => {
  console.log("in controller")
  try {
    const data = req.body;
    const result = await emailTemplateService.createEmailTemplate(data);
  if (!result) {
        return Responses.failResponse(req,res,null,messages.insertFailed,200);
      }
      console.log("result=======",result)
    return Responses.successResponse(req,res,result,messages.createdSuccess,201);
    
  }  catch (error) {
    // console.log("Controller error:", error);
    return Responses.errorResponse(req, res, error);
  }
};

const updateEmailTemplate = async (req, res) => {
  try {
    const { organizationId } = req.params; 
    const data = req.body;


    const result = await emailTemplateService.updateEmailTemplate(organizationId, data);
    console.log("result-=-=-=-=-=-",result);
    
    
    if (!result) {
      return Responses.failResponse(req, res, null, messages.emailtemplateupdateFailed, 200);
    }

    const successMessage = result.isNewRecord ? messages.createdSuccess : messages.updateSuccess;

    return Responses.successResponse(req, res, result, successMessage, 200);
  } catch (error) {
    // console.log("Controller error:", error);
    return Responses.errorResponse(req, res, error);
  }
};


// Controller to handle API request to get all email templates
const getAllEmailTemplates = async (req, res) => {
  try {
    const { organizationId } = req.params; 
    if (!organizationId) {
      return Responses.failResponse(req, res, null, messages.idRequired, 400);
    }

    const { result, totalCount } = await emailTemplateService.getAllEmailTemplates(organizationId);

    if (!result || result.length === 0) {
      return Responses.failResponse(req, res, null, messages.notemplet, 404);
    }

   
    const response = {
      totalCount: totalCount,
      templates: result,
      
    };

    return Responses.successResponse(req, res, response, messages.templetsuccess, 200);
  } catch (error) {
    return Responses.errorResponse(req, res, error);
  }
};



// Controller to handle API request to get an email template by type
const getEmailTemplateByType = async (req, res) => {
  const { templateType } = req.params;
  try {
    const result = await emailTemplateService.getEmailTemplateByType(
      templateType
    );
    if (!result) {
      return Responses.failResponse( req, res, null, messages.fetchedtemplateError, 200
      );
    }
    return Responses.successResponse(req,res, result,messages.getSuccess,201);
  } catch (error) {
    return Responses.errorResponse(req, res, error);
  }
};

module.exports = {
  getAllEmailTemplates,
  getEmailTemplateByType,
  createEmailTemplate,
  updateEmailTemplate
};
