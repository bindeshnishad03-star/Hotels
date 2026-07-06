import React, { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { BookingsPage } from './pages/BookingsPage';
import { AdminPortal } from './pages/AdminPortal';
import { DarkModeToggle } from './components/DarkModeToggle';
import { HotelDetailModal } from './components/HotelDetailModal';
import type { Hotel } from './services/api';

type Page = 'dashboard' | 'bookings' | 'admin';

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  const handleBookingSuccess = () => {
    // Automatically switch to bookings page to see the new stay!
    setActivePage('bookings');
  };

  return (
    <>
      {/* Premium Header */}
      <header className="app-header">
        <div className="brand-wrapper" onClick={() => setActivePage('dashboard')}>
          <i className="bi bi-buildings-fill brand-icon"></i>
          <span>GrandVenture</span>
        </div>

        <nav className="nav-links">
          <button 
            className={`nav-item-btn ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('dashboard')}
          >
            <i className="bi bi-search"></i> Explore Hotels
          </button>
          
          <button 
            className={`nav-item-btn ${activePage === 'bookings' ? 'active' : ''}`}
            onClick={() => setActivePage('bookings')}
          >
            <i className="bi bi-journal-bookmark"></i> My Bookings
          </button>
          
          <button 
            className={`nav-item-btn ${activePage === 'admin' ? 'active' : ''}`}
            onClick={() => setActivePage('admin')}
          >
            <i className="bi bi-shield-lock"></i> Operator Portal
          </button>

          <DarkModeToggle />
        </nav>
      </header>

      {/* Main Pages Switcher */}
      <main className="app-main">
        {activePage === 'dashboard' && (
          <Dashboard onSelectHotel={(hotel) => setSelectedHotel(hotel)} />
        )}
        {activePage === 'bookings' && (
          <BookingsPage />
        )}
        {activePage === 'admin' && (
          <AdminPortal />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container">
          <p>© 2026 GrandVenture Inc. Connecting you to luxury hospitality. All rights reserved.</p>
          <p className="mt-1">
            Integrating with the <a href="https://demohotelsapi.pythonanywhere.com/" target="_blank" rel="noreferrer">Hotels API Database</a>.
          </p>
        </div>
      </footer>

      {/* Detail View Modal */}
      {selectedHotel && (
        <HotelDetailModal 
          hotel={selectedHotel} 
          onClose={() => setSelectedHotel(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </>
  );
};

export default App;
