import express from 'express';
import jwt from 'jsonwebtoken';
import logger from 'winston';

import { JwtInfo } from '../utils/types';
import { WEB_ERRORS } from '../utils/messages';

/* TODO:
    - move response messages in utils/message.ts
    - add redirect to login for frontend
*/
export default function (exludedPaths?: Array<string>):
    ((req: express.Request, res: express.Response, next: express.NextFunction) => void) {

    logger.verbose('[JWTauth] excluded paths: ' + JSON.stringify(exludedPaths, null, 4));

    return (req, res, next): void => {
        if (exludedPaths?.some((path) => req.path.startsWith(path))) {
            logger.debug(`[JWTauth] excluded path used '${req.path}'`);

            return next();
        }
        else if (req.headers.authorization) {
            try {
                // NOTE: already checked during initialization
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                req.jwtInfo = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET!) as JwtInfo;
                logger.debug(`[JWTauth] verified JWT token on path '${req.path}'`);

                return next();
            }
            catch {
                logger.debug(`[JWTauth] invalid JWT token on path '${req.path}'`);
            }
        }
        else {
            logger.debug(`[JWTauth] missing JWT token on path '${req.path}'`);
        }

        res.status(401).json(WEB_ERRORS.UNAUTHARIZED_ACCESS);
    };
}
