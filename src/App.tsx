import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import RecipeDetail from "@/pages/RecipeDetail";
import RecipeEdit from "@/pages/RecipeEdit";
import WhatToEat from "@/pages/WhatToEat";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/what-to-eat" element={<WhatToEat />} />
        <Route path="/recipe/new" element={<RecipeEdit />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/recipe/:id/edit" element={<RecipeEdit />} />
      </Routes>
    </Router>
  );
}
