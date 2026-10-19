import { useCallback } from 'react';
import { bookmarkService } from '../services/bookmarkService';
import { useToast } from '../contexts/NotificationContext';

// Toggles a bookmark through the API, then updates local list state only after success.
export function useBookmarkToggle(setItems, { removeOnUnsave = false } = {}) {
  const toast = useToast();
  return useCallback(async (r) => {
    try {
      if (r.isBookmarked) await bookmarkService.remove(r._id); else await bookmarkService.add(r._id);
      setItems((list) => (r.isBookmarked && removeOnUnsave
        ? list.filter((x) => x._id !== r._id)
        : list.map((x) => (x._id === r._id ? { ...x, isBookmarked: !r.isBookmarked } : x))));
      toast.success(r.isBookmarked ? 'Removed from saved materials.' : 'Saved to your materials.');
    } catch (e) { toast.error(e.message); }
  }, [setItems, removeOnUnsave, toast]);
}
