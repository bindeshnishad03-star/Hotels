import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import type { Hotel } from '../services/api';
import { StarRating } from '../components/StarRating';
import { Loader } from '../components/Loader';
import { AdminFormModal } from '../components/AdminFormModal';

export const AdminPortal: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Search and Pagination
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 8; // 8 items in admin table

  // Modal Control
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getHotels({
        limit,
        skip: currentPage * limit,
        search: search.trim() || undefined,
        order_by: '-id' // show newest first
      });
      setHotels(response.data);
      setTotalCount(response.count);
    } catch (err: any) {
      setError(err.message || 'Could not load hotel records for management.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  // Debounce search/reset page
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(0);
  };

  const handleOpenAddModal = () => {
    setEditingHotel(undefined);
    setShowModal(true);
  };

  const handleOpenEditModal = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setShowModal(true);
  };

  const handleDeleteHotel = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}" from the database?`)) {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      try {
        await api.deleteHotel(id);
        setSuccessMsg(`Hotel "${name}" has been deleted successfully!`);
        // Refresh
        if (hotels.length === 1 && currentPage > 0) {
          setCurrentPage(prev => prev - 1);
        } else {
          fetchHotels();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err: any) {
        setError(err.message || 'Failed to delete hotel record.');
        setLoading(false);
      }
    }
  };

  const handleFormSubmit = async (payload: any) => {
    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');
    try {
      if (editingHotel) {
        // Edit Mode
        const updated = await api.updateHotel(editingHotel.id, payload);
        setSuccessMsg(`Hotel "${updated.name}" updated successfully!`);
      } else {
        // Add Mode
        const created = await api.createHotel(payload);
        setSuccessMsg(`Hotel "${created.name}" created successfully!`);
      }
      setShowModal(false);
      fetchHotels();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Failed to save hotel record. Please verify fields and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="admin-container container py-5">
      <div className="admin-header-row mb-5">
        <div>
          <h2 className="section-title text-start mb-1">
            <i className="bi bi-shield-lock-fill text-accent me-2"></i>Operator Portal
          </h2>
          <p className="text-muted mb-0">Manage existing inventory, review hotel details, publish new accommodations.</p>
        </div>
        <button className="btn-add-hotel" onClick={handleOpenAddModal}>
          <i className="bi bi-plus-circle-fill me-2"></i> Add New Property
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success-custom mb-4 dismissible">
          <div>
            <i className="bi bi-check-circle-fill me-2"></i>
            {successMsg}
          </div>
          <button className="btn-close-alert" onClick={() => setSuccessMsg('')}>
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger-custom mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* Control row */}
      <div className="admin-controls mb-4">
        <div className="search-box-admin">
          <i className="bi bi-search search-icon-admin"></i>
          <input 
            type="text" 
            placeholder="Quick search by name or city..."
            value={search}
            onChange={handleSearchChange}
            className="form-control-custom"
          />
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <Loader message="Fetching inventory data..." />
      ) : hotels.length === 0 ? (
        <div className="empty-bookings-card text-center p-5">
          <i className="bi bi-inbox text-muted display-4 mb-3"></i>
          <h4>No Inventory Records</h4>
          <p className="text-muted">No hotels found matching your filters. Try clearing your search query.</p>
          {search && (
            <button className="btn btn-accent mt-3" onClick={() => { setSearch(''); setCurrentPage(0); }}>
              Reset Search
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: '80px' }}>ID</th>
                <th scope="col" style={{ width: '100px' }}>Image</th>
                <th scope="col">Hotel Name</th>
                <th scope="col">Location</th>
                <th scope="col">Price / Night</th>
                <th scope="col">Rating</th>
                <th scope="col" className="text-center" style={{ width: '160px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((hotel) => (
                <tr key={hotel.id}>
                  <td className="hotel-id-col">#{hotel.id}</td>
                  <td>
                    <img 
                      src={hotel.thumbnail || "https://images.unsplash.com/photo-1551918120-9739cb430c6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=150"} 
                      alt={hotel.name} 
                      className="admin-table-thumb"
                    />
                  </td>
                  <td className="hotel-name-col">
                    <strong>{hotel.name}</strong>
                  </td>
                  <td>
                    <span className="location-badge-table">
                      <i className="bi bi-geo-alt-fill me-1 text-accent"></i>
                      {hotel.location}
                    </span>
                  </td>
                  <td className="price-col-table">
                    ₹{parseFloat(hotel.price).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <div className="admin-rating-cell">
                      <StarRating rating={hotel.rating} />
                      <span className="ms-2 text-muted">({hotel.rating})</span>
                    </div>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => handleOpenEditModal(hotel)}
                        title="Edit hotel"
                        aria-label={`Edit ${hotel.name}`}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDeleteHotel(hotel.id, hotel.name)}
                        title="Delete hotel"
                        aria-label={`Delete ${hotel.name}`}
                      >
                        <i className="bi bi-trash3-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-wrapper mt-4">
              <button 
                className="pagination-btn prev"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              >
                <i className="bi bi-chevron-left"></i> Previous
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
                Next <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Admin Form Modal */}
      {showModal && (
        <AdminFormModal
          hotel={editingHotel}
          onClose={() => setShowModal(false)}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
