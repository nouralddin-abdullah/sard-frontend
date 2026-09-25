import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetGenresList } from "../../hooks/genre/useGetGenreList";
import { useCreateWork } from "../../hooks/work/useCreateWork";
import { toast } from "sonner";
import Button from "../../components/ui/button";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateGenre } from "../../utils/translate-genre";
import ProtectedRoute from "../../components/auth/protected-route";
import CoverPicker from "../../components/work/CoverPicker";
import { coverErrorKey } from "../../utils/cover-image";

const SUMMARY_MAX = 2000;

export default function CreateNovel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    genreIds: [], // Store genre IDs for backend
    cover: null, // { file, previewUrl, source } from CoverPicker
  });

  const [selectedGenres, setSelectedGenres] = useState([]); // Store full genre objects for UI

  const { data: genres } = useGetGenresList();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "summary" ? value.slice(0, SUMMARY_MAX) : value,
    }));
  };

  const handleGenreChange = (e) => {
    const selectedGenreId = parseInt(e.target.value);
    const selectedGenre = genres.find((genre) => genre.id === selectedGenreId);

    if (formData.genreIds.length >= 4) {
      toast.error(t("workPage.create.validation.maxGenres"));
      e.target.value = "";
      return;
    }

    if (selectedGenre && !formData.genreIds.includes(selectedGenreId)) {
      setFormData((prev) => ({
        ...prev,
        genreIds: [...prev.genreIds, selectedGenreId],
      }));
      setSelectedGenres((prev) => [...prev, selectedGenre]);
    }
    // Reset select to placeholder
    e.target.value = "";
  };

  const removeGenre = (genreIdToRemove) => {
    setFormData((prev) => ({
      ...prev,
      genreIds: prev.genreIds.filter((id) => id !== genreIdToRemove),
    }));
    setSelectedGenres((prev) =>
      prev.filter((genre) => genre.id !== genreIdToRemove)
    );
  };

  const { mutateAsync: createWork, isPending: isCreatingNovel } =
    useCreateWork();

  const genrePlaceholder = useMemo(
    () =>
      selectedGenres.length === 0
        ? t("workPage.create.form.genresPlaceholderEmpty")
        : t("workPage.create.form.genresPlaceholderAdd"),
    [selectedGenres.length, t]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error(t("workPage.create.validation.title"));
      return;
    }

    if (!formData.summary.trim()) {
      toast.error(t("workPage.create.validation.summary"));
      return;
    }

    if (formData.genreIds.length === 0) {
      toast.error(t("workPage.create.validation.genre"));
      return;
    }

    if (formData.genreIds.length > 4) {
      toast.error(t("workPage.create.validation.maxGenres"));
      return;
    }

    // The API needs a cover: every novel is stored with one.
    if (!formData.cover) {
      toast.error(t("workPage.create.validation.cover"));
      return;
    }

    const multipartForm = new FormData();
    multipartForm.append("Title", formData.title);
    multipartForm.append("Summary", formData.summary);
    for (let i = 0; i < formData.genreIds.length; i++) {
      multipartForm.append(`GenreIds[${i}]`, formData.genreIds[i]);
    }
    multipartForm.append("CoverImageUrl", formData.cover.file);

    try {
      const response = await createWork(multipartForm);

      toast.success(t("workPage.create.toast.success"));

      // Redirect to the newly created work's story studio (edit page)
      // API returns NovelId with capital N
      const workId = response?.novelId || response?.NovelId;
      if (workId) {
        navigate(`/dashboard/works/${workId}/edit`);
      } else {
        // Fallback to works list if no ID returned
        navigate('/dashboard/works');
      }
    } catch (error) {
      console.error(error);
      const coverKey = coverErrorKey(error?.code);
      toast.error(coverKey ? t(coverKey) : error?.message || t("workPage.create.toast.error"));
    }
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-zinc-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-zinc-100 mb-2">
            {t("workPage.create.hero.title")}
          </h1>
          <p className="text-zinc-400 text-lg">
            {t("workPage.create.hero.subtitle")}
          </p>
        </div>

        {/* Main Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-800 rounded-2xl p-8 shadow-2xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title Input */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-zinc-300 mb-2"
                >
                  {t("workPage.create.form.titleLabel")}
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={t("workPage.create.form.titlePlaceholder")}
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Genre Select */}
              <div>
                <label
                  htmlFor="genre"
                  className="block text-sm font-semibold text-zinc-300 mb-2"
                >
                  {t("workPage.create.form.genresLabel")}
                </label>

                {/* Selected Genres Display */}
                {selectedGenres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedGenres.map((genre) => (
                      <span
                        key={genre.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-zinc-600 text-zinc-200 border border-zinc-500"
                        title={genre.description}
                      >
                        {translateGenre(genre.name)}
                        <button
                          type="button"
                          onClick={() => removeGenre(genre.id)}
                          className="ms-2 hover:text-zinc-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <select
                  id="genre"
                  name="genre"
                  onChange={handleGenreChange}
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all"
                >
                  <option value="" className="text-zinc-400">
                    {genrePlaceholder}
                  </option>
                  {genres
                    ?.filter((genre) => !formData.genreIds.includes(genre.id))
                    ?.map((genre) => (
                      <option
                        key={genre.id}
                        value={genre.id}
                        className="text-zinc-100"
                      >
                        {translateGenre(genre.name)}
                      </option>
                    ))}
                </select>

                <p className="text-zinc-500 text-sm mt-1">
                  {selectedGenres.length === 0
                    ? t("workPage.create.form.genresHelpEmpty")
                    : t("workPage.create.form.genresHelpSelected", {
                        count: selectedGenres.length,
                      })}
                </p>
              </div>

              {/* Summary Textarea */}
              <div>
                <label
                  htmlFor="summary"
                  className="block text-sm font-semibold text-zinc-300 mb-2"
                >
                  {t("workPage.create.form.summaryLabel")}
                </label>
                <textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  rows="6"
                  placeholder={t("workPage.create.form.summaryPlaceholder")}
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all resize-vertical"
                  maxLength={SUMMARY_MAX}
                  required
                />
                <p className="text-zinc-500 text-sm mt-1">
                  {t("workPage.create.form.summaryCounter", {
                    count: formData.summary.length,
                    max: SUMMARY_MAX,
                  })}
                </p>
              </div>
            </div>

            {/* Right Column - Cover Upload */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                {t("workPage.create.form.coverLabel")}
              </label>

              <CoverPicker
                value={formData.cover}
                onChange={(cover) => setFormData((prev) => ({ ...prev, cover }))}
                title={formData.title}
                disabled={isCreatingNovel}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-zinc-700">
            <Button type="submit" isLoading={isCreatingNovel}>
              {isCreatingNovel
                ? t("workPage.create.actions.submitting")
                : t("workPage.create.actions.submit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
    </ProtectedRoute>
  );
}
