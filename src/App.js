import "dotenv/config";
import React from "react";
import ReactDOM from "react-dom/client";
import FeedbackForm from "./components/FeedbackForm";
import Dashboard from "./components/Dashboard";
import ViewSubmissions from "./components/ViewSubmissions";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const AppLayout = () => {
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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<AppLayout />);
