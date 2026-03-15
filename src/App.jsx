import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Overview from "./pages/Overview";
import Errors from "./pages/Errors";
import ApiCalls from "./pages/ApiCalls";
import Performance from "./pages/Performance";
import Sessions from "./pages/Sessions";
import Interactions from "./pages/Interactions";

export default function App() {
  const [appId, setAppId] = useState("picker-dashboard");

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        <Sidebar appId={appId} setAppId={setAppId} />
        <main className="flex-1 overflow-y-auto grid-bg">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <Routes>
              <Route path="/" element={<Overview appId={appId} />} />
              <Route path="/errors" element={<Errors appId={appId} />} />
              <Route path="/api-calls" element={<ApiCalls appId={appId} />} />
              <Route
                path="/performance"
                element={<Performance appId={appId} />}
              />
              <Route path="/sessions" element={<Sessions appId={appId} />} />
              <Route
                path="/interactions"
                element={<Interactions appId={appId} />}
              />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
