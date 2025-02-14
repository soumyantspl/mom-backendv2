const fs = require("fs");

const errorLog = (error) => {
  const dateOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-GB", dateOptions);
  const formattedTime = currentDate.toLocaleTimeString("en-GB", timeOptions);

  const logData = `Date: ${formattedDate}, Time: ${formattedTime}\nError: ${error.message}\nStack Trace: ${error.stack}\n`;
  fs.appendFileSync("./log/error.log", logData);
};

module.exports = {
  errorLog,
};
