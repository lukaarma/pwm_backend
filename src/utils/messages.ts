export const LOG_ERRORS = {
    MISSING_MONGODB_SERVER: 'Missing MongoDB server url!\nPlease use the MONGODB_SERVER enviroment variable to specify the server url!',
    MISSING_MONGODB_CREDENTIALS: 'Missing MongoDB credentials!\nPlease supply a X509 certificate with the MONGODB_X509 enviroment variable or set MONGODB_USERNAME and MONGODB_PASSWORD for a traditiona login!',
    MISSING_MONGODB_NAME: 'Missing MongoDB database name!\nPlease use the MONGODB_NAME enviroment variable to specify the database name!',
    INVALID_MONGODB_X509: 'The file path provided in MONGODB_X509 is not valid! Please check the file path and try again.',
    MISSING_JWT_SECRET: 'Missing JWT secret!\nPlease use the JWT_SECRET enviroment variable to specify the JWT secret!',
    MISSING_SERVER_HOSTNAME: 'Missing server hostname!\nPlease use the SERVER_HOSTNAME enviroment variable to specify the server hostame!',
    MISSING_MAILGUN_DOMAIN: 'Missing Mailgun domain!\nPlease use the MAILGUN_DOMAIN enviroment variable to specify the Mailgun domain!',
    MISSING_MAILGUN_USERNAME: 'Missing Mailgun username!\nPlease use the MAILGUN_USERNAME enviroment variable to specify the Mailgun username!',
    MISSING_MAILGUN_PASSWORD: 'Missing Mailgun password!\nPlease use the MAILGUN_PASSWORD enviroment variable to specify the Mailgun password!',
    MAILGUN_EU: 'Missing Mailgun EU!\nPlease use the MAILGUN_EU enviroment variable to specify the Mailgun EU!',
    SERVER_PORT_ISNAN: 'Server port parsing error!\nPlease use the SERVER_PORT enviroment variable to specify a valid server port!',
    SERVER_PORT_OUT_OF_RANGE: 'Server port out of range!\nThe server port must be a number between 1 and 65535. Please use the SERVER_PORT enviroment variable to specify a valid server port!'
};

export const LOG_WARN = {
    MISSING_NODE_ENV: "No enviroment information detected, Defaulting to 'development'!\nIf you are in a prduction enviroment che that your NODE_ENV enviroment variable is set correctly.",
    MISSING_SERVER_HOSTNAME: "No server hostname specified, using 'localhost'.\nIf you want to specify an hostname use the SERVER_HOSTNAME enviroment variable.",
    MISSING_SERVER_PORT: 'No server port specified, using 9001.\nIf you want to specify a port use the SERVER_PORT enviroment variable.',
    RANDOM_JWT_SECRET: 'No JWT secret provided, generating random secret for development enviroment.\nIf you want to specify a port JWT secret the JWT_SECRET enviroment variable.'
};

export const WEB_ERRORS = {
    LOGIN_FAILED: {
        code: 100,
        message: 'Wrong username or password!'
    },
    SIGNUP_ERROR: {
        code: 101,
        message: 'Server side error, please try again later :('
    },
    UNAUTHARIZED_ACCESS: {
        code: 102,
        message: 'Unautharized access. Go away!'
    },
    INVALID_VERIFICAION_TOKEN: {
        code: 104,
        message: 'Invalid, expired or already verified token submitted.'
    },
    EVERYTHING_IS_ON_FIRE: {
        code: 999,
        message: 'This is fine. Request in auth route with JWT and invalid id.'
    }
};
