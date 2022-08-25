export const LOG_ERRORS = {
    MISSING_MONGODB_SERVER: 'Missing MongoDB server url!\nPlease use the MONGODB_SERVER environment variable to specify the server url!',
    MISSING_MONGODB_CREDENTIALS: 'Missing MongoDB credentials!\nPlease supply a X509 certificate with the MONGODB_X509 environment variable or set MONGODB_USERNAME and MONGODB_PASSWORD for a traditional login!',
    MISSING_MONGODB_NAME: 'Missing MongoDB database name!\nPlease use the MONGODB_NAME environment variable to specify the database name!',
    INVALID_MONGODB_X509: 'The file path provided in MONGODB_X509 is not valid! Please check the file path and try again.',
    MISSING_JWT_SECRET: 'Missing JWT secret!\nPlease use the JWT_SECRET environment variable to specify the JWT secret!',
    MISSING_SERVER_HOSTNAME: 'Missing server hostname!\nPlease use the SERVER_HOSTNAME environment variable to specify the server hostname!',
    MISSING_MAILGUN_DOMAIN: 'Missing Mailgun domain!\nPlease use the MAILGUN_DOMAIN environment variable to specify the Mailgun domain!',
    MISSING_MAILGUN_USERNAME: 'Missing Mailgun username!\nPlease use the MAILGUN_USERNAME environment variable to specify the Mailgun username!',
    MISSING_MAILGUN_PASSWORD: 'Missing Mailgun password!\nPlease use the MAILGUN_PASSWORD environment variable to specify the Mailgun password!',
    MAILGUN_EU: 'Missing Mailgun EU!\nPlease use the MAILGUN_EU enviroment variable to specify the Mailgun EU!',
    SERVER_PORT_ISNAN: 'Server port parsing error!\nPlease use the SERVER_PORT environment variable to specify a valid server port!',
    SERVER_PORT_OUT_OF_RANGE: 'Server port out of range!\nThe server port must be a number between 1 and 65535. Please use the SERVER_PORT environment variable to specify a valid server port!'
};


export const LOG_WARN = {
    MISSING_NODE_ENV: "No environment information detected, Defaulting to 'development'!\nIf you are in a production environment che that your NODE_ENV environment variable is set correctly.",
    MISSING_SERVER_HOSTNAME: "No server hostname specified, using 'localhost'.\nIf you want to specify an hostname use the SERVER_HOSTNAME environment variable.",
    MISSING_SERVER_PORT: 'No server port specified, using 9001.\nIf you want to specify a port use the SERVER_PORT environment variable.',
    RANDOM_JWT_SECRET: 'No JWT secret provided, generating random secret for development environment.\nIf you want to specify a port JWT secret the JWT_SECRET environment variable.'
};


export const WEB_ERRORS = {
    LOGIN_FAILED: make(300, 'Wrong username or password'),
    SIGNUP_ERROR: make(310, 'Error creating new profile, please try again later'),
    UNAUTHORIZED_ACCESS: make(320, 'Unauthorized access'),
    INVALID_VERIFICATION_TOKEN: make(330, 'Invalid, expired or already verified token submitted'),
    MISSING_PSK: make(340, 'Cannot find Protected Symmetric KeyInvalid associated with the user'),
    SAVE_PSK_ERROR: make(350, 'Error saving new Protected Symmetric Key, please try again later'),
    DUPLICATE_PSK: make(360, 'A Protected Symmetric Key already exists for this user'),
    SYNTAX_BAD_REQUEST: (message: string): JSONResponse => make(600, message),
    EVERYTHING_IS_ON_FIRE: {
        code: 999,
        message: 'This is fine. Request in auth route with valid JWT and invalid user id'
    },
};


export const WEB_MESSAGES = {
    PSK_SAVED_SUCCESS: make(100, 'Protected Symmetric Key saved successfully'),
    VERIFICATION_TOKEN_SENT: (email: string): JSONResponse =>
        make(101, `A confirmation email was sent to '${email}'. Please check your inbox.`),
    PROFILE_VERIFIED: make(102, 'Profile verified successfully')
};


type JSONResponse = {
    code: number,
    message: string
}

function make(code: number, message: string): JSONResponse {
    return {
        code,
        message
    };
}
