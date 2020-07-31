declare const MessageTypes: {
    Heartbeat: number;
    ConnectionRequest: number;
    ClientConnected: number;
    DisconnectionRequest: number;
    ClientDisconnected: number;
    InitializationRequest: number;
    InitializationResponse: number;
    SynchronizationRequest: number;
    JoinWorldRequest: number;
    LeaveWorldRequest: number;
    WebRTCTransportCreateRequest: number;
    WebRTCTransportConnectRequest: number;
    WebRTCTransportCloseRequest: number;
    WebRTCSendTrackRequest: number;
    WebRTCReceiveTrackRequest: number;
    WebRTCPauseConsumerRequest: number;
    WebRTCResumeConsumerRequest: number;
    WebRTCCloseConsumerRequest: number;
    WebRTCPauseProducerRequest: number;
    WebRTCResumeProducerRequest: number;
    WebRTCCloseProducerRequest: number;
    WebRTCMuteOtherProducerRequest: number;
    WebRTCUnmuteOtherProducerRequest: number;
    WebRTCConsumerSetLayersRequest: number;
    ReliableMessage: number;
    UnreliableMessage: number;
};
export default MessageTypes;