import { useState, useEffect } from 'react';
import { BASE_URL } from '../../constants/base-url';

export const useNovelChapters = (novelId) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!novelId) return;

    const fetchChapters = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/novel/${novelId}/chapter`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch chapters');
        }

        const data = await response.json();
        setChapters(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setChapters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [novelId]);

  return { chapters, loading, error };
};
