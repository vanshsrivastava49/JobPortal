import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import axios from "axios";
import { Building2, MapPin, Phone, Star } from "lucide-react";

export default function Businesses() {
  const [biz, setBiz] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      // ✅ Fixed: Correct public endpoint
      const res = await axios.get("http://localhost:5000/api/profile/business/approved");
      setBiz(res.data);
    } catch (err) {
      console.error("Failed to fetch businesses:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Featured Businesses" />
        <div className="container" style={{ padding: "100px 0", textAlign: "center" }}>
          <div>Loading businesses...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Featured Businesses" />

      <div className="container">
        <div style={{ marginBottom: 30 }}>
          <h2 style={{ marginBottom: 10 }}>Discover Verified Businesses</h2>
          <p style={{ color: "#6b7280" }}>
            All businesses here have been verified by our admin team
          </p>
        </div>

        {biz.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <Building2 size={64} className="text-gray-400 mb-4" />
            <h3>No businesses found</h3>
            <p className="text-gray-600">Check back later for verified businesses.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
          }}>
            {biz.map((b) => (
              <div key={b._id} className="card hover-lift" style={{
                transition: "all 0.3s ease",
                cursor: "pointer",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                overflow: "hidden"
              }}>
                {/* Featured Image */}
                {b.businessProfile.images?.[0] ? (
                  <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
                    <img
                      src={b.businessProfile.images[0]}
                      alt={b.businessProfile.businessName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease"
                      }}
                    />
                    {/* Multiple images indicator */}
                    {b.businessProfile.images.length > 1 && (
                      <div style={{
                        position: "absolute",
                        bottom: 12,
                        right: 12,
                        background: "rgba(0,0,0,0.7)",
                        color: "white",
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        +{b.businessProfile.images.length - 1}
                      </div>
                    )}
                    {/* Verified Badge */}
                    <div style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      background: "#10b981",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}>
                      <Star size={14} fill="currentColor" />
                      Verified
                    </div>
                  </div>
                ) : (
                  <div style={{
                    width: "100%",
                    height: 200,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    position: "relative"
                  }}>
                    <Building2 size={48} />
                  </div>
                )}

                {/* Business Details */}
                <div style={{ padding: 24 }}>
                  <h3 style={{ 
                    marginBottom: 8, 
                    fontSize: 20, 
                    fontWeight: 700,
                    color: "#1f2937"
                  }}>
                    {b.businessProfile.businessName}
                  </h3>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{
                      background: "#dbeafe",
                      color: "#1e40af",
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 600
                    }}>
                      {b.businessProfile.category}
                    </div>
                  </div>

                  <p style={{ 
                    marginBottom: 16, 
                    color: "#4b5563", 
                    lineHeight: 1.6,
                    fontSize: 15
                  }}>
                    {b.businessProfile.description?.substring(0, 120)}...
                  </p>

                  {/* Contact Info */}
                  <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                    {b.businessProfile.contactDetails && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Phone size={16} color="#6b7280" />
                        <span style={{ fontSize: 14 }}>{b.businessProfile.contactDetails}</span>
                      </div>
                    )}
                    {b.businessProfile.address && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                        <MapPin size={16} color="#6b7280" />
                        <span style={{ 
                          fontSize: 14, 
                          color: "#6b7280",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {b.businessProfile.address}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button className="btn btn-primary" style={{ width: "100%" }}>
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
