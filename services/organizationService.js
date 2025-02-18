const Organization = require("../models/organizationModel");
const Configuration = require("../models/configurationModel");
const emailConstants = require("../constants/emailConstants");
const emailTemplates = require("../emailSetUp/emailTemplates");
const emailService = require("./emailService");
const logService = require("./logsService");
const logMessages = require("../constants/logsConstants");
const commonHelper = require("../helpers/commonHelper");
const ObjectId = require("mongoose").Types.ObjectId;
const organizationOtp = require("../models/organizationOtpModel");
const authService = require("./authService");
const employeeService = require("./employeeService");
const Department = require("../models/departmentModel");
const Designations = require("../models/designationModel");
const Units = require("../models/unitModel");
const Employee = require("../models/employeeModel");
const { duplicateEmail } = require("../constants/constantMessages");
const { generateOrganizationCode } = require("../helpers/commonHelper")
//FUNCTION TO- ORGANIZATION EXIST OR NOT

const existingOrganization = async (email) => {
  const DATA = await Organization.findOne({ email, isActive: true });
  return DATA;
};


const organizationRegistrationService = async (data) => {
  // Check for duplicate organization and employee email
  const organisationCheck = await checkDuplicateOrganization(data.name, data.email);
  const employeeEmailCheck = await checkDuplicateEmployee(data.email);

  // Verify OTP status (within the allowed time window)
  const isOtpVerified = await organizationOtp.findOne({
    email: data.email,
    isVerified: true,
    updatedAt: {
      $gte: new Date().getTime() - 1000 * 60 * process.env.CHECK_OTP_VALIDATION_TIME,
    },
  });
  console.log("isOtpVerified", isOtpVerified);

  if (isOtpVerified) {
    if (!organisationCheck && !employeeEmailCheck) {
      // Generate organization code based on organization name
      const organizationCode = await generateOrganizationCode(data.name);
      console.log("Generated Organization Code:", organizationCode);

      const newOrganizationData = {
        name: data.name,
        email: data.email,
        contactPersonName: data.contactPersonName,
        phoneNo: data.phoneNo,
        contactPersonPhNo: data.contactPersonPhNo,
        contactPersonWhatsAppNo: data.contactPersonWhatsAppNo,
        organizationCode
      };

      console.log("newOrganizationData-->", newOrganizationData)
      const organization = new Organization(newOrganizationData);
      const result = await organization.save();
      console.log("Organization created:", result);

      // Create default related records: Department, Designation, Unit
      const newDepartment = new Department({
        name: "Other",
        organizationId: result._id
      });
      const departmentResult = await newDepartment.save();

      const newDesignation = new Designations({
        name: "Other",
        organizationId: result._id,
      });
      const designationResult = await newDesignation.save();

      const newUnitData = new Units({
        name: "Other",
        address: "Other",
        organizationId: result._id,
      });
      const unitResult = await newUnitData.save();

      // Create an admin employee for the organization
      const inputData = {
        name: result.name,
        organizationId: result._id,
        email: result.email,
        designationId: designationResult._id,
        departmentId: departmentResult._id,
        unitId: unitResult._id,
        isMeetingOrganiser: true,
        isAdmin: true,
        empId: "Admin",
      };
      const empData = new Employee(inputData);
      const empResult = await empData.save();
      console.log("Admin Employee created:", empResult);

      // Prepare email data and send registration email
      const logo = process.env.LOGO;
      const emailType = "Organization Registration";
      const emailSubject = "Organization Registration";

      const mailData = await emailTemplates.organizationRegistration(
        commonHelper.convertFirstLetterOfFullNameToCapital(result.name),
        logo
      );
      console.log("Email template data:", mailData);

      await emailService.sendEmail(result.email, emailType, emailSubject, mailData);
      console.log("Registration email sent to:", result.email);

      return result;
    } else {
      return { isDuplicate: true };
    }
  } else {
    return { isOtpVerified: false };
  }
};


