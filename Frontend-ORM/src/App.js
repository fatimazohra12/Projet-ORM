import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login/Login";
import ORM from "./ORM/ORM";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/ORM" element={<ORM />} />
      </Routes>
    </Router>
  );
}

export default App;
