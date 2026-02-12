import React, { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "../components/common/Navbar";
import axios from "axios";
import {
  Search, Briefcase, MapPin, DollarSign, Clock, Filter,
  Bookmark, ExternalLink, Loader2, ArrowLeft, Building2, CheckCircle,
  Star, Users, Zap, Check, X, Sparkles
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const observerRef = useRef();
  const navigate = useNavigate();

  const fetchJobs = useCallback(async (pageNum = 1, append = false) => {
    if (loading) return;

    try {
      setLoading(pageNum === 1);
      setError(null);

      console.log(`🔍 Fetching page ${pageNum}...`);

      const response = await axios.get(`http://localhost:5000/api/jobs/public?page=${pageNum}&limit=12`, {
        timeout: 10000
      });

      console.log("✅ API SUCCESS:", response.data);

      let newJobs = [];
      if (response.data.jobs && Array.isArray(response.data.jobs)) {
        newJobs = response.data.jobs;
      } else if (response.data.success && Array.isArray(response.data.jobs)) {
        newJobs = response.data.jobs;
      } else if (Array.isArray(response.data)) {
        newJobs = response.data;
      } else {
        newJobs = [];
      }

      console.log("📊 New jobs found:", newJobs.length);

      const validJobs = newJobs.filter(job =>
        job && job._id && job.title
      );

      console.log("✅ Valid jobs:", validJobs.length);

      if (append && validJobs.length > 0) {
        setJobs(prev => {
          const existingIds = new Set(prev.map(j => j._id));
          const uniqueNewJobs = validJobs.filter(job => !existingIds.has(job._id));
          return [...prev, ...uniqueNewJobs];
        });
      } else {
        setJobs(validJobs);
      }

      setHasMore(validJobs.length === 12);

    } catch (err) {
      console.error("❌ Fetch error:", err.response?.status, err.message);

      if (err.code !== 'ECONNABORTED' && !error) {
        try {
          console.log("🔄 Trying fallback: /api/jobs");
          const fallback = await axios.get("http://localhost:5000/api/jobs", { timeout: 5000 });
          const fallbackJobs = fallback.data.jobs || fallback.data || [];
          setJobs(fallbackJobs.filter(job => job.status === "approved"));
          toast.success("✅ Loaded via fallback endpoint");
        } catch (fallbackErr) {
          setError("No live jobs available. Check if recruiters have posted approved jobs.");
          toast.error("No jobs found - create some approved jobs first!");
        }
      } else {
        setError("Backend not responding at localhost:5000");
      }
    } finally {
      setLoading(false);
    }
  }, [loading, error]);

  const lastJobRef = useCallback((node) => {
    if (loading || !hasMore) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchJobs(nextPage, true);
      }
    }, { threshold: 0.1 });

    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, page, fetchJobs]);

  useEffect(() => {
    let filtered = jobs;

    if (searchTerm.trim()) {
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.business?.businessProfile?.businessName || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLocation !== "All") {
      filtered = filtered.filter(job => job.location === selectedLocation);
    }

    if (selectedType !== "All") {
      filtered = filtered.filter(job => job.type === selectedType);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, selectedLocation, selectedType, jobs]);

  useEffect(() => {
    fetchJobs(1, false);
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchJobs(page, true);
    }
  }, [page]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedLocation("All");
    setSelectedType("All");
    setPage(1);
    setJobs([]);
    setHasMore(true);
  };

  const locations = Array.from(new Set(jobs.map(job => job.location))).sort().filter(Boolean);
  const types = Array.from(new Set(jobs.map(job => job.type))).sort().filter(Boolean);

  const formatSalary = (salary) => {
    if (!salary || salary === "") return "Negotiable";
    if (salary.includes("-")) return `₹${salary}`;
    return `₹${salary}+`;
  };

  const hasActiveFilters = searchTerm || selectedLocation !== "All" || selectedType !== "All";

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <Navbar title="Find Jobs" />

      {/* Hero Search Section */}
      <div className="bg-gradient-to-b from-[#0f172a] to-[#1e293b] pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            {filteredJobs.length} open positions
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Find your next opportunity
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Discover verified roles from top companies — updated in real time.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 p-2 flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Job title, company, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-[15px] bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 placeholder:text-slate-400 transition-all"
              />
            </div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-3.5 text-[15px] bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-slate-700 cursor-pointer min-w-[160px]"
            >
              <option>All</option>
              {locations.map(loc => <option key={loc}>{loc}</option>)}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3.5 text-[15px] bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-slate-700 cursor-pointer min-w-[140px]"
            >
              <option>All</option>
              {types.map(type => <option key={type}>{type}</option>)}
            </select>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-5 py-3.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-6xl mx-auto px-4 -mt-6 mb-10">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 px-6 py-3.5 flex flex-wrap items-center gap-6 text-sm">
          <span className="text-slate-500">
            <span className="font-semibold text-slate-900">{filteredJobs.length}</span> jobs
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">
            <span className="font-semibold text-slate-900">{locations.length}</span> locations
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">
            <span className="font-semibold text-slate-900">{types.length}</span> types
          </span>
          <span className="ml-auto text-emerald-600 font-medium flex items-center gap-1.5 text-xs">
            <CheckCircle className="w-3.5 h-3.5" />
            Verified employers
          </span>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        {loading && filteredJobs.length === 0 ? (
          <div className="text-center py-32">
            <Loader2 className="animate-spin mx-auto mb-4 w-10 h-10 text-emerald-500" />
            <p className="text-slate-500 text-lg">Finding opportunities...</p>
          </div>
        ) : error && filteredJobs.length === 0 ? (
          <div className="text-center py-28 max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">{error}</h3>
            <p className="text-slate-500 mb-8">Ensure your backend is running and jobs are approved.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Reload
              </button>
              <button
                onClick={() => fetchJobs(1, false)}
                className="px-6 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-28 max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No jobs match your search</h3>
            <p className="text-slate-500 mb-8">Try different keywords or clear your filters.</p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredJobs.map((job, index) => {
              const isLast = index === filteredJobs.length - 1;
              return (
                <article
                  key={job._id}
                  ref={isLast ? lastJobRef : null}
                  className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-md uppercase tracking-wide">
                        {job.type}
                      </span>
                      <span className="px-2.5 py-1 bg-sky-50 text-sky-700 text-[11px] font-semibold rounded-md uppercase tracking-wide flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse" />
                        Live
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-bold text-slate-900 mb-3 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {job.title}
                    </h2>

                    {/* Company Row */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 text-sm truncate">
                          {job.company || job.business?.businessProfile?.businessName || job.business?.businessProfile?.companyName || "Direct Hire"}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </div>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-5">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {job.skills?.length || 0} skills
                      </span>
                    </div>

                    {/* Salary */}
                    {job.salary && (
                      <div className="flex items-center gap-2.5 p-3 bg-amber-50/80 rounded-xl mb-5 border border-amber-100/60">
                        <DollarSign className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                          <span className="text-base font-bold text-slate-900">{formatSalary(job.salary)}</span>
                          <span className="text-xs text-slate-500 ml-1.5">/ year</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2.5 pt-2">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="flex-1 bg-slate-900 hover:bg-emerald-600 text-white text-sm font-semibold py-3 px-4 rounded-xl text-center transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        View Details
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-emerald-600 rounded-xl transition-all duration-200 group/save">
                        <Bookmark className="w-5 h-5 group-hover/save:fill-current transition-all" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {hasMore && jobs.length > 0 && (
          <div className="text-center py-12">
            <Loader2 className="animate-spin mx-auto mb-3 w-6 h-6 text-emerald-500" />
            <p className="text-sm text-slate-400">Loading more...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
