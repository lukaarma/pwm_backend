import logger from 'winston';
import crypto from 'crypto';

import { LOG_ERRORS, LOG_WARN } from '../utils/messages';

export default function checkEnviroment(): void {
    const availableVars = ['NODE_ENV', 'LOG_LEVEL', 'SERVER_HOSTNAME', 'SERVER_PORT', 'SERVER_REVERSE_PROXY', 'MONGODB_SERVER', 'MONGODB_USERNAME', 'MONGODB_X509', 'MONGODB_NAME', 'MAILGUN_DOMAIN', 'MAILGUN_USERNAME', 'MAILGUN_EU'];
    let fatal = false;

    for (const env of availableVars) {
        logger.debug(`${env} = ${process.env[env] ?? 'undefined'}`);
    }

    // Check General Env
    if (!process.env.NODE_ENV) {
        logger.warn(LOG_WARN.MISSING_NODE_ENV);
        process.env.NODE_ENV = 'development';
    }

    if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'development') {
        logger.warn(LOG_WARN.RANDOM_JWT_SECRET);
        process.env.JWT_SECRET = crypto.randomBytes(256).toString('hex');
    }
    else if (!process.env.JWT_SECRET) {
        logger.error(LOG_ERRORS.MISSING_JWT_SECRET);
        fatal = true;
    }

    // Check Server Env
    if (!process.env.SERVER_HOSTNAME && process.env.NODE_ENV === 'development') {
        logger.warn(LOG_WARN.MISSING_SERVER_HOSTNAME);
        process.env.SERVER_HOSTNAME = 'localhost';
    }
    else if (!process.env.SERVER_HOSTNAME) {
        logger.error(LOG_ERRORS.MISSING_SERVER_HOSTNAME);
        fatal = true;
    }

    if (process.env.SERVER_PORT) {
        // toString not really needed, used to calm Typescript
        const port = parseInt(process.env.SERVER_PORT.toString());

        if (isNaN(port)) {
            logger.error(LOG_ERRORS.SERVER_PORT_ISNAN);
            fatal = true;
        }
        else if (port < 1 || port > 65535) {
            logger.error(LOG_ERRORS.SERVER_PORT_OUT_OF_RANGE);
            fatal = true;
        }
        else {
            process.env.SERVER_PORT = port;
        }
    }
    else if (!process.env.SERVER_PORT) {
        logger.warn(LOG_WARN.MISSING_SERVER_PORT);
        process.env.SERVER_PORT = 9001;
    }

    // Check Database Env
    if (!process.env.MONGODB_SERVER) {
        logger.error(LOG_ERRORS.MISSING_MONGODB_SERVER);
        fatal = true;
    }
    // We need a X509 certificate or username and password
    if (!process.env.MONGODB_X509 &&
        !(process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD)) {
        logger.error(LOG_ERRORS.MISSING_MONGODB_CREDENTIALS);
        fatal = true;
    }
    if (!process.env.MONGODB_NAME) {
        logger.error(LOG_ERRORS.MISSING_MONGODB_NAME);
        fatal = true;
    }

    // Check Mailgun Env
    if (!process.env.MAILGUN_DOMAIN) {
        logger.error(LOG_ERRORS.MISSING_MAILGUN_DOMAIN);
        fatal = true;
    }
    if (!process.env.MAILGUN_USERNAME) {
        logger.error(LOG_ERRORS.MISSING_MAILGUN_USERNAME);
        fatal = true;
    }
    if (!process.env.MAILGUN_PASSWORD) {
        logger.error(LOG_ERRORS.MISSING_MAILGUN_PASSWORD);
        fatal = true;
    }
    if (!process.env.MAILGUN_EU) {
        logger.error(LOG_ERRORS.MAILGUN_EU);
        fatal = true;
    }

    // This is fine.
    if (fatal) {
        process.exit(1);
    }
}
