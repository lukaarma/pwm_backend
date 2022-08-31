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
    MAILGUN_EU: 'Missing Mailgun EU!\nPlease use the MAILGUN_EU environment variable to specify the Mailgun EU!',
    SERVER_PORT_ISNAN: 'Server port parsing error!\nPlease use the SERVER_PORT environment variable to specify a valid server port!',
    SERVER_PORT_OUT_OF_RANGE: 'Server port out of range!\nThe server port must be a number between 1 and 65535. Please use the SERVER_PORT environment variable to specify a valid server port!'
};


export const LOG_WARN = {
    MISSING_NODE_ENV: "No environment information detected, Defaulting to 'development'!\nIf you are in a production environment che that your NODE_ENV environment variable is set correctly.",
    MISSING_SERVER_HOSTNAME: "No server hostname specified, using 'localhost'.\nIf you want to specify an hostname use the SERVER_HOSTNAME environment variable.",
    MISSING_SERVER_PORT: 'No server port specified, using 9001.\nIf you want to specify a port use the SERVER_PORT environment variable.',
    RANDOM_JWT_SECRET: 'No JWT secret provided, generating random secret for development environment.\nIf you want to specify a port JWT secret the JWT_SECRET environment variable.'
};


enum CODES {
    PSK_SAVED_SUCCESS = 100,
    VAULT_SAVED_SUCCESS,
    VERIFICATION_TOKEN_SENT = 110,
    PROFILE_VERIFIED = 120,
    VAULT_UPDATED = 130,

    LOGIN_FAILED = 300,
    SIGNUP_ERROR = 310,
    UNAUTHORIZED_ACCESS = 320,
    INVALID_VERIFICATION_TOKEN = 330,
    MISSING_PSK = 340,
    MISSING_VAULT,
    SAVE_PSK_ERROR = 350,
    SAVE_VAULT_ERROR,
    DUPLICATE_PSK = 360,
    DUPLICATE_VAULT,
    VAULT_LOWER_VERSION = 370,
    VAULT_OLDER_DATE,

    SYNTAX_BAD_REQUEST = 600,
    LOGIN_BAD_REQUEST,
    SIGNUP_BAD_REQUEST,
    UPDATE_PROFILE_BAD_REQUEST,
    SEND_VERIFICATION_BAD_REQUEST,
    VERIFY_TOKEN_BAD_REQUEST,
    PSK_BAD_REQUEST,
    VAULT_BAD_REQUEST
}


export const WEB_ERRORS = {
    LOGIN_FAILED: make(CODES.LOGIN_FAILED, 'Wrong username or password'),
    SIGNUP_ERROR: make(CODES.SIGNUP_ERROR, 'Error creating new profile, please try again later'),
    UNAUTHORIZED_ACCESS: make(CODES.UNAUTHORIZED_ACCESS, 'Unauthorized access'),
    INVALID_VERIFICATION_TOKEN: make(CODES.INVALID_VERIFICATION_TOKEN, 'Invalid, expired or already verified token submitted'),
    MISSING_PSK: make(CODES.MISSING_PSK, 'Cannot find Protected Symmetric Key associated with the user'),
    MISSING_VAULT: make(CODES.MISSING_VAULT, 'Cannot find Vault associated with the user'),
    SAVE_PSK_ERROR: make(CODES.SAVE_PSK_ERROR, 'Error saving new Protected Symmetric Key, please try again later'),
    SAVE_VAULT_ERROR: make(CODES.SAVE_VAULT_ERROR, 'Error saving new Vault, please try again later'),
    DUPLICATE_PSK: make(CODES.DUPLICATE_PSK, 'A Protected Symmetric Key already exists for this user'),
    DUPLICATE_VAULT: make(CODES.DUPLICATE_VAULT, 'A Vault already exists for this user, please use put method to update vault'),
    VAULT_LOWER_VERSION: make(CODES.VAULT_LOWER_VERSION, 'Ignoring Vault update because of lower version number than existing vault'),
    VAULT_OLDER_DATE: make(CODES.VAULT_OLDER_DATE, 'Ignoring Vault update because of older last modified date than existing vault'),
    SYNTAX_BAD_REQUEST: (message: string): JSONResponse => make(CODES.SYNTAX_BAD_REQUEST, message),
    LOGIN_BAD_REQUEST: (message: string): JSONResponse => make(CODES.LOGIN_BAD_REQUEST, message),
    SIGNUP_BAD_REQUEST: (message: string): JSONResponse => make(CODES.SIGNUP_BAD_REQUEST, message),
    UPDATE_PROFILE_BAD_REQUEST: (message: string): JSONResponse => make(CODES.UPDATE_PROFILE_BAD_REQUEST, message),
    SEND_VERIFICATION_BAD_REQUEST: (message: string): JSONResponse => make(CODES.SEND_VERIFICATION_BAD_REQUEST, message),
    VERIFY_TOKEN_BAD_REQUEST: (message: string): JSONResponse => make(CODES.VERIFY_TOKEN_BAD_REQUEST, message),
    PSK_BAD_REQUEST: (message: string): JSONResponse => make(CODES.PSK_BAD_REQUEST, message),
    VAULT_BAD_REQUEST: (message: string): JSONResponse => make(CODES.VAULT_BAD_REQUEST, message),
    EVERYTHING_IS_ON_FIRE: make(999, 'This is fine. Request in auth route with valid JWT and invalid user id')
};


export const WEB_MESSAGES = {
    PSK_SAVED_SUCCESS: make(CODES.PSK_SAVED_SUCCESS, 'Protected Symmetric Key saved successfully'),
    VAULT_SAVED_SUCCESS: make(CODES.VAULT_SAVED_SUCCESS, 'Vault saved successfully'),
    VERIFICATION_TOKEN_SENT: (email: string): JSONResponse =>
        make(CODES.VERIFICATION_TOKEN_SENT, `A confirmation email was sent to '${email}'.\nPlease check your inbox.`),
    PROFILE_VERIFIED: make(CODES.PROFILE_VERIFIED, 'Profile verified successfully'),
    VAULT_UPDATED: make(CODES.VAULT_UPDATED, 'Vault updated successfully')
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
