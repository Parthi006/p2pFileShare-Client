// src/Sender.jsx
import React, { useState, useRef } from "react";
import io from "socket.io-client";
import { createSenderPeer } from "../utils/peer";

const socket = io("https://file-share-kohl.vercel.app");

export default function Sender() {
  const [roomId, setRoomId] = useState("");
  const peerRef = useRef(null);

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    setRoomId(newRoomId);
    socket.emit("join-room", newRoomId);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const chunkSize = 128 * 1024; // 64KB
    let offset = 0;
    // Send metadata first

    const meta = {
      type: "metadata",
      name: file.name,
      size: file.size,
    };

    // Encode metadata string to Uint8Array
    const encoder = new TextEncoder();
    const metaBuffer = encoder.encode("__META__" + JSON.stringify(meta));
    const metaComplete = encoder.encode("_complete_");
    peerRef.current.send(metaBuffer); // send metadata
    const readChunk = () => {
      const reader = new FileReader();
      const slice = file.slice(offset, offset + chunkSize);
      reader.onload = () => {
        const buffer = reader.result;
        peerRef.current.send(buffer);
        offset += chunkSize;
        if (offset < file.size) readChunk();
        else peerRef.current.send(metaComplete);
      };
      reader.readAsArrayBuffer(slice);
    };

    readChunk();
  };

  socket.on("peer-joined", () => {
    if (peerRef.current) peerRef.current.destroy();

    const peer = createSenderPeer(
      (signal) => socket.emit("signal", { roomId, signal }),
      () => {}
    );

    peerRef.current = peer;

    socket.once("signal", (signal) => {
      if (!peer.destroyed) {
        try {
          peer.signal(signal);
        } catch (err) {
          console.error("❌ Failed to signal sender:", err);
        }
      }
    });

    socket.on("receiver-ready", () => {
      document.getElementById("fileInput").disabled = false;
    });
  });

  return (
    <div>
      <button onClick={handleCreateRoom}>Create Link</button>
      {roomId && (
        <p>
          Send this code to receiver: <b>{roomId}</b>
        </p>
      )}
      <input type="file" id="fileInput" disabled onChange={handleFileChange} />
    </div>
  );
}
