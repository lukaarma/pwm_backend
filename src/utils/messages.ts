export const LOG_ERRORS = {
    MISSING_MONGODB_SERVER: 'Missing MongoDB server url!\nPlease use the MONGODB_SERVER enviroment variable to specify the server url!',
    MISSING_MONGODB_CREDENTIALS: 'Missing MongoDB credentials!\nPlease supply a X509 certificate with the MONGODB_X509 enviroment variable or set MONGODB_USERNAME and MONGODB_PASSWORD for a traditiona login!',
    MISSING_MONGODB_NAME: 'Missing MongoDB database name!\nPlease use the MONGODB_NAME enviroment variable to specify the database name!',
    INVALID_MONGODB_X509: 'The file path provided in MONGODB_X509 is not valid! Please check the file path and try again.',
    MISSING_JWT_SECRET: 'Missing JWT secret!\nPlease use the JWT_SECRET enviroment variable to specify the JWT secret!'
};

export const LOG_WARN = {
    MISSING_NODE_ENV: "No enviroment information detected, Defaulting to 'development'!\nIf you are in a prduction enviroment che that your NODE_ENV enviroment variable is set correctly.",
    MISSING_SERVER_HOSTNAME: "No server hostname specified, using 'localhost'.\nIf you want to specify an hostname use the SERVER_HOSTNAME enviroment variable.",
    MISSING_SERVER_PORT: 'No server port specified, using 9001.\nIf you want to specify a port use the SERVER_PORT enviroment variable.',
    RANDOM_JWT_SECRET: 'No JWT secret provided, generating random secret for development enviroment.\nIf you want to specify a port JWT secret the JWT_SECRET enviroment variable.'
};
