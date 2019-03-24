const stringKeys = ['algorithm', 'hash'];

function configSerialize(config) {
    const newConfig = {...config};
    for (let key in newConfig) {
        if (!stringKeys.includes(key) && newConfig[key] instanceof Buffer) {
            newConfig[key] = newConfig[key].toString('hex');
        }
    }
    const json = JSON.stringify(newConfig);
    // Change encoding for more secure header
    const base64 = Buffer.from(json, 'utf8').toString('base64');
    return base64;
}

function configDeserialize(text) {
    const utf8 = Buffer.from(text, 'base64').toString('utf8');
    const config = JSON.parse(utf8);
    for (let key in config) {
        if (!stringKeys.includes(key)) {
            config[key] = Buffer.from(config[key], 'hex')
        }
    }
    return config;
}

module.exports = {
    configSerialize,
    configDeserialize,
};