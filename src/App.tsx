import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MediaProjectProvider } from "@/context/MediaProjectContext";
import { AuthProvider } from "@/context/AuthContext";
import LiveCV from "@/pages/LiveCV";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MediaProjectProvider>
          <Routes>
            <Route path="/" element={<LiveCV />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MediaProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
