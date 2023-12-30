'use strict';
const mung = require('express-mung');

/* Convert null json to empty document {} */
function redact(body, req, res) {
    if (res.tokens) {
        body.tokens = res.tokens;
    }
    return body;
}

module.exports = mung.json(redact);
