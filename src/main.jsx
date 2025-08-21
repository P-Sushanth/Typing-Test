import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Add this import
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Wrap your app with BrowserRouter */}
    <BrowserRouter basename="/Typing-Test/">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);