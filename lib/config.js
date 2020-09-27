const environments = {}

environments.staging = {
    'httpPort'  : 4000,
    'httpsPort' : 4001,
    'envName'   : 'staging'
};

environments.production = {
    'httpPort'  : 5000,
    'httpsPort' : 5001,
    'envName'   : 'production'
}

const currentEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : '';

const envToExport = typeof environments[currentEnv] === 'object' ? environments[currentEnv] : environments.staging;

module.exports = envToExport;