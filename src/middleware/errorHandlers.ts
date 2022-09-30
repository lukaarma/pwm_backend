import express from 'express';
import logger from 'winston';

import { WEB_ERRORS } from '../utils/messages';




export function expressJSONErrorHandler(): express.ErrorRequestHandler {
    return (err, _, res, next) => {
        if (err instanceof SyntaxError) {
            logger.error('[JSON ERROR] JSON Payload bad syntax');

            return res.status(400).send(WEB_ERRORS.SYNTAX_BAD_REQUEST(err.message));
        }
        else if (err instanceof Error && err.name === 'PayloadTooLargeError' && err.length) {
            logger.error('[JSON ERROR] JSON Payload too large');

            return res.status(400).send(WEB_ERRORS.JSON_PAYLOAD_TOO_LARGE(process.env.MAXIMUM_JSON_SIZE, err.length));
        }
        else {
            logger.debug({ message: err as Error });

            next();
        }
    };
}

export function genericErrorHandler(): express.ErrorRequestHandler {
    return (err, _, res, next) => {
        if (err instanceof Error) {
            logger.error({ message: err });

            res.status(500).send(WEB_ERRORS.UNCAUGHT_EXCEPTION);
        }
        else {
            logger.error(err);
        }

        next();
    };
}
