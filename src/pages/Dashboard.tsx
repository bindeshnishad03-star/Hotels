import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import type { Hotel, GetHotelsParams } from '../services/api';
import { StarRating } from '../components/StarRating';
import { Loader } from '../components/Loader';

interface DashboardProps {
  onSelectHotel: (hotel: Hotel) => void;
}

const CITIES = [
  'Ahmedabad', 'Bengaluru', 'Chennai', 'Delhi', 'Goa', 
  'Gurgaon', 'Hyderabad', 'Jaipur', 'Kolkata', 'Mumbai', 
  'Noida', 'Pune'
];

// Aesthetic unsplash photos for the hero carousel
const HERO_PHOTOS = [
  "https://images.unsplash.com/photo-1551918120-9739cb430c6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400",
  "https://images.unsplash.com/photo-1576354302919-96748cb8299e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400"
];

export const Dashboard: React.FC<DashboardProps> = ({ onSelectHotel }) => {
  // Filters & State
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(12000);
  const [minRating, setMinRating] = useState<number>(1.0);
  const [orderBy, setOrderBy] = useState('-rating'); // Default: Rating high to low
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 6; // 6 items per page for clean grid representation
  const [totalCount, setTotalCount] = useState(0);

  // Hero carousel index
  const [heroIdx, setHeroIdx] = useState(0);

  // Auto scroll carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % HERO_PHOTOS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Fetch hotels callback
  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError('');
    
    const params: GetHotelsParams = {
      limit,
      skip: currentPage * limit,
      order_by: orderBy,
    };

    if (search.trim()) params.search = search.trim();
    if (location) params.location = location;
    if (minPrice > 0) params.min_price = minPrice;
    if (maxPrice < 12000) params.max_price = maxPrice;
    if (minRating > 1.0) params.min_rating = minRating;

    try {
      const response = await api.getHotels(params);
      setHotels(response.data);
      setTotalCount(response.count);
    } catch (err: any) {
      setError(err.message || 'Could not fetch hotels list. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, location, minPrice, maxPrice, minRating, orderBy, search]);

  // Fetch on parameter change
  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  // Reset page when filters change
  const handleFilterChange = () => {
    setCurrentPage(0);
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setMinPrice(0);
    setMaxPrice(12000);
    setMinRating(1.0);
    setOrderBy('-rating');
    setCurrentPage(0);
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-slides">
          {HERO_PHOTOS.map((photo, idx) => (
            <div 
              key={idx} 
              className={`hero-slide-img ${idx === heroIdx ? 'active' : ''}`}
              style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5)), url(${photo})` }}
            />
          ))}
        </div>
        <div className="hero-overlay-content">
          <h1>Find Your Next Premium Stay</h1>
          <p>Explore handpicked luxury hotels across major destinations at unbeatable prices.</p>
          
          {/* Quick Search Bar */}
          <div className="hero-search-box">
            <i className="bi bi-search search-bar-icon"></i>
            <input 
              type="text" 
              placeholder="Search by hotel name or keyword..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleFilterChange();
              }}
              className="hero-search-input"
            />
            {search && (
              <button 
                className="clear-search-btn"
                onClick={() => { setSearch(''); handleFilterChange(); }}
                aria-label="Clear search"
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Discover Section */}
      <div className="container py-5">
        
        {/* City Quick Badges */}
        <div className="location-badges-section mb-4">
          <h3 className="section-title text-center mb-3">
            <i className="bi bi-compass-fill text-accent me-2"></i>Filter by Location
          </h3>
          <div className="badges-scroller">
            <button 
              className={`badge-btn ${location === '' ? 'active' : ''}`}
              onClick={() => { setLocation(''); handleFilterChange(); }}
            >
              All Cities
            </button>
            {CITIES.map(city => (
              <button 
                key={city}
                className={`badge-btn ${location === city ? 'active' : ''}`}
                onClick={() => { setLocation(city); handleFilterChange(); }}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <div className="row g-4">
          {/* Filter Sidebar */}
          <div className="col-lg-3">
            <div className="filter-sidebar">
              <div className="sidebar-header">
                <h5><i className="bi bi-sliders me-2"></i>Filter Properties</h5>
                <button className="reset-filters-link" onClick={handleResetFilters}>
                  Clear All
                </button>
              </div>
              
              <hr className="divider" />

              {/* Price Filter */}
              <div className="filter-group mb-4">
                <label className="filter-label">Max Price Per Night</label>
                <div className="price-slider-wrapper">
                  <input 
                    type="range" 
                    min="1000" 
                    max="12000" 
                    step="500"
                    value={maxPrice} 
                    onChange={(e) => {
                      setMaxPrice(parseInt(e.target.value));
                      handleFilterChange();
                    }}
                    className="slider-custom"
                  />
                  <div className="price-slider-labels mt-2">
                    <span>Min: ₹1,000</span>
                    <span className="text-accent fw-bold">Up to: ₹{maxPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="filter-group mb-4">
                <label className="filter-label" htmlFor="minRatingSelect">Minimum Guest Rating</label>
                <select 
                  id="minRatingSelect"
                  className="form-control-custom select-custom"
                  value={minRating}
                  onChange={(e) => {
                    setMinRating(parseFloat(e.target.value));
                    handleFilterChange();
                  }}
                >
                  <option value="1.0">Show All Ratings</option>
                  <option value="3.0">★ 3.0 & above</option>
                  <option value="3.5">★ 3.5 & above</option>
                  <option value="4.0">★ 4.0 & above</option>
                  <option value="4.5">★ 4.5 & above</option>
                </select>
              </div>

              {/* Sorting */}
              <div className="filter-group mb-2">
                <label className="filter-label" htmlFor="sortBySelect">Sort Results By</label>
                <select 
                  id="sortBySelect"
                  className="form-control-custom select-custom"
                  value={orderBy}
                  onChange={(e) => {
                    setOrderBy(e.target.value);
                    handleFilterChange();
                  }}
                >
                  <option value="-rating">Rating: High to Low</option>
                  <option value="rating">Rating: Low to High</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="name">Name: Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hotels Grid */}
          <div className="col-lg-9">
            {loading ? (
              <Loader message="Fetching available hotels..." />
            ) : error ? (
              <div className="error-card text-center p-5">
                <i className="bi bi-wifi-off text-danger display-4 mb-3"></i>
                <h4>Connection Error</h4>
                <p className="text-muted">{error}</p>
                <button className="btn btn-accent mt-3" onClick={fetchHotels}>
                  Retry Connection
                </button>
              </div>
            ) : hotels.length === 0 ? (
              <div className="no-results-card text-center p-5">
                <i className="bi bi-emoji-frown text-muted display-4 mb-3"></i>
                <h4>No Hotels Found</h4>
                <p className="text-muted">We couldn't find any properties matching your current query details.</p>
                <button className="btn btn-accent mt-3" onClick={handleResetFilters}>
                  Clear Search Filters
                </button>
              </div>
            ) : (
              <>
                <div className="results-header mb-3">
                  <p className="results-count">
                    Showing <strong>{hotels.length}</strong> of <strong>{totalCount}</strong> matching luxury stays
                  </p>
                </div>

                <div className="row g-4">
                  {hotels.map((hotel) => (
                    <div className="col-md-6 col-xxl-4" key={hotel.id}>
                      <div className="hotel-card-v2" onClick={() => onSelectHotel(hotel)}>
                        <div className="hotel-card-image-wrapper">
                          <img 
                            src={hotel.thumbnail || "https://images.unsplash.com/photo-1551918120-9739cb430c6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"} 
                            alt={hotel.name} 
                            className="hotel-card-image"
                          />
                          <span className="hotel-card-location">
                            <i className="bi bi-geo-alt-fill me-1"></i> {hotel.location}
                          </span>
                        </div>
                        <div className="hotel-card-content">
                          <h4 className="hotel-card-title">{hotel.name}</h4>
                          <div className="hotel-card-rating">
                            <StarRating rating={hotel.rating} showScore={true} />
                          </div>
                          <p className="hotel-card-desc">
                            {hotel.description.length > 100 
                              ? `${hotel.description.slice(0, 100)}...` 
                              : hotel.description}
                          </p>
                          <div className="hotel-card-footer">
                            <div className="price-col">
                              <span className="price-val">₹{parseFloat(hotel.price).toLocaleString('en-IN')}</span>
                              <span className="price-sub"> / night</span>
                            </div>
                            <span className="btn-view-details">
                              Details <i className="bi bi-arrow-right-short"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="pagination-wrapper mt-5">
                    <button 
                      className="pagination-btn prev"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    >
                      <i className="bi bi-chevron-left me-1"></i> Previous
                    </button>
                    
                    <div className="pagination-pages">
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button 
                          key={idx}
                          className={`pagination-page-num ${idx === currentPage ? 'active' : ''}`}
                          onClick={() => setCurrentPage(idx)}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    <button 
                      className="pagination-btn next"
                      disabled={currentPage === totalPages - 1}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    >
                      Next <i className="bi bi-chevron-right ms-1"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
