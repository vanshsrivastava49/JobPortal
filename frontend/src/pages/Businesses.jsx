import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import axios from "axios";
import { Building2, MapPin, Phone, Star, ArrowRight, Search, ChevronDown, X } from "lucide-react";

export default function Businesses() {
  const [biz, setBiz] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredId, setHoveredId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".biz-dropdown-wrap")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/profile/business/approved");
      setBiz(res.data);
    } catch (err) {
      console.error("Failed to fetch businesses:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...new Set(biz.map(b => b.businessProfile?.category).filter(Boolean))];

  const filtered = biz.filter(b => {
    const matchSearch =
      b.businessProfile?.businessName?.toLowerCase().includes(search.toLowerCase()) ||
      b.businessProfile?.description?.toLowerCase().includes(search.toLowerCase()) ||
      b.businessProfile?.address?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || b.businessProfile?.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ background: "#f7f5f0", minHeight: "100vh", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .biz-hero {
          background: #fff;
          border-bottom: 1px solid #ede9e0;
          padding: 64px 0 48px;
          position: relative;
          overflow: visible;
        }

        .biz-hero::before {
          content: '';
          position: absolute;
          top: -80px;
          right: -80px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(22,163,74,0.06) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .biz-hero::after {
          content: '';
          position: absolute;
          bottom: -60px;
          left: 10%;
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .biz-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .biz-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .biz-label-dot {
          width: 6px;
          height: 6px;
          background: #16a34a;
          border-radius: 50%;
          animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .biz-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 800;
          color: #1a1a1a;
          line-height: 1.1;
          margin-bottom: 16px;
          letter-spacing: -1px;
        }

        .biz-heading span {
          color: #16a34a;
          position: relative;
          display: inline-block;
        }

        .biz-heading span::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #16a34a, #86efac);
          border-radius: 2px;
        }

        .biz-subheading {
          font-size: 17px;
          color: #6b6b6b;
          font-weight: 400;
          max-width: 480px;
          line-height: 1.6;
          margin-bottom: 40px;
        }

        .biz-controls {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          align-items: center;
        }

        .biz-search-wrap {
          position: relative;
          flex: 1;
          min-width: 240px;
          max-width: 400px;
        }

        .biz-search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .biz-search {
          width: 100%;
          padding: 13px 16px 13px 44px;
          border: 1.5px solid #e5e0d6;
          border-radius: 12px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          background: #faf9f7;
          color: #1a1a1a;
          outline: none;
          transition: all 0.2s;
        }

        .biz-search:focus {
          border-color: #16a34a;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(22,163,74,0.08);
        }

        .biz-search::placeholder { color: #b0a99a; }

        .biz-clear {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: #f0ede7;
          border: none;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #888;
        }

        /* Dropdown */
        .biz-dropdown-wrap {
          position: relative;
          min-width: 200px;
        }

        .biz-dropdown-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 13px 16px;
          border: 1.5px solid #e5e0d6;
          border-radius: 12px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          background: #faf9f7;
          color: #1a1a1a;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          width: 100%;
        }

        .biz-dropdown-trigger:hover,
        .biz-dropdown-trigger.open {
          border-color: #16a34a;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(22,163,74,0.08);
        }

        .biz-dropdown-trigger .chevron {
          color: #9ca3af;
          transition: transform 0.2s;
          flex-shrink: 0;
        }

        .biz-dropdown-trigger.open .chevron {
          transform: rotate(180deg);
          color: #16a34a;
        }

        .biz-dropdown-trigger .active-indicator {
          display: inline-block;
          width: 7px;
          height: 7px;
          background: #16a34a;
          border-radius: 50%;
          margin-right: 2px;
          flex-shrink: 0;
        }

        .biz-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #fff;
          border: 1.5px solid #e5e0d6;
          border-radius: 14px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
          z-index: 9999;
          overflow: hidden;
          animation: dropdown-in 0.18s cubic-bezier(0.25, 0.8, 0.25, 1);
          max-height: 280px;
          overflow-y: auto;
        }

        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .biz-dropdown-menu::-webkit-scrollbar {
          width: 4px;
        }
        .biz-dropdown-menu::-webkit-scrollbar-track {
          background: transparent;
        }
        .biz-dropdown-menu::-webkit-scrollbar-thumb {
          background: #e5e0d6;
          border-radius: 4px;
        }

        .biz-dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 16px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          color: #444;
          cursor: pointer;
          transition: background 0.15s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }

        .biz-dropdown-item:hover {
          background: #f0fdf4;
          color: #16a34a;
        }

        .biz-dropdown-item.active {
          background: #f0fdf4;
          color: #16a34a;
          font-weight: 600;
        }

        .biz-dropdown-item .check {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #16a34a;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .biz-dropdown-item .check::after {
          content: '';
          width: 5px;
          height: 9px;
          border: 2px solid #fff;
          border-top: none;
          border-left: none;
          transform: rotate(45deg) translateY(-1px);
          display: block;
        }

        .biz-dropdown-divider {
          height: 1px;
          background: #f0ece5;
          margin: 4px 0;
        }

        .biz-body {
          padding: 52px 0 80px;
        }

        .biz-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }

        .biz-count {
          font-size: 14px;
          color: #9c9485;
          font-weight: 500;
        }

        .biz-count strong { color: #1a1a1a; }

        .biz-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 28px;
        }

        .biz-card {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          border: 1.5px solid #ede9e0;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          cursor: pointer;
          position: relative;
          animation: card-in 0.5s ease both;
        }

        .biz-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 64px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06);
          border-color: #d4eddb;
        }

        @keyframes card-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .biz-card-img-wrap {
          position: relative;
          height: 210px;
          overflow: hidden;
          background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
        }

        .biz-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .biz-card:hover .biz-card-img {
          transform: scale(1.06);
        }

        .biz-card-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 50%);
        }

        .biz-placeholder-img {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          color: #86efac;
        }

        .biz-verified-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(8px);
          color: #16a34a;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.3px;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }

        .biz-img-count {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .biz-card-body {
          padding: 24px;
        }

        .biz-card-cat {
          display: inline-block;
          background: #f0fdf4;
          color: #15803d;
          border: 1px solid #bbf7d0;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.3px;
          margin-bottom: 12px;
          text-transform: uppercase;
        }

        .biz-card-name {
          font-family: 'Playfair Display', serif;
          font-size: 21px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 10px;
          letter-spacing: -0.3px;
          line-height: 1.25;
        }

        .biz-card-desc {
          font-size: 14px;
          color: #6b6b6b;
          line-height: 1.65;
          margin-bottom: 18px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .biz-card-divider {
          height: 1px;
          background: #f0ece5;
          margin-bottom: 18px;
        }

        .biz-card-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .biz-card-meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #7a7268;
        }

        .biz-card-meta-item svg {
          flex-shrink: 0;
          color: #16a34a;
        }

        .biz-card-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 18px;
          background: #f7f5f0;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          transition: all 0.2s;
        }

        .biz-card-cta:hover {
          background: #16a34a;
          color: #fff;
        }

        .biz-card-cta:hover .cta-arrow {
          transform: translateX(4px);
          color: #fff;
        }

        .cta-arrow {
          transition: transform 0.2s;
          color: #16a34a;
        }

        /* Empty & Loading */
        .biz-empty {
          text-align: center;
          padding: 80px 24px;
          background: #fff;
          border-radius: 20px;
          border: 1.5px dashed #ddd8cf;
        }

        .biz-empty-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          background: #f7f5f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .biz-empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .biz-empty-desc {
          font-size: 15px;
          color: #9c9485;
        }

        .biz-loading {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 28px;
        }

        .biz-skeleton {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          border: 1.5px solid #ede9e0;
          animation: skeleton-pulse 1.6s ease-in-out infinite;
        }

        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }

        .biz-skeleton-img {
          height: 210px;
          background: linear-gradient(90deg, #f0ece5 25%, #e8e4dc 50%, #f0ece5 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .biz-skeleton-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .biz-skeleton-line {
          height: 14px;
          border-radius: 8px;
          background: linear-gradient(90deg, #f0ece5 25%, #e8e4dc 50%, #f0ece5 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @media (max-width: 768px) {
          .biz-container { padding: 0 20px; }
          .biz-hero { padding: 40px 0 32px; }
          .biz-controls { flex-direction: column; align-items: stretch; }
          .biz-search-wrap { max-width: 100%; }
          .biz-dropdown-wrap { width: 100%; }
          .biz-grid { grid-template-columns: 1fr; }
          .biz-meta-row { flex-direction: column; gap: 12px; align-items: flex-start; }
        }
      `}</style>

      <Navbar />

      {/* Hero Section */}
      <div className="biz-hero">
        <div className="biz-container">
          <div className="biz-label">
            <div className="biz-label-dot" />
            Verified & Live
          </div>
          <h1 className="biz-heading">
            Discover <span>Green</span><br />Businesses
          </h1>
          <p className="biz-subheading">
            Every business here has been carefully vetted and approved by our team. Explore opportunities that match your values.
          </p>

          <div className="biz-controls">
            {/* Search */}
            <div className="biz-search-wrap">
              <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
              <input
                className="biz-search"
                placeholder="Search businesses, locations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="biz-clear" onClick={() => setSearch("")}>
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="biz-dropdown-wrap">
              <button
                className={`biz-dropdown-trigger ${dropdownOpen ? "open" : ""}`}
                onClick={() => setDropdownOpen(prev => !prev)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {activeCategory !== "All" && <span className="active-indicator" />}
                  {activeCategory === "All" ? "All Categories" : activeCategory}
                </span>
                <ChevronDown size={16} className="chevron" />
              </button>

              {dropdownOpen && (
                <div className="biz-dropdown-menu">
                  {categories.map((cat, idx) => (
                    <React.Fragment key={cat}>
                      {idx === 1 && <div className="biz-dropdown-divider" />}
                      <button
                        className={`biz-dropdown-item ${activeCategory === cat ? "active" : ""}`}
                        onClick={() => {
                          setActiveCategory(cat);
                          setDropdownOpen(false);
                        }}
                      >
                        <span>{cat === "All" ? "All Categories" : cat}</span>
                        {activeCategory === cat && <span className="check" />}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="biz-body">
        <div className="biz-container">

          {loading ? (
            <div className="biz-loading">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="biz-skeleton" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="biz-skeleton-img" />
                  <div className="biz-skeleton-body">
                    <div className="biz-skeleton-line" style={{ width: '40%' }} />
                    <div className="biz-skeleton-line" style={{ width: '75%', height: 20 }} />
                    <div className="biz-skeleton-line" style={{ width: '90%' }} />
                    <div className="biz-skeleton-line" style={{ width: '65%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="biz-empty">
              <div className="biz-empty-icon">
                <Building2 size={36} color="#c9c3b8" />
              </div>
              <div className="biz-empty-title">
                {search ? `No results for "${search}"` : "No businesses yet"}
              </div>
              <p className="biz-empty-desc">
                {search ? "Try a different search term or category." : "Check back soon — verified businesses will appear here."}
              </p>
              {(search || activeCategory !== "All") && (
                <button
                  onClick={() => { setSearch(""); setActiveCategory("All"); }}
                  style={{ marginTop: 20, padding: '10px 24px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="biz-meta-row">
                <p className="biz-count">
                  Showing <strong>{filtered.length}</strong> verified {filtered.length === 1 ? "business" : "businesses"}
                  {activeCategory !== "All" && <> in <strong>{activeCategory}</strong></>}
                </p>
              </div>

              <div className="biz-grid">
                {filtered.map((b, idx) => (
                  <div
                    key={b._id}
                    className="biz-card"
                    style={{ animationDelay: `${idx * 0.07}s` }}
                    onMouseEnter={() => setHoveredId(b._id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Image */}
                    <div className="biz-card-img-wrap">
                      {b.businessProfile?.images?.[0] ? (
                        <>
                          <img
                            src={b.businessProfile.images[0]}
                            alt={b.businessProfile.businessName}
                            className="biz-card-img"
                          />
                          <div className="biz-card-img-overlay" />
                          {b.businessProfile.images.length > 1 && (
                            <div className="biz-img-count">
                              +{b.businessProfile.images.length - 1} photos
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="biz-placeholder-img">
                          <Building2 size={52} />
                        </div>
                      )}
                      <div className="biz-verified-badge">
                        <Star size={12} fill="currentColor" />
                        Verified
                      </div>
                    </div>

                    {/* Body */}
                    <div className="biz-card-body">
                      {b.businessProfile?.category && (
                        <div className="biz-card-cat">{b.businessProfile.category}</div>
                      )}

                      <h3 className="biz-card-name">
                        {b.businessProfile?.businessName}
                      </h3>

                      {b.businessProfile?.description && (
                        <p className="biz-card-desc">
                          {b.businessProfile.description}
                        </p>
                      )}

                      <div className="biz-card-divider" />

                      <div className="biz-card-meta">
                        {b.businessProfile?.contactDetails && (
                          <div className="biz-card-meta-item">
                            <Phone size={14} />
                            <span>{b.businessProfile.contactDetails}</span>
                          </div>
                        )}
                        {b.businessProfile?.address && (
                          <div className="biz-card-meta-item">
                            <MapPin size={14} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {b.businessProfile.address}
                            </span>
                          </div>
                        )}
                      </div>

                      <button className="biz-card-cta">
                        <span>View Details</span>
                        <ArrowRight size={16} className="cta-arrow" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}