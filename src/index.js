import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { useState } from "react";
import StarRating from "./starRating";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating
      maxRating={5}
      messages={["Terrible", "Okay", "Average", "Good", "Best"]}
    />
    <StarRating color="red" defaultRating={3} />
    <Test /> */}
  </React.StrictMode>
);
