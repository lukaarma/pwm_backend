import chalk from 'chalk';
import winston from 'winston';


const levels = ['debug', 'verbose', 'info', 'warn', 'error'];

export function initLogger(): void {

    // We leave the default info level except if LOG_LEVEL set or if dev environment
    if (process.env.LOG_LEVEL && levels.includes(process.env.LOG_LEVEL)) {
        winston.level = process.env.LOG_LEVEL;
    }
    else if (process.env.NODE_ENV !== 'production') {
        winston.level = 'verbose';
    }

    // Console transport always present, log based on
    winston.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.errors({ stack: true }),
            winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss' }),
            winston.format.printf((item) => customLogPrint(item))
        )
    }));

    // File transports based on environment:
    // PRODUCTION => Errors only, never deleted
    // DEFAULT DEVELOPMENT => Every message logged, wiped every run
    if (process.env.NODE_ENV === 'production') {
        winston.add(new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.combine(
                winston.format.errors({ stack: true }),
                winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss' }),
                winston.format.printf((item) => customFileFormat(item))
            ),
        }));
    }
    else {
        winston.add(new winston.transports.File({
            filename: 'logs/debug.log',
            level: 'debug',
            format: winston.format.combine(
                winston.format.errors({ stack: true }),
                winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss' }),
                winston.format.printf((item) => customFileFormat(item))
            ),
            options: {
                flags: 'w'
            }
        }));
    }
}


function customLogPrint(info: winston.Logform.TransformableInfo): string {
    let message = '';
    if (info.timestamp && typeof info.timestamp === 'string') {
        message += info.timestamp + ' ';
    }

    switch (info.level) {
        case 'error': {
            if (info.fatal) {
                return message + `${chalk.red('\n[FATAL ERROR]')} ${info.stack ?? info.message ?? 'NO ERROR INFO'}`;
            }

            return message + `${chalk.red('\n[ERROR]'.padEnd(9))} ${info.stack ?? info.message ?? 'NO ERROR INFO'}`;
        }
        case 'warn': {
            return message + `${chalk.yellow('[WARNING]'.padEnd(9))} ${info.stack ?? info.message ?? 'NO WARNING INFO'}`;
        }
        case 'info': {
            return message + `${chalk.green('[INFO]'.padEnd(9))} ${info.message}`;
        }
        case 'verbose': {
            return message + `${chalk.cyan('[VERBOSE]'.padEnd(9))} ${info.message}`;
        }
        case 'debug': {
            return message + `${chalk.magenta('[DEBUG]'.padEnd(9))} ${info.message}`;
        }
        default: {
            return chalk.red('\n[ERROR] Invalid log level!\n');
        }
    }
}


function customFileFormat(info: winston.Logform.TransformableInfo): string {
    let message = '';

    if (info.timestamp && typeof info.timestamp === 'string') {
        message += info.timestamp + ' ';
    }

    // longest label, excluded FATAL, is 9
    message += `[${info.level.toUpperCase()}]`.padEnd(9) + ' ';

    message += info.stack ?? info.message;

    return message;
}
