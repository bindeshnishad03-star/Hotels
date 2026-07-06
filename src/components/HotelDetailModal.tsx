import React, { useState } from 'react';
import type { Hotel } from '../services/api';
import { StarRating } from './StarRating';

interface HotelDetailModalProps {
  hotel: Hotel;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export const HotelDetailModal: React.FC<HotelDetailModalProps> = ({ 
  hotel, 
  onClose,
  onBookingSuccess
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [bookingName, setBookingName] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [isBooked, setIsBooked] = useState(false);

  // Setup photo arrays safely
  const photosList = hotel.photos && hotel.photos.length > 0 
    ? hotel.photos 
    : [hotel.thumbnail];

  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) => (prev + 1) % photosList.length);
  };

  const handlePrevPhoto = () => {
    setActivePhotoIndex((prev) => (prev - 1 + photosList.length) % photosList.length);
  };

  // Helper to calculate total nights and price
  const calculateBookingDetails = () => {
    if (!checkIn || !checkOut) return { nights: 0, subtotal: 0, serviceFee: 0, total: 0 };
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return { nights: 0, subtotal: 0, serviceFee: 0, total: 0 };
    }
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const pricePerNight = parseFloat(hotel.price) || 2000;
    const subtotal = pricePerNight * nights;
    const serviceFee = subtotal * 0.08; // 8% service fee
    const total = subtotal + serviceFee;
    
    return { nights, subtotal, serviceFee, total };
  };

  const bookingDetails = calculateBookingDetails();

  const handleBookNow = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');

    if (!bookingName.trim()) {
      setBookingError('Please enter primary guest name.');
      return;
    }
    if (!checkIn) {
      setBookingError('Please select a Check-In date.');
      return;
    }
    if (!checkOut) {
      setBookingError('Please select a Check-Out date.');
      return;
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (start < today) {
      setBookingError('Check-In date cannot be in the past.');
      return;
    }

    if (start >= end) {
      setBookingError('Check-Out date must be after Check-In date.');
      return;
    }

    // Save Booking
    const newBooking = {
      id: Date.now(),
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelThumbnail: hotel.thumbnail,
      guestName: bookingName,
      checkIn,
      checkOut,
      guests,
      nights: bookingDetails.nights,
      totalPrice: bookingDetails.total.toFixed(2),
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    try {
      const existingBookingsStr = localStorage.getItem('grandventure_bookings') || '[]';
      const existingBookings = JSON.parse(existingBookingsStr);
      existingBookings.unshift(newBooking);
      localStorage.setItem('grandventure_bookings', JSON.stringify(existingBookings));
      
      setIsBooked(true);
      setTimeout(() => {
        onBookingSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setBookingError('Failed to complete booking. Please try again.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <i className="bi bi-x-lg"></i>
        </button>

        <div className="modal-grid">
          {/* Left Column: Photos Carousel & Details */}
          <div className="modal-details-col">
            {/* Gallery Carousel */}
            <div className="modal-carousel">
              <img 
                src={photosList[activePhotoIndex]} 
                alt={`${hotel.name} gallery image ${activePhotoIndex + 1}`} 
                className="modal-carousel-img"
              />
              
              {photosList.length > 1 && (
                <>
                  <button className="carousel-btn prev" onClick={handlePrevPhoto}>
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <button className="carousel-btn next" onClick={handleNextPhoto}>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                  <div className="carousel-dots">
                    {photosList.map((_, idx) => (
                      <span 
                        key={idx} 
                        className={`carousel-dot ${idx === activePhotoIndex ? 'active' : ''}`}
                        onClick={() => setActivePhotoIndex(idx)}
                      ></span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Hotel Meta Info */}
            <div className="modal-meta-info">
              <span className="modal-location-badge">
                <i className="bi bi-geo-alt-fill me-1"></i> {hotel.location}
              </span>
              <h2 className="modal-hotel-title">{hotel.name}</h2>
              <div className="modal-rating-row">
                <StarRating rating={hotel.rating} showScore={true} />
              </div>
            </div>

            {/* Description */}
            <div className="modal-desc-section">
              <h3>About this hotel</h3>
              <p>{hotel.description}</p>
            </div>
          </div>

          {/* Right Column: Dynamic Booking Card */}
          <div className="modal-booking-col">
            <div className="booking-card">
              {isBooked ? (
                <div className="booking-success-animation text-center">
                  <div className="success-icon-wrapper">
                    <i className="bi bi-check-circle-fill text-success"></i>
                  </div>
                  <h4 className="mt-3">Booking Confirmed!</h4>
                  <p className="text-muted small">Your itinerary is saved under My Bookings</p>
                </div>
              ) : (
                <form onSubmit={handleBookNow}>
                  <div className="booking-price-header">
                    <div>
                      <span className="price-num">₹{parseFloat(hotel.price).toLocaleString('en-IN')}</span>
                      <span className="price-unit"> / night</span>
                    </div>
                  </div>

                  <hr className="divider" />

                  {bookingError && (
                    <div className="alert alert-danger-custom">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {bookingError}
                    </div>
                  )}

                  <div className="form-group mb-3">
                    <label htmlFor="guestNameInput">Primary Guest Name</label>
                    <div className="input-with-icon">
                      <i className="bi bi-person input-icon"></i>
                      <input 
                        id="guestNameInput"
                        type="text" 
                        placeholder="John Doe" 
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        className="form-control-custom"
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className="form-group">
                        <label htmlFor="checkInInput">Check-In</label>
                        <input 
                          id="checkInInput"
                          type="date" 
                          min={new Date().toISOString().split('T')[0]}
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="form-control-custom"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="form-group">
                        <label htmlFor="checkOutInput">Check-Out</label>
                        <input 
                          id="checkOutInput"
                          type="date" 
                          min={checkIn || new Date().toISOString().split('T')[0]}
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="form-control-custom"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-4">
                    <label htmlFor="guestsSelect">Guests</label>
                    <div className="input-with-icon">
                      <i className="bi bi-people input-icon"></i>
                      <select 
                        id="guestsSelect"
                        value={guests} 
                        onChange={(e) => setGuests(parseInt(e.target.value))}
                        className="form-control-custom select-custom"
                      >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Calculations breakdown */}
                  {bookingDetails.nights > 0 && (
                    <div className="price-breakdown">
                      <div className="breakdown-row">
                        <span>₹{parseFloat(hotel.price).toLocaleString('en-IN')} x {bookingDetails.nights} night{bookingDetails.nights > 1 ? 's' : ''}</span>
                        <span>₹{bookingDetails.subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="breakdown-row">
                        <span>Resort Service Fee (8%)</span>
                        <span>₹{bookingDetails.serviceFee.toLocaleString('en-IN')}</span>
                      </div>
                      <hr className="divider-dashed" />
                      <div className="breakdown-row total">
                        <span>Total (incl. taxes)</span>
                        <span>₹{bookingDetails.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="btn-book-submit mt-3"
                  >
                    <i className="bi bi-lightning-charge-fill me-2"></i> Book Instant Stay
                  </button>

                  <p className="text-center text-muted small mt-2">You won't be charged yet</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
