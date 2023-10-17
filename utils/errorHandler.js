const InternalErrorHandler = (error) => {
  if (error.name === "SequelizeUniqueConstraintError") {
    const errorMessage = { error: `${error.errors[0].value} already exist` };
    return errorMessage;
  } else {
    console.log(error);
    return "Internal Server Error";
  }
};

export default InternalErrorHandler;
