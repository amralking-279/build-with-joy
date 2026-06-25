import { useState, useMemo, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Search, BookOpen, Headphones, Heart, MapPin } from 'lucide-react';
import { fetchSurahs } from '@/services/quranApi';
import type { Surah } from '@/types/quran';
import { useFavorites } from '@/components/providers/FavoritesProvider';
import { useAudio } from '@/components/providers/AudioProvider';

type FilterType = 'all' | 'meccan' | 'medinan';

const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const toAr = (n: number) =>
  String(n).split('').map(d => arabicNumerals[parseInt(d)] ?? d).join('');

function normalizeArabic(text: string): string {
  return text
    .replace(/[أإآا]/g, 'ا')
    .replace(/[ةه]/g, 'ه')
    .replace(/[ىي]/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

function FajrSurahCard({ surah }: { surah: Surah }) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { playSurah, currentSurah, isPlaying } = useAudio();
  const fav = isFavorite(surah.number);
  const playing = currentSurah?.number === surah.number && isPlaying;

  function toggleFav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (fav) {
      removeFavorite(surah.number);
    } else {
      addFavorite({
        number: surah.number,
        name: surah.name,
        numberOfAyahs: surah.numberOfAyahs,
        revelationType: surah.revelationType,
        addedAt: Date.now(),
      });
    }
  }

  function handlePlay(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    playSurah(surah);
  }

  return (
    <div
      className={`relative rounded-2xl p-3 bg-white border transition-colors ${
        playing ? 'border-neutral-400 ring-1 ring-neutral-300' : 'border-neutral-200'
      } hover:bg-neutral-50`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center">
          <span className="text-neutral-800 font-cairo text-sm font-bold">{toAr(surah.number)}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-neutral-900 font-bold text-base truncate" style={{ fontFamily: 'Amiri, serif' }}>
              {surah.name}
            </h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-cairo flex-shrink-0 bg-neutral-100 text-neutral-700 border border-neutral-200">
              {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-500 font-cairo">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {surah.englishNameTranslation}
            </span>
            <span>{toAr(surah.numberOfAyahs)} آية</span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={toggleFav}
            className={`p-2 rounded-lg border transition-colors ${
              fav
                ? 'text-neutral-900 bg-neutral-100 border-neutral-300'
                : 'text-neutral-500 bg-white border-neutral-200 hover:bg-neutral-50'
            }`}
            title={fav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          >
            <Heart className={`w-4 h-4 ${fav ? 'fill-neutral-700' : ''}`} />
          </button>

          <button
            onClick={handlePlay}
            className={`p-2 rounded-lg border transition-colors ${
              playing
                ? 'text-neutral-900 bg-neutral-100 border-neutral-300'
                : 'text-neutral-500 bg-white border-neutral-200 hover:bg-neutral-50'
            }`}
            title="استمع"
          >
            <Headphones className="w-4 h-4" />
          </button>

          <Link
            to={`/read/${surah.number}`}
            className="p-2 rounded-lg text-neutral-500 bg-white border border-neutral-200 hover:bg-neutral-50 transition-colors"
            title="اقرأ"
          >
            <BookOpen className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FajrSurahList() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSurahs()
      .then(data => {
        if (!cancelled) {
          setSurahs(data);
          setError(null);
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.message || 'حدث خطأ في تحميل البيانات');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!surahs.length) return [];
    const nq = normalizeArabic(query);
    const sq = query.toLowerCase().trim();
    return surahs.filter(s => {
      const matches =
        filter === 'all' ||
        (filter === 'meccan' && s.revelationType === 'Meccan') ||
        (filter === 'medinan' && s.revelationType === 'Medinan');
      if (!matches) return false;
      if (!query.trim()) return true;
      if (normalizeArabic(s.name).includes(nq)) return true;
      if (s.name.includes(query)) return true;
      if (s.englishName.toLowerCase().includes(sq)) return true;
      if (s.englishNameTranslation.toLowerCase().includes(sq)) return true;
      if (String(s.number).includes(sq)) return true;
      return false;
    });
  }, [surahs, query, filter]);

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-neutral-700 font-cairo mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-neutral-100 text-neutral-900 rounded-xl font-cairo border border-neutral-300 hover:bg-neutral-200 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث باسم السورة أو رقمها..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2.5 pr-10 text-neutral-900 placeholder-neutral-400 font-cairo text-sm focus:outline-none focus:border-neutral-400 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'meccan', 'medinan'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-cairo transition-colors border ${
                filter === f
                  ? 'bg-neutral-100 text-neutral-900 border-neutral-300 font-bold shadow-sm'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              {f === 'all' ? 'الكل' : f === 'meccan' ? 'مكية' : 'مدنية'}
            </button>
          ))}
        </div>
      </div>

      {!loading && (
        <p className="text-neutral-500 text-xs font-cairo">{filtered.length} سورة</p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-neutral-100 border border-neutral-200 animate-pulse" />
            ))
          : filtered.map(s => <FajrSurahCard key={s.number} surah={s} />)}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-10">
          <p className="text-neutral-500 font-cairo">لا توجد نتائج مطابقة لـ "{query}"</p>
        </div>
      )}
    </div>
  );
}
