import React from "react";
import NotFoundPage from "../../components/common/NotFoundPage";
import PageMeta from "../../components/common/PageMeta";

const GlobalNotFoundPage = () => {
  // The app answers every unknown URL with 200, so say "not a page" to search engines that run it.
  return (
    <>
      <PageMeta title="الصفحة غير موجودة | سرد" robots="noindex" />
      <NotFoundPage
        title="الصفحة غير موجودة"
        message="عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها أو حذفها."
        showBackButton={true}
        showHomeButton={true}
        showSearchButton={true}
      />
    </>
  );
};

export default GlobalNotFoundPage;
