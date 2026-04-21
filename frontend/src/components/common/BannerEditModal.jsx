import React, { useState } from "react";

const BannerEditModal = ({ isOpen, banner, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    imageUrl: banner?.imageUrl || "",
    altText: banner?.altText || "Navbar Banner",
    height: banner?.height || "75px",
    borderRadius: banner?.borderRadius || "8px",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.imageUrl.trim()) {
      setError("Image URL is required");
      return;
    }

    try {
      await onSave(formData);
      setSuccess("Banner updated successfully!");
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to update banner");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bem-overlay" onClick={onClose}>
      <style>{`
        .bem-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: bemFadeIn 0.3s ease;
        }

        @keyframes bemFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .bem-modal {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: bemSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes bemSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .bem-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(to right, #f8fafc, white);
        }

        .bem-title {
          font-size: 20px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.3px;
        }

        .bem-close-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #f1f5f9;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.15s;
          flex-shrink: 0;
        }

        .bem-close-btn:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .bem-body {
          padding: 32px 24px;
        }

        .bem-field {
          margin-bottom: 24px;
        }

        .bem-field:last-child {
          margin-bottom: 0;
        }

        .bem-label {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
          letter-spacing: 0.2px;
        }

        .bem-input,
        .bem-textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .bem-input:focus,
        .bem-textarea:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .bem-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .bem-preview {
          margin-top: 16px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
        }

        .bem-preview-title {
          font-size: 12px;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }

        .bem-preview-img {
          height: 75px;
          width: auto;
          object-fit: contain;
          border-radius: 8px;
          background: white;
          border: 1px solid #e5e7eb;
        }

        .bem-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .bem-alert {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 16px;
          animation: bemAlertSlide 0.3s ease;
        }

        @keyframes bemAlertSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .bem-alert.error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .bem-alert.success {
          background: #f0fdf4;
          color: #15803d;
          border: 1px solid #86efac;
        }

        .bem-footer {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
          background: #fafafa;
        }

        .bem-btn {
          flex: 1;
          padding: 12px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-family: inherit;
          letter-spacing: 0.2px;
        }

        .bem-btn-cancel {
          background: white;
          color: #374151;
          border: 1.5px solid #d1d5db;
        }

        .bem-btn-cancel:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .bem-btn-save {
          background: linear-gradient(135deg, #16a34a 0%, #10b981 100%);
          color: white;
          box-shadow: 0 3px 12px rgba(16, 185, 129, 0.3);
        }

        .bem-btn-save:hover:not(:disabled) {
          background: linear-gradient(135deg, #15803d 0%, #059669 100%);
          box-shadow: 0 5px 18px rgba(16, 185, 129, 0.4);
          transform: translateY(-2px);
        }

        .bem-btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .bem-loading {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: bemSpin 0.8s linear infinite;
        }

        @keyframes bemSpin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .bem-modal {
            width: 95%;
          }
          .bem-row {
            grid-template-columns: 1fr;
          }
          .bem-header {
            padding: 16px;
          }
          .bem-body {
            padding: 20px 16px;
          }
          .bem-footer {
            padding: 16px;
          }
        }
      `}</style>

      <div className="bem-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bem-header">
          <h2 className="bem-title">Edit Navbar Banner</h2>
          <button className="bem-close-btn" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bem-body">
            {error && <div className="bem-alert error">{error}</div>}
            {success && <div className="bem-alert success">{success}</div>}

            <div className="bem-field">
              <label className="bem-label">Image URL *</label>
              <input
                type="text"
                name="imageUrl"
                className="bem-input"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/banner.jpg or /path/to/banner.jpg"
                required
              />
              {formData.imageUrl && (
                <div className="bem-preview">
                  <div className="bem-preview-title">Preview</div>
                  <img src={formData.imageUrl} alt={formData.altText} className="bem-preview-img" onError={(e) => { e.target.style.display = "none"; }} />
                </div>
              )}
            </div>

            <div className="bem-field">
              <label className="bem-label">Alt Text</label>
              <input
                type="text"
                name="altText"
                className="bem-input"
                value={formData.altText}
                onChange={handleChange}
                placeholder="Navbar Banner"
              />
            </div>

            <div className="bem-row">
              <div className="bem-field">
                <label className="bem-label">Height</label>
                <input
                  type="text"
                  name="height"
                  className="bem-input"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="75px"
                />
              </div>
              <div className="bem-field">
                <label className="bem-label">Border Radius</label>
                <input
                  type="text"
                  name="borderRadius"
                  className="bem-input"
                  value={formData.borderRadius}
                  onChange={handleChange}
                  placeholder="8px"
                />
              </div>
            </div>
          </div>

          <div className="bem-footer">
            <button type="button" className="bem-btn bem-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="bem-btn bem-btn-save" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="bem-loading"></span> Saving...
                </>
              ) : (
                "Save Banner"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerEditModal;
