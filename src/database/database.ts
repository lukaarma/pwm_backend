import fs from 'fs';
import mongoose from 'mongoose';
import logger from 'winston';

import { LOG_ERRORS } from '../utils/messages';


export async function initDatabase(): Promise<void> {
    // Check relevant env variables
    if (!process.env.MONGODB_SERVER) {
        logger.error(LOG_ERRORS.MISSING_MONGODB_SERVER);
        process.exit(1);
    }
    // We need a X509 certificate or username and password
    if (!process.env.MONGODB_X509 &&
        !(process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD)) {
        logger.error(LOG_ERRORS.MISSING_MONGODB_CREDENTIALS);
        process.exit(1);
    }
    if (!process.env.MONGODB_NAME) {
        logger.error(LOG_ERRORS.MISSING_MONGODB_NAME);
        process.exit(1);
    }

    let mongooseOptions: mongoose.ConnectOptions = {
        dbName: process.env.MONGODB_NAME
    };
    // Construct the connection authentication options based on env
    if (process.env.MONGODB_X509) {
        if (!fs.existsSync(process.env.MONGODB_X509)) {
            logger.error(LOG_ERRORS.INVALID_MONGODB_X509);
            process.exit(1);
        }

        mongooseOptions = {
            sslKey: process.env.MONGODB_X509,
            sslCert: process.env.MONGODB_X509,
            authMechanism: 'MONGODB-X509',
            dbName: process.env.MONGODB_NAME
        };

        logger.verbose('[DATABASE] Using X509 auth');
    }
    else {
        mongooseOptions = {
            auth: {
                username: process.env.DB_USER,
                password: process.env.DB_PASSWORD
            },
            dbName: process.env.MONGODB_NAME
        };

        logger.verbose('[DATABASE] Using user:pass auth');
    }


    logger.verbose('[DATABASE] Connecting to MongoDB database...');
    await mongoose.connect(process.env.MONGODB_SERVER, mongooseOptions);
    logger.verbose('[DATABASE] Connection established');
}
