import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { CheckCircle, XCircle, Clock, Building2, MapPin, Phone, Image } from "lucide-react";
import toast from "react-hot-toast";

export default function PendingBusinesses() {
  const { token } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/profile/business/pending", // ✅ Fixed endpoint
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBusinesses(res.data);
    } catch (err) {
      toast.error("Failed to fetch pending businesses");
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/profile/business/approve/${id}`, // ✅ Fixed endpoint
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Business approved successfully!");
      fetchBusinesses();
    } catch (err) {
      toast.error("Failed to approve business");
    }
  };

  const reject = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/profile/business/reject/${id}`, // ✅ Fixed endpoint
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Business rejected!");
      fetchBusinesses();
    } catch (err) {
      toast.error("Failed to reject business");
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Approve Businesses" />
        <div className="container" style={{ padding: "100px 0", textAlign: "center" }}>
          <div>Loading pending businesses...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Pending Businesses" />
      
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
          <h2>Pending Business Verification ({businesses.length})</h2>
          <button 
            className="btn btn-secondary" 
            onClick={fetchBusinesses}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>

        {businesses.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <Clock size={64} className="text-gray-400 mb-4" />
            <h3>No pending businesses</h3>
            <p className="text-gray-600">All businesses are approved or rejected.</p>
          </div>
        ) : (
          <div className="grid-2">
            {businesses.map((b) => (
              <div key={b._id} className="card" style={{ position: "relative" }}>
                {/* Status Badge */}
                <div style={{
                  position: "absolute",
                  top: 15,
                  right: 15,
                  background: "#f59e0b",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600
                }}>
                  PENDING
                </div>

                {/* Images */}
                {b.businessProfile.images?.length > 0 ? (
                  <div className="images-carousel">
                    {b.businessProfile.images.slice(0, 3).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Business"
                        style={{
                          width: "100%",
                          height: 200,
                          objectFit: "cover",
                          borderRadius: 12,
                          marginBottom: 15
                        }}
                      />
                    ))}
                    {b.businessProfile.images.length > 3 && (
                      <div style={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        background: "rgba(0,0,0,0.7)",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: 12,
                        fontSize: 12
                      }}>
                        +{b.businessProfile.images.length - 3}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    width: "100%",
                    height: 200,
                    background: "#f3f4f6",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 15,
                    color: "#9ca3af"
                  }}>
                    <Image size={48} />
                  </div>
                )}

                {/* Business Info */}
                <div>
                  <h3 style={{ marginBottom: 8, fontSize: 20 }}>
                    {b.businessProfile.businessName || "Unnamed Business"}
                  </h3>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Building2 size={18} color="#059669" />
                    <span style={{ color: "#6b7280", fontSize: 14 }}>
                      {b.businessProfile.category || "Uncategorized"}
                    </span>
                  </div>

                  <p style={{ 
                    marginBottom: 16, 
                    color: "#374151", 
                    lineHeight: 1.6,
                    minHeight: 60
                  }}>
                    {b.businessProfile.description || "No description provided"}
                  </p>

                  {/* Location & Contact */}
                  <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                    {b.businessProfile.address && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <MapPin size={16} color="#6b7280" />
                        <span style={{ fontSize: 14, color: "#6b7280" }}>
                          {b.businessProfile.address.substring(0, 50)}...
                        </span>
                      </div>
                    )}
                    {b.businessProfile.contactDetails && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Phone size={16} color="#6b7280" />
                        <span style={{ fontSize: 14, color: "#6b7280" }}>
                          {b.businessProfile.contactDetails}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ 
                    display: "flex", 
                    gap: 12, 
                    justifyContent: "flex-end" 
                  }}>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => reject(b._id)}
                      style={{ flex: 1 }}
                    >
                      <XCircle size={18} className="inline mr-2" />
                      Reject
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => approve(b._id)}
                      style={{ flex: 2 }}
                    >
                      <CheckCircle size={18} className="inline mr-2" />
                      Approve Business
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
