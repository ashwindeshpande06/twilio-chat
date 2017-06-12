var DOMUtility = require('./dom-utility');


function DOMCreation(chatContainer, chatTitle) {

    this.DOMUtility = new DOMUtility();
    this.chatContainer = chatContainer;
    this.chatTitle = chatTitle;
    console.log(this.chatContainer);
}

DOMCreation.prototype.createHeader = function () {

    var header = this.DOMUtility.ce('div');
    header.setAttribute('id', 'twil-chatheader-container');
    header.setAttribute('class', 'twi-box-header with-border');
    //DOMUtility.e(chatContainer).appendChild(header);

    var html = '<h3 class="twi-box-title">' + this.sanitize(this.chatTitle) + '</h3>';
    html += '<div class="twi-box-tools twi-pull-right">';
    html += '<button type="button" class="twi-btn twi-btn-box-tool" data-widget="collapse"><i class="fa fa-minus">&#8213;</i></button>';
    html += '<button type="button" class="twi-btn twi-btn-box-tool" data-widget="remove"><i class="fa fa-times">&#10006</i></button>';
    html += '</div>';

    this.DOMUtility.e(header).innerHTML += html;

    return header;
};

DOMCreation.prototype.createFooter = function () {

    var footer = this.DOMUtility.ce('div');
    footer.setAttribute('id', 'twil-chatfooter-container');
    footer.setAttribute('class', 'twi-box-footer');

    var html = '<div class="twi-input-group">';
    html += '<input type="text" name="message" id="twi-chat-textbox" placeholder="Type Message ..." class="twi-form-control">';
    html += '<span class="twi-input-group-btn">';
    html += ' <button type="button" id="twi-send-btn" class="twi-btn twi-btn-warning twi-btn-flat">Send</button>';
    html += '</span>';
    html += '</div>';

    this.DOMUtility.e(footer).innerHTML += html;

    return footer;
};

DOMCreation.prototype.createBody = function () {

    var body = this.DOMUtility.ce('div');
    body.setAttribute('id', 'twil-chatbody-container');
    body.setAttribute('class', 'twi-box-body');

    var html = '<div id="twi-direct-chat-messages" class="twi-direct-chat-messages">';
    html += '</div>';

    this.DOMUtility.e(body).innerHTML += html;

    return body;
};

DOMCreation.prototype.addMessageToList = function (message, str) {

    var rowDiv = this.DOMUtility.ce('div');
    rowDiv.setAttribute('class', 'twi-direct-chat-msg');

    (str === 'self') ? '' : (rowDiv.className += ' right');

    var html = '<div class="twi-direct-chat-info clearfix">';

    if (str === 'self') {
        html += '<span class="twi-direct-chat-name twi-pull-left">' + this.sanitize(message.author) + '</span>';
        html += '<span class="twi-direct-chat-timestamp twi-pull-right">' + this.sanitize(message.timestamp) + '</span>';

    }
    else {
        html += '<span class="twi-direct-chat-name twi-pull-right">' + this.sanitize(message.author) + '</span>';
        html += '<span class="twi-direct-chat-timestamp twi-pull-left">' + this.sanitize(message.timestamp) + '</span>';
    }

    html += '</div>';
    html += '<div class="direct-chat-text">' + this.sanitize(message.body) + '</div>';

    this.DOMUtility.e(rowDiv).innerHTML += html;
    this.DOMUtility.e('twi-direct-chat-messages').appendChild(rowDiv);
    //return rowDiv;

};

DOMCreation.prototype.notify = function (message) {
    var notifyMember = this.DOMUtility.ce('div');
    notifyMember.setAttribute('class', 'twi-notify-member-text');

    this.DOMUtility.e(notifyMember).innerHTML = this.sanitize(message);
    console.log(notifyMember);
    // this.DOMUtility.e('twi-direct-chat-messages').innerHTML += notifyMember;
    this.DOMUtility.e('twi-direct-chat-messages').appendChild(notifyMember);
};

DOMCreation.prototype.addEventListenerToSendBtn = function (callback) {
    this.DOMUtility.bind('twi-send-btn', 'click', callback);
};

DOMCreation.prototype.removeEventListenerToSendBtn = function () {
    this.DOMUtility.unbind('twi-send-btn', 'click', function () {

        return false;
    });
};

DOMCreation.prototype.getEnteredChatMessage = function () {
    return this.sanitize(this.DOMUtility.e('twi-chat-textbox').value);
};

DOMCreation.prototype.clearEnteredChatMessage = function () {
    this.DOMUtility.e('twi-chat-textbox').value = '';
};

DOMCreation.prototype.appendAll = function (c1, c2, c3) {

    var container = this.DOMUtility.ce('div');
    container.setAttribute('id', 'twil-chat-container');
    container.setAttribute('class', 'twi-box twi-box-warning twi-direct-chat twi-direct-chat-warning');

    container.appendChild(c1);
    container.appendChild(c2);
    container.appendChild(c3);

    this.DOMUtility.e(this.chatContainer).appendChild(container);

};

DOMCreation.prototype.sanitize = function (str) {
    if (typeof str !== 'string') {
        return str;
    }
    str = str.replace(/&/g, '&amp;');
    str = str.replace(/>/g, '&gt;');
    str = str.replace(/</g, '&lt;');
    str = str.replace(/"/g, '&quot;');
    str = str.replace(/\'/g, '&#039;');
    str = str.replace(/\//g, '&#x2F;');
    return str;
};

module.exports = DOMCreation;
