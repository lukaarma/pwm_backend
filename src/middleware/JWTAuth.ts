import express from 'express';
import jwt from 'jsonwebtoken';
import logger from 'winston';

import { JwtInfo } from '../utils/types';
import { WEB_ERRORS } from '../utils/messages';

/* TODO:
    - move response messages in utils/message.ts
    - add redirect to login for frontend
*/
export default function (excludedPaths?: Array<string>):
    ((req: express.Request, res: express.Response, next: express.NextFunction) => void) {

    logger.verbose('[JWTAuth] excluded paths: ' + JSON.stringify(excludedPaths, null, 4));

    return (req, res, next): void => {
        if (excludedPaths?.some((path) => req.path.startsWith(path))) {
            logger.debug(`[JWTAuth] excluded path used '${req.path}'`);

            return next();
        }
        else if (req.headers.authorization) {
            try {
                req.jwtInfo = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET) as JwtInfo;
                logger.debug(`[JWTAuth] verified JWT token on path '${req.path}'`);

                return next();
            }
            catch {
                logger.debug(`[JWTAuth] invalid JWT token on path '${req.path}'`);
            }
        }
        else {
            logger.debug(`[JWTAuth] missing JWT token on path '${req.path}'`);
        }

        res.status(401).json(WEB_ERRORS.UNAUTHORIZED_ACCESS);
    };
}
