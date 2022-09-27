import connectHistoryApiFallback from 'connect-history-api-fallback';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from 'winston';

import { initDatabase } from './database/database';
import { expressJSONErrorHandler, genericErrorHandler } from './middleware/errorHandlers';
import JWTAuth from './middleware/JWTAuth';
import userRouter from './routers/userRouter';
import vaultRouter from './routers/vaultRouter';
import checkEnvironment from './utils/checkEnvironment';
import { initLogger } from './utils/logger';


// TODO: customize helmet CSP with nonces
// TODO: check all HTTP codes

// first of all init logger to create transports
initLogger();

// Check and initialize relevant env variables
checkEnvironment();

logger.info('Initializing database...');
await initDatabase();
logger.info('Database connection initialized! Initializing server...');

const server = express();

if (process.env.SERVER_REVERSE_PROXY) {
    logger.verbose('Reverse proxy support enabled.');
    server.set('trust proxy', true);
}

const excludedRoutes = [
    // webApp
    '/home',
    '/login',
    '/signup',
    '/assets',
    '/sendVerification',
    '/favicon.ico',
    // API
    '/api/user/login',
    '/api/user/signup',
    '/api/user/verify',
    '/api/user/sendVerification',
];
if (process.env.NODE_ENV === 'development') {
    excludedRoutes.push('/api/echo', '/api/aesTools', '/api/log');
}

logger.info('Installing middleware ...');
// middleware stack.
server.use(morgan('dev'));
server.use(cors({ origin: process.env.SERVER_HOSTNAME }));
server.use(helmet());
server.use(express.json());
server.use(expressJSONErrorHandler());
server.use(JWTAuth(excludedRoutes));

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

    server.use('/api/log', (_, res: express.Response): void => {
        logger.debug('Sending debug log to client');

        res.sendFile(path.join(
            path.dirname(fileURLToPath(import.meta.url)),
            '../logs/debug.log')
        );
    });

    server.use('/api/aesTools', express.static(
        path.join(
            path.dirname(fileURLToPath(import.meta.url)),
            '../public'
        )
    ));
}

server.use('/api/user', userRouter);
server.use('/api/vault', vaultRouter);

// FIXME: hardcoded folders
if (process.env.NODE_ENV === 'production') {
    server.use(connectHistoryApiFallback());

    server.use('/', express.static(
        path.join(
            path.dirname(fileURLToPath(import.meta.url)),
            '../../pwm_frontend/dist'
        ),
        { index: ['index.html'] }
    ));
}

server.use(genericErrorHandler());

logger.info('Server initialization done!');

server.listen(
    process.env.SERVER_PORT,
    () => {
        if (process.env.SERVER_REVERSE_PROXY) {
            logger.info(`Listening on 'https://${process.env.SERVER_HOSTNAME}'\n`);
        }
        else {
            logger.info(`Listening on 'http://${process.env.SERVER_HOSTNAME}:${process.env.SERVER_PORT}'\n`);
        }
    }
);
