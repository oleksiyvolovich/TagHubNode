# About
TagHub API

# Setup
Type below commands to install all required project dependencies
```bash
$ npm install pm2 -g
$ npm install
$ export NODE_ENV=local
```
Variable NODE_ENV should be defined for your server. Possible values are: local, dev (prod)
## Config
Database config should be set in `config/db.js`, for your environment, example:

```json
{
    "local": {
        "username": "{YOUR_USERNAME}",
        "password": "{YOUR_PASSWORD}",
        "name": "{YOUR_DATABASE_NAME}",
        "host": "localhost",
    }
}
```

## Execution for local environment
```bash
$ pm2-dev ecosystem-local.json
```
## Execution for dev(production) environment
```bash
$ pm2 start ecosystem.json
```
