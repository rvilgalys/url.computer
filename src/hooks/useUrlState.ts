
import { useState, useEffect } from 'react';
import { AppState } from '../types';
import lz from 'lz-string';

const defaultState: AppState = {
  url: 'https://api.example.com/v1/users?page=1&pageSize=10',
  curl: {
    method: 'GET',
    headers: {},
    body: '',
    options: [],
  },
};

const getInitialState = (): AppState => {
  if (typeof window === 'undefined') {
    return defaultState;
  }
  try {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const decompressed = lz.decompressFromBase64(hash);
      if (decompressed) {
        return JSON.parse(decompressed);
      }
    }
  } catch (error) {
    console.error('Failed to parse state from URL hash', error);
  }
  return defaultState;
};

export const useUrlState = () => {
  const [state, setState] = useState<AppState>(getInitialState());

  useEffect(() => {
    // We only want to update the hash if the state is not the default state,
    // or if a hash already exists. This prevents adding a hash to a clean URL on load.
    const currentHash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    const serializedState = JSON.stringify(state);
    // A simple deep-ish equal
    if (JSON.stringify(defaultState) === serializedState && !currentHash) {
        return;
    }

    const compressedState = lz.compressToBase64(serializedState);
    // Update the hash without causing a page reload
    window.history.replaceState(null, '', `#${compressedState}`);
  }, [state]);

  return [state, setState] as const;
};
