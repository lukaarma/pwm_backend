import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import logger from 'winston';

import { initDatabase } from './database/database';
import JWTAuth from './middleware/JWTAuth';
import userRouter from './routers/userRouter';
import checkEnvironment from './utils/checkEnvironment';
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

const excludedRoutes = ['/api/user/login', '/api/user/signup', '/api/user/verify'];
if (process.env.NODE_ENV === 'development') {
    excludedRoutes.push('/api/echo');
}

logger.info('Installing middlewares...');
// middleware stack.
server.use(morgan('dev'));
server.use(express.json());
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
}

server.use('/api/user', userRouter);

logger.info('Server initialization done!');

server.listen(
    process.env.SERVER_PORT,
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
