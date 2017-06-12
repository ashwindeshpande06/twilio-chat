const twilio = require('twilio');
const secret = require('../configs/secrets');

function createTaskForChat(channelDetails) {
    const accountSid = secret.TWILIO_ACCOUNT_SID;
    const authToken = secret.TWILIO_AUTH_TOKEN;
    const workspaceSid = secret.TWILIO_WORSPACE_SID;
    const workflowSid = secret.TWILIO_WORKFLOW_SID;
    const taskChannel = 'TCf6538ee1a6b1c726fcb1b1aa0ba32888';
    const client = twilio(accountSid, authToken);
    console.log('Before task creation');
    client.taskrouter.v1.workspaces(workspaceSid).tasks.create({
        workflowSid: workflowSid,
        attributes: JSON.stringify(channelDetails),
        priority: 1,
        timeout: 1200,
        taskChannel: taskChannel
    });
    console.log('After task creation');
    console.log(channelDetails);

}

module.exports = {
    createTaskForChat: createTaskForChat
};
