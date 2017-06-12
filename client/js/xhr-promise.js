var XMLHttpRequestPromise = require('xhr-promise');

function xhrPromiseFunc(device, identity) {
    var xhrPromise = new XMLHttpRequestPromise();

    var data = {
        device: device,
        identity: identity
    };

    xhrPromise.send({
            method: 'POST',
            url: '/api/chattoken',
            data: JSON.stringify(data)
        })
        .then(function (results) {
            if (results.status !== 200) {
                throw new Error('request failed');
            }
            console.log(results.responseText);

        })
        .catch(function (e) {
            console.error('XHR error');
            return e;
            // ...
        });


}
exports.xhrPromiseFunc = xhrPromiseFunc;
