import { useState, useEffect } from 'react';
import { BASE_URL } from '../../constants/base-url';

export const useNovelDetails = (novelSlug) => {
  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!novelSlug) return;

    const fetchNovelDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/novel/${novelSlug}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch novel details');
        }

        const data = await response.json();
        setNovel(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setNovel(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNovelDetails();
  }, [novelSlug]);

  return { novel, loading, error };
};
