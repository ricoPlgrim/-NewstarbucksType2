import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

if (typeof document !== "undefined") {
  document.body.classList.add("loaded");
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);

reportWebVitals();

