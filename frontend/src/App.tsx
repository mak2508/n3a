import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ClientsPage } from './pages/Clients';
import { Meetings } from './pages/Meetings';
import { SentimentsPage } from './pages/Sentiments';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-xl font-bold text-gray-900">
                    Meeting Analytics
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    Meetings
                  </Link>
                  <Link
                    to="/sentiments"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    Sentiments
                  </Link>
                  <Link
                    to="/clients"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    Clients
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<Meetings />} />
            <Route path="/sentiments" element={<SentimentsPage />} />
            <Route path="/clients" element={<ClientsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;