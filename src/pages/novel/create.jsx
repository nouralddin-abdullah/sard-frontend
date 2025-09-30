import { useMemo, useState } from "react";
import { useGetGenresList } from "../../hooks/genre/useGetGenreList";
import { useCreateWork } from "../../hooks/work/useCreateWork";
import { toast } from "sonner";
import Button from "../../components/ui/button";
import { Image, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const SUMMARY_MAX = 500;

export default function CreateNovel() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    genreIds: [], // Store genre IDs for backend
    cover: null,
  });

  const [selectedGenres, setSelectedGenres] = useState([]); // Store full genre objects for UI

  const [dragActive, setDragActive] = useState(false);

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

  const handleCoverSelection = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("workPage.create.validation.invalidImage"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("workPage.create.validation.maxSize"));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      cover: file,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleCoverSelection(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCoverSelection(e.dataTransfer.files[0]);
    }
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

    const multipartForm = new FormData();
    multipartForm.append("Title", formData.title);
    multipartForm.append("Summary", formData.summary);
    for (let i = 0; i < formData.genreIds.length; i++) {
      multipartForm.append(`GenreIds[${i}]`, formData.genreIds[i]);
    }
    if (formData.cover) multipartForm.append("CoverImageUrl", formData.cover);

    try {
      await createWork(multipartForm);

      toast.success(t("workPage.create.toast.success"));

      for (let i = 0; i < selectedGenres.length; i++) {
        removeGenre(selectedGenres[i].id);
      }

      setFormData({
        title: "",
        summary: "",
        genreIds: [],
        cover: null,
      });
    } catch (error) {
      console.error(error);
      toast.error(error?.message || t("workPage.create.toast.error"));
    }
  };

  return (
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
                        {genre.name}
                        <button
                          type="button"
                          onClick={() => removeGenre(genre.id)}
                          className="ml-2 hover:text-zinc-400 transition-colors"
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
                        {genre.name}
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

              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  dragActive
                    ? "border-zinc-400 bg-zinc-700"
                    : "border-zinc-600 bg-zinc-750"
                } hover:border-zinc-500 hover:bg-zinc-700`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {formData.cover ? (
                  <div className="space-y-4">
                    <div className="w-32 h-48 mx-auto bg-zinc-600 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(formData.cover)}
                        alt={t("workPage.create.form.coverPreviewAlt")}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-zinc-300 font-medium">
                        {formData.cover.name}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData((prev) => ({ ...prev, cover: null }));
                        }}
                        className="text-zinc-500 hover:text-zinc-300 text-sm mt-1 transition-colors"
                      >
                        {t("workPage.create.form.coverRemove")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-32 h-48 mx-auto bg-zinc-600 rounded-lg flex items-center justify-center">
                      <Image className="w-12 h-12 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-zinc-300 font-medium mb-2">
                        {t("workPage.create.form.coverUploadTitle")}
                      </p>
                      <p className="text-zinc-500 text-sm">
                        {t("workPage.create.form.coverUploadSubtitle")}
                      </p>
                      <p className="text-zinc-600 text-xs mt-1">
                        {t("workPage.create.form.coverUploadHelp")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
  );
}
