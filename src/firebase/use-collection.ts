import { useState, useEffect } from 'react';
import {
  onSnapshot,
  query,
  collection,
  orderBy,
  where,
  limit,
  type Firestore,
  type QueryConstraint,
} from 'firebase/firestore';

interface UseCollectionOptions {
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  where?: [string, '==', unknown];
  limit?: number;
}

export function useCollection<T extends Record<string, unknown>>(
  db: Firestore | null,
  path: string,
  options?: UseCollectionOptions
) {
  const [data, setData] = useState<(T & { id: string })[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db || !path) {
      setData(null);
      setLoading(false);
      return;
    }

    const constraints: QueryConstraint[] = [];
    if (options?.orderBy) {
      constraints.push(orderBy(options.orderBy, options.orderDirection ?? 'asc'));
    }
    if (options?.where) {
      constraints.push(where(...options.where));
    }
    if (options?.limit) {
      constraints.push(limit(options.limit));
    }

    const colRef = collection(db, path);
    const q = constraints.length > 0 ? query(colRef, ...constraints) : query(colRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T & { id: string }));
        setData(docs);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, path, JSON.stringify(options)]);

  return { data, loading, error };
}
