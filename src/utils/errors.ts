export const LOG_ERRORS = {
    MISSING_NODE_ENV: 'No enviroment information detected, no file transport created.\n Check that your NODE_ENV variable exists and is a valid value!',
    MISSING_MONGODB_SERVER: 'Missing MongoDB server url!\n Please use the MONGODB_SERVER enviroment variable to specify the server url!',
    MISSING_MONGODB_CREDENTIALS: 'Missing MongoDB credentials!\n Please supply a X509 certificate with the MONGODB_X509 enviroment variable or set MONGODB_USERNAME and MONGODB_PASSWORD for a traditiona login!',
    INVALID_MONGODB_X509: 'The file path provided in MONGODB_X509 is not valid! Please check the file path and try again.'
};
