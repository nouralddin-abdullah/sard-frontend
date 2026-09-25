import { Navigate, useParams } from "react-router-dom";

// This page used to show hard-coded sample supporters. The real ranking (from
// GET /api/gift/novel/{novelId}/top-supporters) is the supporters page, so old links land there.
const NovelLeaderboardPage = () => {
  const { novelSlug } = useParams();
  return <Navigate to={`/novel/${encodeURIComponent(novelSlug)}/supporters`} replace />;
};

export default NovelLeaderboardPage;
