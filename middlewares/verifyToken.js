var jwt = require('jsonwebtoken');
var envConfig = require('../config').envConfig;

module.exports = {
    veriftToken: (req, res, next) => {
        var token = req.headers['x-access-token'];

        if (!token) {
            return res.status(403).send({
                auth: false,
                message: 'No token provided.'
            });
        }
        jwt.verify(token, envConfig.jwtSecret, (err, decoded) => {
            if (err) {
                return res.status(500).send({
                    auth: false,
                    message: 'Fail to Authentication. Error -> ' + err
                });
            }
            req.userId = decoded.id;
            next();
        });
    }
}