import fs from 'fs';
import mongoose from 'mongoose';
import logger from 'winston';

import { LOG_ERRORS } from '../utils/messages';


export async function initDatabase(): Promise<void> {
    let mongooseOptions: mongoose.ConnectOptions;

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
