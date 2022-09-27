import express from 'express';
import logger from 'winston';

import { WEB_ERRORS } from '../utils/messages';


export function expressJSONErrorHandler(): express.ErrorRequestHandler {
    return (err, _, res, next) => {
        if (err instanceof SyntaxError) {
            logger.error({ message: err });

            res.status(400).send(WEB_ERRORS.SYNTAX_BAD_REQUEST(err.message));
        }

        next();
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
