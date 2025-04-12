import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Meetings } from './pages/Meetings';
import { ClientsPage } from './pages/Clients';
import { Navbar } from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Meetings />} />
            <Route path="/clients" element={<ClientsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;