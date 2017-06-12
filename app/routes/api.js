const tokenController = require('../controllers/token');
const taskController = require('../controllers/task');

module.exports = function (app, express) {

    var api = express.Router();

    //Token Router 
    api.post('/chattoken', function (req, res) {
        var deviceId = req.body.device;
        var identity = req.body.identity;
        //console.log(identity);
        var token = tokenController.generate(identity, deviceId);
        res.json({
            identity: identity,
            token: token.toJwt(),
        });
    });

    api.post('/workertoken', function (req, res) {
        var sid = req.body.sid;
        var workerToken = tokenController.generateworker(sid);
        console.log(workerToken);
        res.json({
            token: workerToken.toJwt()
        });
    });

    api.get('/chat/webhooks', function (req, res) {
        console.log(req.query);
        console.log('/chat/webhooks triggered');
        const taskobj = {
            'channelSid': req.query.ChannelSid,
            'attributes': req.query.Attributes,
            'identity': req.query.ClientIdentity,
        };
        if (req.query.EventType === 'onChannelAdded') {
            console.log('Inside onChannelAdded');
            taskController.createTaskForChat(taskobj);
        }
        res.status(200).send();
    });

    return api;
};
