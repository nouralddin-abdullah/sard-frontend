import React from "react";
import Header from "../../components/common/Header";
import LibraryReadingHistory from "../../components/profile/LibraryReadingHistory";

const LibraryPage = () => {
  return (
    <div className="min-h-screen bg-[#2C2C2C]">
      <Header />
      <LibraryReadingHistory />
    </div>
  );
};

export default LibraryPage;
