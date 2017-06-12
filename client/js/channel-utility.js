var RSVP = require('rsvp');

function channelUtility(client, DOMObj, identity, attributes) {
    this.client = client;
    this.uniqueName = identity;
    this.friendlyName = 'channel ' + identity;
    this.attributes = attributes || {};
    this.channel = null;
    this.DOMObj = DOMObj;

    this.notifyMemberJoined = this.notifyMemberJoined.bind(this);
    this.showTypingStarted = this.showTypingStarted.bind(this);
    this.hideTypingStarted = this.hideTypingStarted.bind(this);
    this.addMessageToList = this.addMessageToList.bind(this);
    this.notifyMemberLeft = this.notifyMemberLeft.bind(this);
}

channelUtility.prototype.createChannel = function () {
    //console.log('Channel Created');
    var self = this;

    var promise = new RSVP.Promise(function (resolve, reject) {
        console.log(self.client);
        self.client.createChannel({
            uniqueName: self.uniqueName,
            friendlyName: self.friendlyName,
            type: 'private',
            attributes: self.attributes
        }).then(function (channel) {
            console.log('Created Private channel');
            console.log(channel);
            resolve(channel);
            self.channel = channel;
            //this.setupChannel();
        }).catch(function (error) {
            reject(error);
        });
    });
    return promise;
};

channelUtility.prototype.setupChannel = function (channel) {
    var self = this;
    //console.log(self.channel);
    if (!self.channel) {
        self.channel = channel;
    }
    var promise = new RSVP.Promise(function (resolve, reject) {
        self.client.getChannelByUniqueName(self.uniqueName).then(function (channel) {
            console.log(channel);

            if (channel) {
                self.deleteChannel(channel).then(function (channel) {
                    console.log('channel deleted' + channel);
                    self.createChannel().then(function (channel) {
                        console.log('channel created' + channel);
                        resolve(channel);
                    });
                });
            }
            else {
                self.createChannel().then(function (channel) {
                    resolve(channel);
                });
            }
        });

    });

    return promise;

};

channelUtility.prototype.deleteChannel = function (channel) {

    var self = this;
    var promise = new RSVP.Promise(function (resolve, reject) {
        channel.delete().then(function (leftChannel) {
            console.log('Channel Deleted' + leftChannel);
            leftChannel.removeListener('messageAdded', self.addMessageToList);
            leftChannel.removeListener('typingStarted', self.showTypingStarted);
            leftChannel.removeListener('typingEnded', self.hideTypingStarted);
            leftChannel.removeListener('memberJoined', self.notifyMemberJoined);
            leftChannel.removeListener('memberLeft', self.notifyMemberLeft);

            resolve(leftChannel);
        });
    });
    return promise;
};

channelUtility.prototype.sendMessage = function () {
    var text = this.DOMObj.getEnteredChatMessage();
    if (text !== '') {
        this.channel.sendMessage(text);
        this.DOMObj.clearEnteredChatMessage();
    }
    //to prevent default form submission
    return false;

};

channelUtility.prototype.addMessageToList = function (message) {
    this.DOMObj.addMessageToList(message, (message.author === this.uniqueName) ? 'self' : '');
};

channelUtility.prototype.notifyMemberJoined = function (member) {
    this.notify(member.identity + ' joined the channel');
    //send callback function as an argument

};
channelUtility.prototype.notifyMemberLeft = function (member) {
    this.notify(member.identity + ' left the channel');
    this.DOMObj.removeEventListenerToSendBtn(this.sendMessage.bind(this));
};

channelUtility.prototype.showTypingStarted = function (member) {};
channelUtility.prototype.hideTypingStarted = function (member) {};

channelUtility.prototype.notify = function (message) {
    this.DOMObj.notify(message);
};

// channelUtility.prototype.setupChannel = function () {
//     var promise = new RSVP.Promise(function (resolve, reject) {
//         this.joinChannel().then(function (channel) {
//             this.initChannelEvent().then(function () {
//                 resolve(channel);
//             });
//         });
//     });
//     return promise;
// };

channelUtility.prototype.joinChannel = function (channel) {
    var self = this;
    if (!self.channel) {
        self.channel = channel;
    }
    var promise = new RSVP.Promise(function (resolve, reject) {
        self.channel.join().then(function (channel) {
            console.log('Channel Joined' + channel);
            self.DOMObj.addEventListenerToSendBtn(self.sendMessage.bind(self));
            resolve(channel);
        });
    });
    return promise;
};

channelUtility.prototype.initChannelEvent = function (channel) {
    console.log('Channel Event initiated');
    //var promise = new RSVP.Promise(function (resolve, reject) {
    channel.on('memberJoined', this.notifyMemberJoined);
    channel.on('typingStarted', this.showTypingStarted);
    channel.on('typingEnded', this.hideTypingStarted);
    channel.on('messageAdded', this.addMessageToList);
    channel.on('memberLeft', this.notifyMemberLeft);

    // resolve();
    // });
    //return promise;
};

channelUtility.prototype.getChannelBySid = function (channelsid) {
    var self = this;
    var promise = new RSVP.Promise(function (resolve, reject) {
        self.client.getChannelBySid(channelsid).then(function (channel) {
            resolve(channel);
        });

    });
    return promise;
};

module.exports = channelUtility;
