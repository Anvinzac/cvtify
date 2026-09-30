import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MediaProjectProvider } from "@/context/MediaProjectContext";
import LiveCV from "@/pages/LiveCV";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <MediaProjectProvider>
        <Routes>
          <Route path="/" element={<LiveCV />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MediaProjectProvider>
    </BrowserRouter>
  );
}

export default App;
