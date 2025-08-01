// src/utils/peer.js
import Peer from "simple-peer";

// Common config for both sender and receiver
const commonPeerConfig = {
  trickle: false,
};

export const createSenderPeer = (onSignal, onData = () => {}, onClose, onError) => {
  const peer = new Peer({ ...commonPeerConfig, initiator: true });

  peer.on("signal", onSignal);
  peer.on("data", onData);
  if (onClose) peer.on("close", onClose);
  if (onError) peer.on("error", onError);

  return peer;
};

export const createReceiverPeer = (onSignal, onData = () => {}, onClose, onError) => {
  const peer = new Peer({ ...commonPeerConfig, initiator: false });

  peer.on("signal", onSignal);
  peer.on("data", onData);
  if (onClose) peer.on("close", onClose);
  if (onError) peer.on("error", onError);

  return peer;
};
