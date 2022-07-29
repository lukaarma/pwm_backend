# backend of PWM (PassWordManager), Project by [lukaarma] and [Lorenzo Romio]

PWM is a simple passwor manager website that encrypts locally yours credentials and syncs them accros all your devices.

## Available enviroment variables

| Variable name  | Possible values | Description |
| -------------- | ---------------- | ----------- |
| NODE_ENV  | 'production', 'development'  | Set the enviroment in which the server will be deployed. Development will enable more detailed logs.  |
| LOG_LEVEL  | 'debug', 'verbose', 'info', 'warn', 'error'  | Set the console log level, log files are unaffected.  |
| MONGODB_SERVER | String | Set the server url of a MongoDB instance |
| MONGODB_USERNAME | String | Set the username used to login in the MongoDB instance |
| MONGODB_PASSWORD | String | Set the password used to login in the MongoDB instance |
| MONGODB_X509 | String | Set the path to the X509 cer used to login in the MongoDB instance |
| MONGODB_NAME | String | Set the MongoDB database to use |

[lukaarma]: https://github.com/lukaarma
[Lorenzo Romio]: https://github.com/lorenzoromio
