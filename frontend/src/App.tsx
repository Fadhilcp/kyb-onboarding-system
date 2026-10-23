import { BrowserRouter, Routes, Route } from "react-router-dom";
import SubmitApplicationPage from "./pages/SubmitApplicationPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<main className="center-container"><h1>Know your Business</h1></main>} />
        <Route path="/submit-application" element={<SubmitApplicationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;