const organizationSendOtp = async (id, data, ipAddress) => {
  const { name, email } = data;

  const otp = await commonHelper.generateOtp();

  console.log("EMail", email)
  const result = await checkDuplicateOrganization(email);
  const employeeDuplicate = await checkDuplicateEmployeeForOTP(email)
  if (result && result.email === email) {
    console.log("Duplicate email found");
    return { isDuplicate: true };
  } else if (employeeDuplicate) {
    return { isDuplicate: true };
  }
  const otpLogsData = await organizationOtp.findOne({
    email,
    updatedAt: {
      $gte: new Date(
        new Date().getTime() - 1000 * 60 * process.env.CHECK_OTP_VALIDATION_TIME
      ),
    },
  });

  if (!otpLogsData) {
    const otpData = new organizationOtp({ otp, email });
    await otpData.save();

    const logo = process.env.LOGO;
    const emailType = "Send OTP";
    const emailSubject = "Organization Registration";
    const mailData =
      await emailTemplates.organizationRegistrationSendOtpTemplate(
        commonHelper.convertFirstLetterOfFullNameToCapital(name),
        otp,
        process.env.CHECK_OTP_VALIDATION_TIME,
        logo
      );

    await emailService.sendEmail(email, emailType, emailSubject, mailData);
    return {
      data: {
        usedOtp: 1,
        totalOtp: 3,
      },
    };
  }

  if (otpLogsData.isVerified) {
    return {
      isOtpVerified: true,
      data: {
        usedOtp: 1,
        totalOtp: 3,
      },
    };
  }

  if (otpLogsData.otpCount >= 3) {
    return {
      isMaxOtpSendOvered: true,
      data: {
        usedOtp: otpLogsData.otpCount,
        totalOtp: 3,
      },
    };
  }

  await organizationOtp.findByIdAndUpdate(
    otpLogsData._id,
    { otpCount: otpLogsData.otpCount + 1, otp },
    { new: true }
  );

  const logo = process.env.LOGO;
  const emailType = "Send OTP";
  const emailSubject = "Organization Registration";
  const mailData = await emailTemplates.organizationRegistrationSendOtpTemplate(
    commonHelper.convertFirstLetterOfFullNameToCapital(name),
    otp,
    process.env.CHECK_OTP_VALIDATION_TIME,
    logo
  );

  await emailService.sendEmail(email, emailType, emailSubject, mailData);
  return {
    data: {
      usedOtp: otpLogsData.otpCount + 1,
      totalOtp: 3,
    },
  };
};

const validateOtp = async (userData, emailType) => {
  let otpResendTime;
  let otpResendCount;
  const rulesData = await authService.checkReSendOtpRules(userData);
  if (rulesData?.isNewRecordCreated) {
    otpResendTime = new Date();
    otpResendCount = 1;
    return {
      ...(await insertOtp(userData, otpResendCount, otpResendTime, emailType)),
      otpResendCount,
    };
  }

  if (rulesData?.isReSendOtpAllowed) {
    otpResendTime = rulesData.otpResendTime;
    otpResendCount = rulesData.otpResendCount;
    return {
      ...(await insertOtp(userData, otpResendCount, otpResendTime, emailType)),
      otpResendCount,
    };
  }
  if (!rulesData.isReSendOtpAllowed) {
    return rulesData;
  }
};

const verifyOtp = async (data) => {
  data;
  console.log("data-->", data);
  const { email, otp } = data;
  const otpLogsData = await organizationOtp.findOne({
    email,
    otp,
    updatedAt: {
      $gte:
        new Date().getTime() -
        1000 * 60 * process.env.CHECK_OTP_VALIDATION_TIME,
    },
  });
  console.log("otpLogsData-->", otpLogsData);
  if (!otpLogsData) {
    const checkOtpExist = await organizationOtp
      .find({
        email,
      })
      .sort({ _id: -1 })
      .limit(1);
    if (checkOtpExist.length == 0) {
      return {
        isOtpNotFound: true,
      };
    } else {
      if (parseInt(checkOtpExist[0].otp) !== parseInt(otp)) {
        return {
          wrongOtpFound: true,
        };
      } else {
        return {
          otpExpired: true,
        };
      }
    }
  }
  if (otpLogsData) {
    if (otpLogsData.isVerified == true) {
      return {
        isOtpVerified: true,
      };
    }
    await organizationOtp.findByIdAndUpdate(
      { _id: otpLogsData._id },
      { isVerified: true },
      { new: true }
    );
    ("OTP verification successful.");
    return true;
  } else {
    ("Provided OTP does not match.");
    return false;
  }
};

