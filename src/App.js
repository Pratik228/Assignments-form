import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FeedbackForm from "./components/FeedbackForm";
import Dashboard from "./components/Dashboard";
import ViewSubmissions from "./components/ViewSubmissions";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/edit-form/:formId" element={<FeedbackForm />} />
        <Route path="/view-submissions/:formId" element={<ViewSubmissions />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
