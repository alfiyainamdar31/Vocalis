import { Routes, Route } from "react-router-dom";
import "./App.css";

import TTSPage from "./pages/TTSPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Changelog from "./pages/Changelog";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import TwoFactorSettings from "./pages/TwoFactorSettings";

function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <TTSPage />
                </ProtectedRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/settings/security"
              element={
                <ProtectedRoute>
                  <TwoFactorSettings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
