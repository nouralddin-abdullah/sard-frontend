import React from "react";
import Header from "../../components/common/Header";
import LibraryReadingHistory from "../../components/profile/LibraryReadingHistory";
import PageMeta from "../../components/common/PageMeta";

const LibraryPage = () => {
  return (
    <div className="min-h-screen bg-[#2C2C2C]">
      <PageMeta title="مكتبتي | سرد" robots="noindex" />
      <Header />
      <LibraryReadingHistory />
    </div>
  );
};

export default LibraryPage;
