const twilio = require('twilio');
const secret = require('../configs/secrets');

const AccessToken = twilio.jwt.AccessToken;
const IpMessagingGrant = AccessToken.IpMessagingGrant;
//const TaskRouterWorkerCapability = twilio.jwt.taskrouter.TaskRouterWorkerCapability;

function TokenGenerator(identity, deviceId) {
    const appName = 'TwilioChat';

    // Create a unique ID for the client on their current device
    const endpointId = appName + ':' + identity + ':' + deviceId;
    console.log(identity);
    // Create a "grant" which enables a client to use IPM as a given user,
    // on a given device
    const ipmGrant = new IpMessagingGrant({
        serviceSid: secret.TWILIO_IPM_SERVICE_SID,
        endpointId: endpointId,
    });

    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    const token = new AccessToken(
        secret.TWILIO_ACCOUNT_SID,
        secret.TWILIO_API_KEY,
        secret.TWILIO_API_SECRET
    );

    token.addGrant(ipmGrant);
    token.identity = identity;

    return token;
}

function WorkerTokenGenerator(sid) {
    const taskrouter = twilio.jwt.taskrouter;
    const TaskRouterCapability = taskrouter.TaskRouterCapability;
    const util = taskrouter.util;
    const Policy = TaskRouterCapability.Policy;

    const TASKROUTER_BASE_URL = 'https://taskrouter.twilio.com';
    const version = 'v1';

    const workerCapability = new TaskRouterCapability({
        accountSid: secret.TWILIO_ACCOUNT_SID,
        authToken: secret.TWILIO_AUTH_TOKEN,
        workspaceSid: secret.TWILIO_WORSPACE_SID,
        channelId: sid
    });

    // Helper function to create Policy
    function buildWorkspacePolicy(options) {
        options = options || {};
        var resources = options.resources || [];
        var urlComponents = [TASKROUTER_BASE_URL, version, 'Workspaces', secret.TWILIO_WORSPACE_SID]

        return new Policy({
            url: urlComponents.concat(resources).join('/'),
            method: options.method || 'GET',
            allow: true
        });
    }

    // Event Bridge Policies
    var eventBridgePolicies = util.defaultEventBridgePolicies(secret.TWILIO_ACCOUNT_SID, sid);

    // Worker Policies
    var workerPolicies = util.defaultWorkerPolicies(version, secret.TWILIO_WORSPACE_SID, sid);

    var workspacePolicies = [
        new Policy({
            url: "https://event-bridge.twilio.com/v1/wschannels/ACb4883ed14aeeb6b36b1b06b379264544/WKbbe86c57ce549f70cc3f0cf6f4a2f673",
            method: 'GET',
            allow: true
        }),
        new Policy({
            url: "https://event-bridge.twilio.com/v1/wschannels/ACb4883ed14aeeb6b36b1b06b379264544/WKbbe86c57ce549f70cc3f0cf6f4a2f673",
            method: 'POST',
            allow: true
        }),
      // Workspace fetch Policy
      buildWorkspacePolicy(),
      // Workspace Activities Update Policy
      buildWorkspacePolicy({
            resources: ['Activities'],
            method: 'POST'
        }),
      // Workspace Activities Worker Reserations Policy
      buildWorkspacePolicy({
            resources: ['Workers', sid, 'Reservations', '**'],
            method: 'POST'
        }),
    ];

    eventBridgePolicies.concat(workspacePolicies).forEach(function (policy) {
        workerCapability.addPolicy(policy);
    });

    workerPolicies.concat(workspacePolicies).forEach(function (policy) {
        workerCapability.addPolicy(policy);
    });

    return workerCapability;
}

module.exports = {
    generate: TokenGenerator,
    generateworker: WorkerTokenGenerator
};
