import React, { useState, useEffect } from 'react';

interface Booking {
  id: number;
  hotelId: number;
  hotelName: string;
  hotelThumbnail: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  totalPrice: string;
  status: string;
  createdAt: string;
}

export const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    try {
      const savedBookingsStr = localStorage.getItem('grandventure_bookings') || '[]';
      const saved = JSON.parse(savedBookingsStr);
      setBookings(saved);
    } catch (e) {
      setBookings([]);
    }
  };

  const handleCancelBooking = (bookingId: number) => {
    if (window.confirm('Are you sure you want to cancel this booking reservation? This action cannot be undone.')) {
      try {
        const updated = bookings.filter(b => b.id !== bookingId);
        localStorage.setItem('grandventure_bookings', JSON.stringify(updated));
        setBookings(updated);
      } catch (err) {
        alert('Could not cancel booking. Please try again.');
      }
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="bookings-container container py-5">
      <div className="bookings-header mb-5 text-center">
        <h2 className="section-title">
          <i className="bi bi-journal-bookmark-fill text-accent me-2"></i>My Bookings & Stays
        </h2>
        <p className="text-muted">Review, manage, or cancel your simulated active hotel reservations.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-bookings-card text-center p-5">
          <div className="empty-icon-wrapper mb-4">
            <i className="bi bi-calendar2-x text-muted display-3"></i>
          </div>
          <h4>No Bookings Found</h4>
          <p className="text-muted mb-4">You do not have any active hotel itineraries currently scheduled.</p>
          <a href="#dashboard" className="btn btn-accent px-4 py-2">
            Browse Luxury Hotels
          </a>
        </div>
      ) : (
        <div className="bookings-grid row g-4 justify-content-center">
          {bookings.map((booking) => (
            <div className="col-lg-8" key={booking.id}>
              <div className="booking-ticket-card">
                <div className="ticket-body">
                  <div className="row g-0 align-items-center">
                    {/* Thumbnail */}
                    <div className="col-md-3">
                      <div className="ticket-thumbnail-wrapper">
                        <img 
                          src={booking.hotelThumbnail || "https://images.unsplash.com/photo-1551918120-9739cb430c6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300"} 
                          alt={booking.hotelName} 
                          className="ticket-thumbnail"
                        />
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="col-md-6">
                      <div className="ticket-details-box p-4">
                        <span className="badge-confirmed mb-2">
                          <i className="bi bi-check-circle-fill me-1"></i> {booking.status}
                        </span>
                        <h4 className="ticket-hotel-name mb-3">{booking.hotelName}</h4>
                        
                        <div className="row g-2 ticket-info-grid">
                          <div className="col-6">
                            <span className="info-label">Guest Name</span>
                            <span className="info-value">{booking.guestName}</span>
                          </div>
                          <div className="col-6">
                            <span className="info-label">Occupancy</span>
                            <span className="info-value">{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</span>
                          </div>
                          <div className="col-6">
                            <span className="info-label">Check-In</span>
                            <span className="info-value">{formatDate(booking.checkIn)}</span>
                          </div>
                          <div className="col-6">
                            <span className="info-label">Check-Out</span>
                            <span className="info-value">{formatDate(booking.checkOut)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ticket Checkout Details */}
                    <div className="col-md-3">
                      <div className="ticket-checkout-box p-4 text-center">
                        <span className="duration-pill mb-2 d-inline-block">
                          {booking.nights} Night{booking.nights > 1 ? 's' : ''}
                        </span>
                        <div className="total-price-box my-2">
                          <span className="price-label d-block text-muted">Paid Amount</span>
                          <span className="price-amount text-accent">₹{parseFloat(booking.totalPrice).toLocaleString('en-IN')}</span>
                        </div>
                        <button 
                          className="btn-cancel-ticket mt-3"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <i className="bi bi-trash3 me-1"></i> Cancel Reservation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
