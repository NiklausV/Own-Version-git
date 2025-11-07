// diff-viewer/src/hooks/useCommits.js
import { useState, useEffect } from 'react';
import { getCommits } from '../services/api';

export function useCommits(limit = 50) {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchCommits() {
      try {
        setLoading(true);
        setError(null);
        const data = await getCommits(limit);
        if (mounted) {
          setCommits(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchCommits();

    return () => {
      mounted = false;
    };
  }, [limit]);

  const refetch = async () => {
    setLoading(true);
    try {
      const data = await getCommits(limit);
      setCommits(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { commits, loading, error, refetch };
}