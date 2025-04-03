import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/index";

export default function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto mt-6">
        <AppRoutes />
      </div>
    </Router>
  );
}