//FUNCTION TO- VIEW ORGANIZATION
const viewOrganizationService = async (query, page, limit) => {
  let organisationData;
  if (Object.keys(query).length === 0) {
    organisationData = await Organization.find()
      .skip((page - 1) * limit)
      .limit(limit);
  } else {
    organisationData = await Organization.find(query)
      .skip((page - 1) * limit)
      .limit(limit);
  }
  return organisationData;
};
//FUNCTION TO- VIEW SINGLE ORGANIZATION
const viewSingleOrganizationServiceOld = async (id) => {
  const configData = await Configuration.findOne({
    organizationId: new ObjectId(id),
  });
  const organizationData = await Organization.findById({
    _id: new ObjectId(id),
    isActive: true,
  });
  if (organizationData) {
    const baseUrl = `${process.env.BASE_URL}`;
    if (organizationData.dashboardLogo) {
      organizationData.dashboardLogo = `${baseUrl + organizationData.dashboardLogo
        }`;
    }
    if (organizationData.loginLogo) {
      organizationData.loginLogo = `${baseUrl + organizationData.loginLogo}`;
    }
  }
  const result = {
    ...organizationData._doc,
    configData: {
      writeMinuteMaxTimeInHour: configData?.writeMinuteMaxTimeInHour,
    },
  };
  return result;
};
//FUNCTION TO- EDIT ORGANIZATION

const editOrganizationService = async (userId, id, data, ipAddress) => {
  console.log("Incoming data->", data);

  // Fetch current organization details
  const currentOrganization = await Organization.findOne({ _id: id, isActive: true });
  if (!currentOrganization) {
    console.log("Organization not found or inactive.");
    return { error: "Organization not found or inactive." };
  }

  console.log("Current Organization->", currentOrganization);

  // Prepare data for update
  const updatedData = {
    ...data,
    dashboardLogo: data.dashboardLogo || currentOrganization.dashboardLogo,
    loginLogo: data.loginLogo || currentOrganization.loginLogo,
    image: data.image || currentOrganization.image,
  };

  console.log("Prepared Update Data->", updatedData);

  // Update organization details
  const updatedOrganization = await Organization.findByIdAndUpdate(id, updatedData, { new: true });
  if (!updatedOrganization) {
    console.log("Failed to update organization details.");
    return { error: "Organization update failed." };
  }

  console.log("Updated Organization->", updatedOrganization);

  // Handle email update
  if (data.email && data.email !== currentOrganization.email) {
    const isEmailInUse = await Employee.findOne({ email: data.email, organizationId: id });
    if (isEmailInUse) {
      console.log("Email already in use by another employee->", isEmailInUse);
      return { error: "This email is already in use by another employee in the same organization." };
    }

    const updatedEmployee = await Employee.findOneAndUpdate(
      { email: currentOrganization.email, organizationId: id },
      { email: data.email },
      { new: true }
    );

    if (!updatedEmployee) {
      console.log("Failed to update employee email.");
      return { error: "Failed to update employee email. No matching employee found." };
    }

    console.log("Updated Employee->", updatedEmployee);
  }

  // Generate logs for updates
  const logDetails = await commonHelper.generateLogObjectForOrganization(
    currentOrganization,
    userId,
    updatedData
  );

  if (logDetails.length > 0) {
    const logData = {
      moduleName: logMessages.Organization.moduleName,
      userId,
      action: logMessages.Organization.updateOrganization,
      ipAddress,
      details: logDetails.join(", "),
      organizationId: new ObjectId(id),
    };
    console.log("Creating Log->", logData);
    await logService.createLog(logData);
  }

  return updatedOrganization;
};





//FUNCTION TO- CHECK DUPLICATE ORGANIZATION
const checkDuplicateOrganization = async (email) => {
  return await Organization.findOne({ email: email });
};

const checkDuplicateOrganizationCode = async (organizationCode) => {
  return await Organization.findOne({ organizationCode });
}

const checkDuplicateEmployee = async (id, email) => {
  console.log("Employee duplicate")
  return await Employee.findOne({ id, email });
};

