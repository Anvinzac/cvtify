import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollProgress } from "@/components/cv/ScrollProgress";
import { StageNav } from "@/components/cv/StageNav";
import CV from "@/pages/CV";
import NotFound from "@/pages/NotFound";

const App = () => (
  <BrowserRouter>
    <ScrollProgress />
    <StageNav />
    <Routes>
      <Route path="/" element={<CV />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
