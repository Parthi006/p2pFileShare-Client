// src/Receiver.jsx
import React, { useState, useRef } from "react";
import io from "socket.io-client";
import { createReceiverPeer } from "../utils/peer";

const socket = io("https://p2pfileshare-server.onrender.com");

export default function Receiver() {
  const [roomId, setRoomId] = useState("");
  const peerRef = useRef(null);
  const decoder = new TextDecoder("utf-8");
  const fileChunks = useRef([]);
  const fileInfo = useRef({ name: "received_file" });
  const [complete, setIsComplete] = useState(true);
  const [progress, setProgress] = useState(0);

  const isMetadata = (data) => {
    try {
      const text = decoder.decode(data);
      return text.startsWith("__META__");
    } catch (err) {
      return false;
    }
  };

  const isMetacomplete = (data) => {
    try {
      const text = decoder.decode(data);
      return text.startsWith("_complete_");
    } catch (err) {
      return false;
    }
  };

  const handleJoinRoom = () => {
    socket.emit("join-room", roomId);
    if (peerRef.current) peerRef.current.destroy();

    const peer = createReceiverPeer(
      (signal) => socket.emit("signal", { roomId, signal }),
      (data) => {
        // Detect metadata or actual chunk
        if (isMetacomplete(data)) {
          const blob = new Blob(fileChunks.current);
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileInfo.current.name;
          a.click();
          URL.revokeObjectURL(url);
          setIsComplete(false);
          return;
        }
        if (isMetadata(data)) {
          try {
            const text = decoder.decode(data);
            const parsed = JSON.parse(text.replace("__META__", ""));
            console.log({ data });
            if (parsed.type === "metadata") {
              //   const json = JSON.parse(text.replace("__META__", ""));
              fileInfo.current.name = parsed.name;
              fileInfo.current.size = parsed.size;
              console.log("📄 Receiving:", parsed.name, "Size:", parsed.size);
              return;
            }
          } catch (err) {
            console.warn("⚠️ Failed to parse metadata", err);
          }
        } else {
          fileChunks.current = [ data, ...fileChunks.current];
          setProgress(
            (fileChunks.current.reduce(
              (acc, buffer) => acc + buffer.byteLength,
              0
            ) /
              fileInfo.current.size) *
              100
          );
          // If it's binary data (ArrayBuffer)
        }
      }
    );

    peerRef.current = peer;

    socket.once("signal", (signal) => {
      if (!peer.destroyed) {
        try {
          peer.signal(signal);
        } catch (err) {
          console.error("❌ Failed to signal receiver:", err);
        }
      }
    });
    socket.emit("ready-to-receive", roomId);
  };

  const handleDownload = () => {
    const blob = new Blob(fileChunks.current);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileInfo.current.name;
    a.click();
    // fileChunks.current = [];
  };

  return (
    <div>
      <input
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter Room ID"
      />
      <button onClick={handleJoinRoom}>Join</button>
      {/* <button onClick={handleDownload} disabled={complete}>
        Download
      </button> */}
      <progress id="progressBar" value={progress} max="100"></progress>
    </div>
  );
}
