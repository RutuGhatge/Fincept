import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000")
      .then((res) => {
        setMessage(JSON.stringify(res.data));
      })
      .catch((err) => {
        setMessage("Error connecting backend");
        console.error(err);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Investment Intelligence 🚀</h1>
      <h2>Backend Response:</h2>
      <pre>{message}</pre>
    </div>
  );
}

export default App;