const checkDuplicateEmployeeForOTP = async (email) => {
  console.log("Employee duplicate")
  return await Employee.findOne({ email });
};

//Edit Email
const editOrganizationEmailService = async (userId, id, email, ipAddress) => {
  console.log("Organization ID:", id, "New Email:", email);

  const currentOrganization = await Organization.findOne({ _id: id, isActive: true });
  console.log("Current Organization:", currentOrganization);

  if (!currentOrganization) {
    console.log("Organization not found or inactive.");
    return { error: "Organization not found or inactive." };
  }
  const employeeEmailCheck = await Employee.findOne({ email: email });
  console.log("Employee Email Check:", employeeEmailCheck);

  if (!employeeEmailCheck === null) {
    return { error: "This email is already in use by another employee in the same organization." };
  }

  if (email) {
    const updatedOrganization = await Organization.findByIdAndUpdate(
      id,
      { email: email },
      { new: true }
    );
    console.log("Updated Organization:", updatedOrganization);

    if (!updatedOrganization) {
      return { error: "Failed to update organization email." };
    }

    const oldEmail = currentOrganization.email
    const newEmail = email
    const updatedEmployee = await Employee.findOneAndUpdate(
      { organizationId: id, email: oldEmail },
      { email: newEmail },
      { new: true }
    );
    console.log("Updated Employee:", updatedEmployee);

    if (!updatedEmployee) {
      return { error: "Failed to update employee email. No matching employee found." };
    }

    const logDetails = await commonHelper.generateLogObjectForOrganization(
      currentOrganization,
      userId,
      { email: email }
    );

    if (logDetails.length) {
      const logData = {
        moduleName: logMessages.Organization.moduleName,
        userId,
        action: logMessages.Organization.updateOrganization,
        ipAddress,
        details: logDetails.join(", "),
        organizationId: id,
      };
      await logService.createLog(logData);
    }
    return updatedOrganization;
  }

  return currentOrganization;
};




const viewSingleOrganizationService = async (id) => {
  const organizationData = await Organization.aggregate([
    {
      $match: {
        _id: new ObjectId(id),
        isActive: true,
      },
    },
    {
      $lookup: {
        from: "configurations",
        foreignField: "organizationId",
        localField: "_id",
        as: "configData",
      },
    },
    {
      $lookup: {
        from: "hostingdetails",
        foreignField: "organizationId",
        localField: "_id",
        as: "hostingDetails",
      },
    },
    {
      $project: {
        _id: 1,
        loginLogo: 1,
        dashboardLogo: 1,
        organizationCode: 1,
        email: 1,
        contactPersonName: 1,
        phoneNo: 1,
        contactPersonPhNo: 1,
        contactPersonWhatsAppNo: 1,
        name: 1,
        hostingDetails: {
          _id: 1,
          zoomCredentials: 1,
        },
        configData: {
          _id: 1,
          writeMinuteMaxTimeInHour: 1,
        },
      },
    },
    {
      $unwind: {
        path: "$hostingDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$configData",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);

  console.log("organizationData===========1======>>>>>>>", organizationData)
  if (organizationData?.length !== 0) {
    const baseUrl = `${process.env.BASE_URL}`;
    if (organizationData[0].dashboardLogo) {
      organizationData[0].dashboardLogo = `${baseUrl + organizationData[0].dashboardLogo
        }`;
    }
    if (organizationData[0].loginLogo) {
      organizationData[0].loginLogo = `${baseUrl + organizationData[0].loginLogo}`;
    }
  }
  console.log("organizationData=================>>>>>>>", organizationData)
  const result = {
    ...organizationData[0],
    // configData: {
    //   writeMinuteMaxTimeInHour: configData?.writeMinuteMaxTimeInHour,
    // },
  };
  return result;
};


module.exports = {
  organizationRegistrationService,
  organizationSendOtp,
  viewOrganizationService,
  viewSingleOrganizationServiceOld,
  viewSingleOrganizationService,
  editOrganizationService,
  existingOrganization,
  viewOrganizationService,
  checkDuplicateOrganization,
  validateOtp,
  verifyOtp,
  editOrganizationEmailService,
  checkDuplicateOrganizationCode
};
