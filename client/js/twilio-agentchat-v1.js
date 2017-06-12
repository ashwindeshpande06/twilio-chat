//var twilio = require('twilio').TaskRouter;

var twiliochat = require('twilio-chat');
//var taskrouter = require('twilio-taskrouter-js');
var XMLHttpRequestPromise = require('xhr-promise');
var EventEmitter = require('wolfy87-eventemitter');
var channelUtility = require('./channel-utility');
var DOMCreation = require('./dom-creation');

function webchat(options) {
    this.configs = {
        device: options.device || 'windows',
        identity: options.identity || 'Anonymous',
        attributes: options.attributes || {},
        chatContainer: options.chatContainer,
        chatTitle: options.chatTitle || 'TwiWebChat',
        isCustomer: options.isCustomer || false,
        sid: 'WKbbe86c57ce549f70cc3f0cf6f4a2f673'
    };

    if (!this.configs.chatContainer) {
        return;
    }

    //console.log(this);
    this.chattoken = null;
    this.workertoken = null;
    this.channelSid = null;
    this.chatClient = null;

    this.ee = new EventEmitter();

    //console.log(this);

    //Call bind to get the class context on the even emitter function scope
    this.init = this.init.bind(this);
    this.initChatClient = this.initChatClient.bind(this);
    this.initWorkerClient = this.initWorkerClient.bind(this);
    this.createDOM = this.createDOM.bind(this);
    this.ee.addListener('chatclient', this.initChatClient);
    this.ee.addListener('workerclient', this.initWorkerClient);
    this.ee.addListener('createDOM', this.createDOM);
    this.ee.addListener('init', this.init);
    // this.getChatToken();

    this.ee.emitEvent('init');
}

webchat.prototype.getChatToken = function () {
    var self = this;
    var xhrPromise = new XMLHttpRequestPromise();

    var data = {
        'device': self.configs.device,
        'identity': self.configs.identity
    };

    xhrPromise.send({
            method: 'POST',
            url: '/api/chattoken',
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(function (results) {
            if (results.status !== 200) {
                throw new Error('request failed');
            }
            console.log(results.responseText.token);
            self.chattoken = results.responseText.token;
        })
        .catch(function (e) {
            console.error(e);
        });
};

webchat.prototype.getWorkerToken = function () {
    var self = this;
    var xhrPromise = new XMLHttpRequestPromise();

    var data = {
        'sid': self.configs.sid
    };

    xhrPromise.send({
            method: 'POST',
            url: '/api/workertoken',
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(function (results) {
            if (results.status !== 200) {
                throw new Error('request failed');
            }
            console.log(results);
            self.workertoken = results.responseText.token
                //self.getWorkerClient(results.responseText.token);
                //console.log(self.ee);
            self.ee.emitEvent('workerclient', [results.responseText.token]);
        })
        .catch(function (e) {
            console.error(e);
        });
};

webchat.prototype.init = function () {
    var self = this;

    self.getChatToken();
    self.getWorkerToken();
    self.ee.emitEvent('createDOM');

};

webchat.prototype.createDOM = function () {

    this.DOMObj = new DOMCreation(this.configs.chatContainer, this.configs.chatTitle);
    var chatHeader = this.DOMObj.createHeader();
    var chatBody = this.DOMObj.createBody();
    var chatFooter = this.DOMObj.createFooter();

    this.DOMObj.appendAll(chatHeader, chatBody, chatFooter);
};


webchat.prototype.getChatClient = function (token) {
    var self = this;
    try {
        if (self.chatClient) {
            return self.chatClient;
        }
        else {
            self.chatClient = new twiliochat.Client(token);
            return self.chatClient
        }

    }
    catch (e) {
        return;
    }

};

webchat.prototype.initChatClient = function () {
    var self = this;
    var chatClient = self.getChatClient(self.chattoken);
    if (chatClient) {
        //console.log(this.chatClient);
        self.channelUtility = new channelUtility(chatClient, self.DOMObj, self.configs.identity, self.configs.attributes);

        chatClient.initialize().then(function () {
            console.log("Agent Initialized");
            self.channelUtility.getChannelBySid(self.channelSid).then(function (channel) {
                console.log(channel);
                self.channelUtility.joinChannel(channel).then(function (channel) {
                    console.log(channel);
                    //self.DOMObj.addEventListenerToSendBtn(self.channelUtility.sendMessage.bind(self));
                    self.channelUtility.initChannelEvent(channel);
                });
            });

        }).catch(function (error) {

        });
    }
};


// Worker Functionality
webchat.prototype.getWorkerClient = function (token) {
    //var self = this;
    try {

        var workerClient = new window.Twilio.TaskRouter.Worker(token);
        console.dir(workerClient);
        return workerClient;
    }
    catch (e) {
        return;
    }
};

webchat.prototype.initWorkerClient = function (token) {
    var workerClient = this.getWorkerClient(token);
    this.initWorkerEvents(workerClient);
};

webchat.prototype.initWorkerEvents = function (workerClient) {
    var self = this;
    if (!workerClient) {
        console.log('Error in workerClient');
        return;
    }

    workerClient.on('ready', function (worker) {
        console.log('worker is ready');
        console.log(worker);
    });

    workerClient.on('activity.update', function (worker) {
        console.log('activity updated');
    });

    workerClient.on('reservation.accepted', function (reservation) {
        console.log(reservation.task.attributes) // {foo: 'bar', baz: 'bang' }
        console.log(reservation.task.priority) // 1
        console.log(reservation.task.age) // 300
        console.log(reservation.task.sid) // WTxxx
        console.log(reservation.sid) // WRxxx        
    });

    workerClient.on('reservation.created', function (reservation) {
        console.log(reservation);
        console.log('Inside Reservation created');
        //var self = this;
        if (self.DOMObj) {
            self.DOMObj.notify('Chat Task has been assigned to you. Please accept or reject');
        }

        console.log(reservation.task.attributes.channelSid);
        self.channelSid = reservation.task.attributes.channelSid;
        //self.ee.emit('chatclient');
        self.ee.emitEvent('chatclient');
    });
};

exports.webchat = webchat;
