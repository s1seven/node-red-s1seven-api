module.exports = function (RED) {
    function RemoteServerNode(n) {
        RED.nodes.createNode(this, n);
        this.companyId = n.companyId;
        this.accessToken = n.accessToken;
        this.mode = n.mode;
        this.environment = n.environment;
        this.name = n.name;
    }
    RED.nodes.registerType('api-config', RemoteServerNode);
};
