// ============================================================
// POINT HISTORY
// ============================================================

export interface PointHistoryItem {
  id: string;

  date: string;

  title: string;

  /**
   * Positive  = poin diperoleh
   * Negative  = poin digunakan
   */
  points: number;

  type:
    | 'order'
    | 'welcome'
    | 'redeem'
    | 'bonus';
}

// ============================================================
// CUSTOMER LOYALTY STATE
// ============================================================

export interface LoyaltyState {
  /**
   * Saldo poin customer saat ini.
   */
  points: number;

  /**
   * Total poin yang pernah diperoleh
   * sepanjang masa.
   *
   * Digunakan untuk menentukan tier loyalty.
   */
  totalEarnedLifetime: number;

  /**
   * Jumlah box gratis yang pernah
   * ditukarkan customer.
   */
  totalBoxesClaimed: number;

  /**
   * Riwayat aktivitas poin.
   */
  history: PointHistoryItem[];
}

// ============================================================
// LOYALTY CONFIGURATION
// ============================================================

/**
 * Jumlah poin yang diperlukan untuk
 * mendapatkan 1 box gratis.
 */
export const POINTS_PER_FREE_BOX = 100;

/**
 * Setiap Rp1.000 transaksi mendapatkan
 * 1 poin loyalty.
 */
export const RUPIAH_PER_POINT = 1000;