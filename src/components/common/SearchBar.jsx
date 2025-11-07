import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useSearchSuggestions } from "../../hooks/search/useSearchSuggestions";

const SearchBar = ({ className = "" }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const { data: suggestions = [], isLoading } = useSearchSuggestions(debouncedQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.trim().length >= 2);
  };

  const handleSuggestionClick = (slug) => {
    navigate(`/novel/${slug}`);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleShowMoreResults = () => {
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setShowSuggestions(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setShowSuggestions(false);
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSearch}>
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث في سرد"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
            className="noto-sans-arabic-extrabold w-full bg-white rounded-full px-6 py-3 pr-12 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4A9EFF]"
            dir="rtl"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && debouncedQuery.trim().length >= 3 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#2C2C2C] rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-700">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400 noto-sans-arabic-medium">
              جاري البحث...
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {/* Suggestions List */}
              <div className="max-h-[400px] overflow-y-auto">
                {suggestions.map((novel) => (
                  <button
                    key={novel.id}
                    onClick={() => handleSuggestionClick(novel.slug)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-[#3C3C3C] transition-colors text-right"
                  >
                    <img
                      src={novel.coverImageUrl}
                      alt={novel.title}
                      className="w-12 h-16 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white noto-sans-arabic-bold text-sm line-clamp-2">
                        {novel.title}
                      </h4>
                    </div>
                  </button>
                ))}
              </div>

              {/* Show More Results Button */}
              <button
                onClick={handleShowMoreResults}
                className="w-full p-3 bg-[#4A9EFF] text-white noto-sans-arabic-bold hover:bg-[#3A8EEF] transition-colors border-t border-gray-700"
              >
                عرض المزيد من النتائج
              </button>
            </>
          ) : (
            <div className="p-4 text-center text-gray-400 noto-sans-arabic-medium">
              لا توجد نتائج
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
