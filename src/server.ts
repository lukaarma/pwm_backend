import crypto from 'crypto';
import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import logger from 'winston';

import { initDatabase } from './database/database';
import JWTAuth from './middleware/JWTAuth';
import userRouter from './routers/userRouter';
import { LOG_WARN, LOG_ERRORS } from './utils/messages';
import { initLogger } from './utils/logger';


/*
TODO:
    - cors, CORS library (@types/cors)
    - helmet, collection of headers to enhance security
    - express-mongo-sanitize, sanitize mongodb input to prevent query injection
    - JWT authorization logic!
    - user input XSS sanitization
    - fronted router
*/
const envVars = ['NODE_ENV', 'LOG_LEVEL', 'SERVER_HOSTNAME', 'SERVER_PORT', 'SERVER_REVERSE_PROXY', 'MONGODB_SERVER', 'MONGODB_USERNAME', 'MONGODB_PASSWORD', 'MONGODB_X509', 'MONGODB_NAME'];

// first of all init logger to create transports
initLogger();
// list expected ENV for debug
for (const env of envVars) {
    logger.debug(`${env} = ${process.env[env] ?? 'undefined'}`);
}

// check
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
}

logger.info('Initalizing database...');
await initDatabase();
logger.info('Database connection initialized! Initializing server...');

const server = express();
// check env
if (!process.env.SERVER_HOSTNAME) {
    logger.warn(LOG_WARN.MISSING_SERVER_HOSTNAME);
    process.env.SERVER_HOSTNAME = 'localhost';
}
if (!process.env.SERVER_PORT) {
    logger.warn(LOG_WARN.MISSING_SERVER_PORT);
    process.env.SERVER_PORT = '9001';
}
if (process.env.SERVER_REVERSE_PROXY) {
    logger.verbose('Reverse proxy support enabled.');
    server.set('trust proxy', true);
}

logger.info('Installing middlewares...');
// middleware stack.
server.use(morgan('dev'));
server.use(express.json());
server.use(JWTAuth(['/api/user/login', '/api/user/signup']));

logger.info('Installing routers...');
// echo development endpoint
if (process.env.NODE_ENV === 'development') {
    server.use('/api/echo', (req: express.Request, res: express.Response): void => {
        const message = '[ECHO] \n' +
            ' **HEADERS** \n' +
            JSON.stringify(req.headers, null, 4) + '\n' +
            ' **BODY** \n' +
            JSON.stringify(req.body, null, 4);
        logger.debug(message);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        res.status(200).json({ headers: req.headers, body: req.body });
    });
}

server.use('/api/user', userRouter);

logger.info('Server initialization done!');

server.listen(
    parseInt(process.env.SERVER_PORT),
    () => {
        if (process.env.SERVER_REVERSE_PROXY) {
            // NOTE: false positive, already checked existance
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            logger.info(`Listening on 'https://${process.env.SERVER_HOSTNAME}'\n`);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            logger.info(`Listening on 'http://${process.env.SERVER_HOSTNAME}:${process.env.SERVER_PORT}'\n`);
        }
    }
);
