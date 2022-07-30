export const LOG_ERRORS = {
    MISSING_MONGODB_SERVER: 'Missing MongoDB server url!\n Please use the MONGODB_SERVER enviroment variable to specify the server url!',
    MISSING_MONGODB_CREDENTIALS: 'Missing MongoDB credentials!\n Please supply a X509 certificate with the MONGODB_X509 enviroment variable or set MONGODB_USERNAME and MONGODB_PASSWORD for a traditiona login!',
    MISSING_MONGODB_NAME: 'Missing MongoDB database name!\n Please use the MONGODB_NAME enviroment variable to specify the database name!',
    INVALID_MONGODB_X509: 'The file path provided in MONGODB_X509 is not valid! Please check the file path and try again.'
};

export const LOG_WARN = {
    MISSING_NODE_ENV: 'No enviroment information detected, no file transport created.\n Check that your NODE_ENV variable exists and is a valid value!',
    MISSING_SERVER_HOSTNAME: "No server hostname specified, using 'localhost'. If you want to specify an hostname use the SERVER_HOSTNAME enviroment variable.",
    MISSING_SERVER_PORT: 'No server port specified, using 9001. If you want to specify a port use the SERVER_PORT enviroment variable.'
};
