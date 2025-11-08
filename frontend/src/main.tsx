import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MantineProvider } from "@mantine/core";
import { AuthProvider } from "./contexts/AuthProvider";
import "@mantine/core/styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider
      defaultColorScheme="light"
      theme={{
        fontFamily: "Inter, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        primaryColor: "teal",
      }}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </MantineProvider>
  </React.StrictMode>
);
