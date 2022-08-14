import chalk from 'chalk';
import winston from 'winston';


const levels = ['debug', 'verbose', 'info', 'warn', 'error'];

export function initLogger(): void {

    // We leave the default info level except if LOG_LEVEL set or if dev enviroment
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
            winston.format.printf(
                (item: winston.Logform.TransformableInfo) => customLogPrint(item)
            )
        )
    }));

    // File transports based on enviroment:
    // PRODUCTION => Errors only, never deleted
    // DEFAULT DEVELOPMENT => Every message logged, wiped every run
    if (process.env.NODE_ENV === 'production') {
        winston.add(new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.json()
        }));
    }
    else {
        winston.add(new winston.transports.File({
            filename: 'logs/debug.log',
            level: 'debug',
            format: winston.format.json(),
            options: {
                flags: 'w'
            }
        }));
    }
}


function customLogPrint(info: winston.Logform.TransformableInfo): string {
    switch (info.level) {
        case 'error': {
            if (info.fatal) {
                return `${chalk.red('\n\n[FATAL ERROR]')} ${info.stack ?? info.message ?? 'NO ERROR INFO'}`;
            }

            return `${chalk.red('\n[ERROR]')} ${info.stack ?? info.message ?? 'NO ERROR INFO'}\n`;
        }
        case 'warn': {
            return `${chalk.yellow('[WARNING]')} ${info.stack ?? info.message ?? 'NO WARNING INFO'}`;
        }
        case 'info': {
            return `${chalk.green('[INFO]')} ${info.message}`;
        }
        case 'verbose': {
            return `${chalk.cyan('[VERBOSE]')} ${info.message}`;
        }
        case 'debug': {
            return `${chalk.magenta('[DEBUG]')} ${info.message}`;
        }
        default: {
            return chalk.red('\n[ERROR] Invalid log level!\n');
        }
    }
}
