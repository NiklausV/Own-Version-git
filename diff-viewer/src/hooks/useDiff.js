// diff-viewer/src/hooks/useDiff.js
import { useState, useEffect } from 'react';
import { getDiff } from '../services/api';

export function useDiff(hash1, hash2) {
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Need at least hash2 (current commit)
    if (!hash2) {
      setDiff(null);
      return;
    }

    let mounted = true;

    async function fetchDiff() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching diff:', { hash1: hash1 || 'null', hash2 });
        
        // If no parent (first commit), use 'null' as hash1
        const parentHash = hash1 || 'null';
        const data = await getDiff(parentHash, hash2);
        
        console.log('Diff response:', data);
        
        if (mounted) {
          setDiff(data);
        }
      } catch (err) {
        console.error('Error fetching diff:', err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchDiff();

    return () => {
      mounted = false;
    };
  }, [hash1, hash2]);

  return { diff, loading, error };
}