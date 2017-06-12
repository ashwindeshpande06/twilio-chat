var twiliochat = require('twilio-chat');
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
        isCustomer: options.isCustomer || true
    };

    if (!this.configs.chatContainer && !this.configs.isCustomer) {
        return;
    }

    //console.log(this);
    this.chattoken = null;

    this.ee = new EventEmitter();

    //console.log(this);

    //Call bind to get the class context on the even emitter function scope
    this.init = this.init.bind(this);
    this.Hi = this.Hi.bind(this);
    this.createDOM = this.createDOM.bind(this);
    this.ee.addListener('chattoken', this.init);
    this.ee.addListener('createDOM', this.createDOM);

    this.getChatToken();
}

webchat.prototype.Hi = function () {
    console.log(this);
    console.log(this.configs.device);
    console.log("Hi");
};

webchat.prototype.getChatToken = function () {
    this.xhrPromiseFunc();
};

webchat.prototype.xhrPromiseFunc = function () {
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
            //console.log(self.ee);
            self.ee.emitEvent('chattoken', [results.responseText.token]);
        })
        .catch(function (e) {
            console.error(e);

            // ...
        });
};

webchat.prototype.init = function (token) {
    var self = this;
    console.log(token);
    self.chattoken = token;

    var chatClient = self.getChatClient(token);

    if (chatClient && self.configs.isCustomer) {
        console.log(chatClient);
        self.ee.emitEvent('createDOM');
        self.channelUtility = new channelUtility(chatClient, this.DOMObj, self.configs.identity, self.configs.attributes);

        chatClient.initialize().then(function () {
            console.log("Customer Initialized");
            self.channelUtility.setupChannel().then(function (channel) {
                self.channelUtility.joinChannel(channel).then(function (channel) {
                    self.channelUtility.initChannelEvent(channel);
                    self.DOMObj.notify('Chat channel has been created and ready');
                });
            });
        }).catch(function (error) {

        });
    }

};

webchat.prototype.createDOM = function () {

    this.DOMObj = new DOMCreation(this.configs.chatContainer, this.configs.chatTitle);
    var chatHeader = this.DOMObj.createHeader();
    var chatBody = this.DOMObj.createBody();
    var chatFooter = this.DOMObj.createFooter();

    this.DOMObj.appendAll(chatHeader, chatBody, chatFooter);
};

webchat.prototype.getChatClient = function (token) {
    try {
        return new twiliochat.Client(token);
    }
    catch (e) {
        return;
    }

};

exports.webchat = webchat;
