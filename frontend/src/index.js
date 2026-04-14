import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { ProductProvider } from "@/context/ProductContext";
console.log("build:", Date.now());

const BUILD_VERSION = process.env.REACT_APP_BUILD_VERSION || "dev";

const storedVersion = localStorage.getItem("app_version");


if (storedVersion !== BUILD_VERSION) {
  localStorage.setItem("app_version", BUILD_VERSION);

  // hard reload instead of replace()
  window.location.reload(true);
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ProductProvider>
      <App />
    </ProductProvider>
  </React.StrictMode>
);
