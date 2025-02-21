const commonHelper = require("../helpers/commonHelper");

const sampleTest = async (attendeeName) =>
  new Promise((resolve, reject) => {
    const myvar =
      `${
        "<!DOCTYPE html>" +
        '<html lang="en">' +
        "  <head>" +
        '    <meta charset="utf-8" />' +
        "    <title>MOM Management </title>" +
        '<link rel="stylesheet" type="text/css" href="css/style.css" />' +
        '    <style type="text/css">' +
        "      body {" +
        "        font-family: Arial, sans-serif !important;" +
        "        color: #222222;" +
        "      }" +
        "    </style>" +
        "  </head>" +
        "<body>" +
        '<p>Soumya</p>' +
      "  </body>" +
      "</html>"}`;
    resolve(myvar);
  });

  const momDetails = async (meetingData) =>
    new Promise((resolve, reject) => {
      const myvar =
        `${
          "<!DOCTYPE html>" +
          '<html lang="en">' +
          "  <head>" +
          '    <meta charset="utf-8" />' +
          "    <title>MOM Management </title>" +
          "    <link" +
          '      rel="stylesheet"' +
          '      href="https://use.fontawesome.com/releases/v5.7.2/css/all.css"/>' +
          '    <style type="text/css">' +
          "      body {" +
          "        font-family: Arial, sans-serif !important;" +
          "        color: #222222;" +
          "      }" +
          "    </style>" +
          "  </head>" +
          "<body>" +
          '<div className="container">'+
          '<div className="row">'+
          '<div className="col-sm-12">'+
          '<form className="mt-2 details-form details-form-right">'+
          '<div className="form-group">'+
           '<div className="row">'+
              '<div className="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">'+
                '<label className="mb-1">Meeting ID</label>'+
              '</div>'+
              '<div className="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">'+
                `<p>${meetingData.meetingDetails?.meetingId}</p>`+
              '</div>'+
            '</div>'+
          '</div>'+
          '</div>'+
        "  </body>" +
        "</html>"}`;
      resolve(myvar);
    });

module.exports = {
  sampleTest,
  momDetails
};
