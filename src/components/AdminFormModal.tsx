import React, { useState, useEffect } from 'react';
import type { Hotel } from '../services/api';

interface AdminFormModalProps {
  hotel?: Hotel; // If provided, we are editing. Otherwise, creating.
  onClose: () => void;
  onSubmit: (hotelData: Omit<Hotel, 'id'> | Partial<Hotel>) => void;
  isSubmitting: boolean;
}

export const AdminFormModal: React.FC<AdminFormModalProps> = ({
  hotel,
  onClose,
  onSubmit,
  isSubmitting
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [rating, setRating] = useState('4.0');
  const [location, setLocation] = useState('Mumbai');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [photosInput, setPhotosInput] = useState('');
  const [error, setError] = useState('');

  const cities = [
    'Ahmedabad', 'Bengaluru', 'Chennai', 'Delhi', 'Goa', 
    'Gurgaon', 'Hyderabad', 'Jaipur', 'Kolkata', 'Mumbai', 
    'Noida', 'Pune'
  ];

  useEffect(() => {
    if (hotel) {
      setName(hotel.name);
      setPrice(hotel.price);
      setRating(String(hotel.rating));
      setLocation(hotel.location);
      setDescription(hotel.description);
      setThumbnail(hotel.thumbnail);
      setPhotosInput(hotel.photos ? hotel.photos.join('\n') : '');
    } else {
      // Set defaults for a new hotel
      setName('');
      setPrice('3500.00');
      setRating('4.0');
      setLocation('Mumbai');
      setDescription('');
      // Use unsplash template for convenience
      setThumbnail('https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080');
      setPhotosInput([
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
      ].join('\n'));
    }
  }, [hotel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!name.trim()) return setError('Hotel name is required.');
    if (!price || parseFloat(price) <= 0) return setError('Please enter a valid price greater than 0.');
    
    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating) || parsedRating < 1.0 || parsedRating > 5.0) {
      return setError('Rating must be a number between 1.0 and 5.0.');
    }
    
    if (!thumbnail.trim()) return setError('Thumbnail URL is required.');
    if (!description.trim()) return setError('Description is required.');

    // Process photo URLs
    const photos = photosInput
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    const payload = {
      name: name.trim(),
      price: parseFloat(price).toFixed(2),
      rating: parsedRating,
      location,
      description: description.trim(),
      thumbnail: thumbnail.trim(),
      photos: photos.length > 0 ? photos : [thumbnail.trim()]
    };

    onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-wrapper admin-form-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="form-modal-header">
          <h2>{hotel ? 'Edit Hotel Details' : 'Add New Hotel'}</h2>
          <button className="modal-close-btn-inline" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-form">
          {error && (
            <div className="alert alert-danger-custom mb-3">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          <div className="row g-3">
            {/* Hotel Name */}
            <div className="col-md-8">
              <div className="form-group">
                <label htmlFor="hotelNameInput">Hotel Name *</label>
                <input 
                  id="hotelNameInput"
                  type="text" 
                  className="form-control-custom"
                  placeholder="e.g. Hotel Grand Majestic"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* City Location */}
            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="hotelLocationSelect">Location *</label>
                <select 
                  id="hotelLocationSelect"
                  className="form-control-custom select-custom"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Per Night */}
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="hotelPriceInput">Price per Night (₹) *</label>
                <input 
                  id="hotelPriceInput"
                  type="number" 
                  step="0.01"
                  min="1"
                  className="form-control-custom"
                  placeholder="e.g. 4500.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Rating */}
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="hotelRatingInput">Rating (1.0 - 5.0) *</label>
                <input 
                  id="hotelRatingInput"
                  type="number" 
                  step="0.1"
                  min="1"
                  max="5"
                  className="form-control-custom"
                  placeholder="e.g. 4.5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Thumbnail URL */}
            <div className="col-12">
              <div className="form-group">
                <label htmlFor="hotelThumbnailInput">Thumbnail Image URL *</label>
                <input 
                  id="hotelThumbnailInput"
                  type="url" 
                  className="form-control-custom"
                  placeholder="https://images.unsplash.com/..."
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Additional Photo Gallery URLs */}
            <div className="col-12">
              <div className="form-group">
                <label htmlFor="hotelPhotosInput">Additional Photo URLs (One URL per line)</label>
                <textarea 
                  id="hotelPhotosInput"
                  rows={3}
                  className="form-control-custom text-area-custom"
                  placeholder="https://images.unsplash.com/photo-1&#10;https://images.unsplash.com/photo-2"
                  value={photosInput}
                  onChange={(e) => setPhotosInput(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="col-12">
              <div className="form-group">
                <label htmlFor="hotelDescInput">Detailed Description *</label>
                <textarea 
                  id="hotelDescInput"
                  rows={4}
                  className="form-control-custom text-area-custom"
                  placeholder="Tell potential guests about the amenities, spa, dining, beach views..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-modal-footer mt-4">
            <button 
              type="button" 
              className="btn-form-cancel" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-form-submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small me-2"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-arrow-up-fill me-2"></i>
                  {hotel ? 'Update Hotel' : 'Publish Hotel'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
