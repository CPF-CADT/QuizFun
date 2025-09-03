import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GameProvider } from "./context/GameContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/*",
    element: (
      <GameProvider>
        <App />
      </GameProvider>
    ),
  },
]);

// 3. Render the RouterProvider, wrapped by any top-level providers
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);