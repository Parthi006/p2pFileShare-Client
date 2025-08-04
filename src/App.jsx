// src/App.jsx
import React, { useState } from "react";
import Sender from "./components/Sender";
import Receiver from "./components/Receiver";
window.global ||= window;

import process from "process";
window.process = process;

export default function App() {
  const [role, setRole] = useState(null);

  if (!role) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h1>P2P File Transfer</h1>
        <p>Select your role:</p>
        <button onClick={() => setRole("sender")}>Sender</button>
        <button onClick={() => setRole("receiver")}>Receiver</button>
      </div>
    );
  }

  return (
    <div>
      {role === "sender" ? <Sender /> : <Receiver />}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button onClick={() => setRole(null)}>⬅ Back</button>
      </div>
    </div>
  );
}
