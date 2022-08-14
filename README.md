# backend of PWM (PassWordManager), Project by [lukaarma] and [Lorenzo Romio]

PWM is a simple password manager website that encrypts locally your credentials and syncs them accros all your devices.

## Available enviroment variables

### General options

| Variable name  | Possible values | Default | Required | Description |
| -------------- | --------------- | ----- | :------: | ----------- |
| NODE_ENV  | 'production', 'development' | 'development' | ❌ | Set the enviroment in which the server will be deployed.<br> Development will enable more detailed logs. |
| LOG_LEVEL  | 'debug', 'verbose', 'info', 'warn', 'error' | 'info' or 'verbose' | ❌ | Set the console log level, log files are unaffected. Default 'info' in production, 'verbose' in development |
| JWT_SECRET | String | undefined | ❔ | Set the JWT secret for the bearer tokens.<br> ❔ This is required only in production |

### Server options

| Variable name  | Possible values | Default | Required | Description |
| -------------- | --------------- | ----- | :------: | ----------- |
| SERVER_HOSTNAME | String | undefined | ❌ | Set the hostname of the server or of the proxy in front of it. Used for CORS. |
| SERVER_PORT | 1 - 65535 | 9001 | ❌ | Set the port on which the server will listen. |
| SERVER_REVERSE_PROXY | Boolean | false | ❌ | Set if the server sits behind a reverse proxy so that the correct remote client information can be extracted from the connection. |

### Database options

| Variable name  | Possible values | Default | Required | Description |
| -------------- | --------------- | ----- | :------: | ----------- |
| MONGODB_SERVER | String | undefined | ✅ | Set the server url of a MongoDB instance |
| MONGODB_USERNAME | String | undefined | ❔ | Set the username used to login in the MongoDB instance.<br> ❔ This is required if MONGODB_X509 is not defined |
| MONGODB_PASSWORD | String | undefined | ❔ | Set the password used to login in the MongoDB instance.<br> ❔ This is required if MONGODB_X509 is not defined |
| MONGODB_X509 | String | undefined | ❔ | Set the path to the X509 cer used to login in the MongoDB instance.<br> ❔ This is required if MONGODB_USERNAME and MONGODB_PASSWORD are not defined |
| MONGODB_NAME | String | undefined | ✅ | Set the MongoDB database to use |

### Mailgun options

| Variable name  | Possible values | Default | Required | Description |
| -------------- | --------------- | ----- | :------: | ----------- |
| MAILGUN_DOMAIN | String | undefined | ✅ | Set the domain used by Mailgun to send emails from |
| MAILGUN_USERNAME | String | undefined | ✅ | Set the Mailgun API username |
| MAILGUN_PASSWORD | String | undefined | ✅ | Set the Mailgun API password |
| MAILGUN_EU | Boolean | false | ❌ | Set if the Mailgun domain resides in Europe |

[lukaarma]: https://github.com/lukaarma
[Lorenzo Romio]: https://github.com/lorenzoromio
