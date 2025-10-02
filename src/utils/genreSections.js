// All available genres
export const GENRES = [
  {
    id: 1,
    name: "Romance",
    slug: "romance",
    description: "تجتاحنا نفحات العشق حين تلتقي الأرواح في لحظة صمتٍ تتراقص فيها النجوم، حيث تنسج الأقدار خيوط الحنين وتعزف قصائد حب لا تُنسى.",
  },
  {
    id: 2,
    name: "Action",
    slug: "action",
    description: "هنا تُشعل الانفجارات سماء الأمل، ويتحول العرق إلى وقودٍ لصراعٍ محتدم، كل خطوةٍ تحمل المصير في كفة والموت في الأخرى.",
  },
  {
    id: 3,
    name: "Fantasy",
    slug: "fantasy",
    description: "تزهو القلاع العتيقة بألوانٍ من وحي الأحلام، حيث تتراقص المخلوقات الأسطورية على أنغام القوى الخفية وتكتب أساطير الأبطال.",
  },
  {
    id: 4,
    name: "Science Fiction",
    slug: "science-fiction",
    description: "تنفتح أمامنا أبواب المستقبل، فتلتقي التقنية بأحلام البشر، ونسافر بين كواكبٍ شاسعة بحثًا عن حقيقةٍ تفوق حدود الخيال.",
  },
  {
    id: 5,
    name: "Mystery",
    slug: "mystery",
    description: "تُسدل القصص ثوبها على ألغازٍ باردة، فتنبض الأدلة تحت ضوء القمر الصناعي، ويبدأ الأبطال مطاردة السر المختبئ في زوايا الليل.",
  },
  {
    id: 6,
    name: "Thriller",
    slug: "thriller",
    description: "تنبض القلوب في صمتٍ قاتل، ثم يتفجر التوتر في لحظةٍ واحدة، لتسقط كل الأقنعة وتنكشف أعمق الأسرار أمام عيونٍ مرهقة.",
  },
  {
    id: 7,
    name: "Drama",
    slug: "drama",
    description: "تختلط الدموع بالضحكات في مسرحٍ واحد، حيث يولد الألم من رحم الحب، ويتراقص الألم على أوتار القلب حتى آخر ممشى.",
  },
  {
    id: 8,
    name: "Comedy",
    slug: "comedy",
    description: "تتحول المواقف البسيطة إلى فصولٍ فكاهية، وتنساب القهقهات كالشلال وسط رتابة الأيام، لتنسى الهموم ولو للحظات.",
  },
  {
    id: 9,
    name: "Horror",
    slug: "horror",
    description: "يزحف الخوف بخطواتٍ باردة نحو أعماقنا، تنبض الظلال بأشكالٍ لا ترحم، ويصبح الصمت أدرأ من الصرخات.",
  },
  {
    id: 10,
    name: "Adventure",
    slug: "adventure",
    description: "يتحدى الأبطال المجهول في صحراءٍ لا تعرف الرحمة، وكل وادٍ يخبئ حكايةً جديدة، وكل قمةٍ تُسجل شهادةً على جرأة القلوب.",
  },
];

// Ranking types
export const RANKING_TYPES = ["new", "trending", "top_rated"];

// Arabic titles for ranking types
export const RANKING_TITLES = {
  new: {
    title: "نجوم صاعدة في",
    subtitle: "روايات جديدة تحقق نجاحاً",
    icon: "Sparkles",
    color: "purple",
  },
  trending: {
    title: "الأكثر رواجاً في",
    subtitle: "الروايات الأكثر متابعة حالياً",
    icon: "TrendingUp",
    color: "red",
  },
  top_rated: {
    title: "الأفضل تقييماً في",
    subtitle: "أعلى الروايات تقييماً من القراء",
    icon: "Star",
    color: "yellow",
  },
};

// Generate random genre sections with different ranking types
// Cached for 15 minutes in localStorage
const CACHE_KEY = "genreSections_cache";
const CACHE_TIMESTAMP_KEY = "genreSections_timestamp";
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export const getRandomGenreSections = () => {
  // Try to get cached data from localStorage
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (cachedData && cachedTimestamp) {
      const timestamp = parseInt(cachedTimestamp, 10);
      if (Date.now() - timestamp < CACHE_DURATION) {
        // Parse and return cached data
        const parsed = JSON.parse(cachedData);
        // Reconstruct genre objects from cached data
        return parsed.map(item => ({
          genre: GENRES.find(g => g.id === item.genreId),
          rankingType: item.rankingType
        }));
      }
    }
  } catch (error) {
    console.error('Error reading cache:', error);
  }

  // Shuffle array helper
  const shuffle = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Get 3 random genres
  const shuffledGenres = shuffle(GENRES);
  const selectedGenres = shuffledGenres.slice(0, 3);

  // Shuffle ranking types and assign one to each genre
  const shuffledRankingTypes = shuffle(RANKING_TYPES);

  // Create sections
  const sections = selectedGenres.map((genre, index) => ({
    genre,
    rankingType: shuffledRankingTypes[index],
  }));

  // Cache the result in localStorage
  try {
    const cacheData = sections.map(section => ({
      genreId: section.genre.id,
      rankingType: section.rankingType
    }));
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error setting cache:', error);
  }

  return sections;
};
