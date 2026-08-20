import { useSyncExternalStore } from 'react';
import { store, AppState } from '../services/stateStorage';

export function useStore(): AppState {
  return useSyncExternalStore(
    (onStoreChange) => store.subscribe(onStoreChange),
    () => store.getState()
  );
}
