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
        fontFamily: "'Nunito', 'Inter', system-ui, -apple-system, sans-serif",
        primaryColor: "warmBlue",
        colors: {
          warmBlue: [
            '#e8f4f8',
            '#d0e8f1',
            '#b8dcea',
            '#9fd0e3',
            '#87c4dc',
            '#6fb8d5',
            '#5aacce',
            '#4a9ac0',
            '#3a88b2',
            '#2a76a4'
          ],
          softPeach: [
            '#fff5f0',
            '#ffe8dd',
            '#ffd9c7',
            '#ffc9af',
            '#ffb897',
            '#ffa67f',
            '#ff9367',
            '#e67d52',
            '#cc673d',
            '#b35128'
          ],
          calmLavender: [
            '#f5f3ff',
            '#ede9fe',
            '#ddd6fe',
            '#c4b5fd',
            '#a78bfa',
            '#8b5cf6',
            '#7c3aed',
            '#6d28d9',
            '#5b21b6',
            '#4c1d95'
          ],
          mintGreen: [
            '#f0fdf9',
            '#ccfbef',
            '#99f6e4',
            '#5eead4',
            '#2dd4bf',
            '#14b8a6',
            '#0d9488',
            '#0f766e',
            '#115e59',
            '#134e4a'
          ]
        },
        defaultRadius: 'lg',
        shadows: {
          sm: '0 2px 8px rgba(0, 0, 0, 0.06)',
          md: '0 4px 16px rgba(0, 0, 0, 0.08)',
          lg: '0 8px 24px rgba(0, 0, 0, 0.1)',
          xl: '0 12px 32px rgba(0, 0, 0, 0.12)',
        },
        headings: {
          fontFamily: "'Nunito', 'Inter', system-ui, sans-serif",
          fontWeight: '700',
        },
        components: {
          Card: {
            defaultProps: {
              shadow: 'sm',
              radius: 'lg',
            },
          },
          Button: {
            defaultProps: {
              radius: 'md',
            },
          },
          TextInput: {
            defaultProps: {
              radius: 'md',
            },
          },
        },
      }}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </MantineProvider>
  </React.StrictMode>
);
