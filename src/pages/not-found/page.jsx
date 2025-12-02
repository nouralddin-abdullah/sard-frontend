import React from "react";
import NotFoundPage from "../../components/common/NotFoundPage";

const GlobalNotFoundPage = () => {
  return (
    <NotFoundPage
      title="الصفحة غير موجودة"
      message="عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها أو حذفها."
      showBackButton={true}
      showHomeButton={true}
      showSearchButton={true}
    />
  );
};

export default GlobalNotFoundPage;
