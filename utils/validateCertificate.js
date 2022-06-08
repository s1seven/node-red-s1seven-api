module.exports = function validateCertificate(certificate) {
    if (Buffer.isBuffer(certificate)) {
        return JSON.parse(certificate);
    } else if (typeof certificate === 'object') {
        return certificate;
    } else if (typeof certificate === 'string') {
        return JSON.parse(certificate);
    } else {
        throw new Error('Please add a valid certificate');
    }
};
