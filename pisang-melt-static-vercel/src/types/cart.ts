import {
  Product,
  ExtraTopping,
} from '../data/products';

// ============================================================
// CART ITEM
// ============================================================

export interface CartItem {
  /**
   * ID unik item keranjang.
   * Dapat dibentuk dari product ID + topping + notes.
   */
  id: string;

  product: Product;

  quantity: number;

  selectedToppings: ExtraTopping[];

  notes?: string;
}

// ============================================================
// PAYMENT
// ============================================================

export type PaymentMethodType =
  | 'qris'
  | 'bca_va'
  | 'mandiri_va'
  | 'gopay'
  | 'dana'
  | 'cod';

// ============================================================
// CUSTOMER ORDER INFORMATION
// ============================================================

export interface CustomerOrderInfo {
  name: string;

  phone: string;

  address: string;

  deliveryOption:
    | 'pickup'
    | 'gosend'
    | 'grabexpress'
    | 'shopeefood';

  notes: string;

  paymentMethod: PaymentMethodType;
}

// ============================================================
// ORDER STATUS
// ============================================================

export type OrderStatusStep =
  | 'received'
  | 'cooking'
  | 'ready';

// ============================================================
// PAYMENT STATUS
// ============================================================

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'verified';

// ============================================================
// ACTIVE CUSTOMER ORDER
// ============================================================

export interface ActiveOrder {
  orderId: string;

  timestamp: string;

  status: OrderStatusStep;

  items: CartItem[];

  itemsSubtotal: number;

  discountAmount: number;

  deliveryFee: number;

  grandTotal: number;

  paymentMethod: PaymentMethodType;

  paymentStatus: PaymentStatus;

  paymentRef?: string;

  customerInfo: CustomerOrderInfo;

  estimatedMinutes: number;
}