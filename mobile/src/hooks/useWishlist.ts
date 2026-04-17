import { useDataStore } from '../stores/dataStore';

export const useWishlist = () => {
  const wishlist = useDataStore((s) => s.wishlist);
  const addWishlistItem = useDataStore((s) => s.addWishlistItem);
  const updateWishlistItem = useDataStore((s) => s.updateWishlistItem);

  const pending = wishlist.filter((w) => w.status === 'PENDING');
  const ready = wishlist.filter((w) => w.status === 'READY');
  const rejected = wishlist.filter((w) => w.status === 'REJECTED');
  const purchased = wishlist.filter((w) => w.status === 'PURCHASED');

  return {
    wishlist,
    pending,
    ready,
    rejected,
    purchased,
    addWishlistItem,
    updateWishlistItem,
  };
};
