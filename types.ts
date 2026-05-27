export enum UserRole {
  CLIENT = 'CLIENT',
  SELLER = 'SELLER',
  MANAGER = 'MANAGER',
}

export enum OrderStatus {
  PENDING = 'Pendente',
  ON_THE_WAY = 'A Caminho',
  DELIVERED = 'Entregue',
}

export enum SellerStatus {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
}

export enum AnnouncementTarget {
  CLIENTS = 'Clientes',
  SELLERS = 'Vendedores',
}

export interface Address {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  photoUrl: string;
  address: Address;
}

export interface SellerProfile extends User {
  brands: {
    gas: string;
    water: string;
  };
  prices: {
    gas: number;
    water: number;
  };
  /**
   * IDs de preço do catálogo Stripe (price_xxx).
   * Usado para referenciar o valor oficial ao criar PaymentIntents.
   * Preencher após cadastrar os produtos no Stripe Dashboard.
   */
  stripePriceIds?: {
    gas?: string;   // ex: "price_1Abc..." — Gás 13kg
    water?: string; // ex: "price_1Xyz..." — Água 20L
  };
  /**
   * ID da conta Stripe Connect Express do vendedor (acct_xxx).
   * Gerado automaticamente no onboarding via Cloud Function createSellerStripeAccount.
   */
  stripeAccountId?: string;
  status: SellerStatus;
  approved: boolean;
  rating: {
    average: number;
    count: number;
  };
}

export type PaymentMethod = 'PIX' | 'Cartão de Crédito' | 'Na Entrega';
export type PaymentStatus = 'Pago' | 'Pendente';


export interface Order {
  id: string;
  clientId: string;
  sellerId: string;
  status: OrderStatus;
  date: string;
  quantity: number;
  product: string;
  totalValue: number;
  rating?: number;
  comment?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
}

export interface Announcement {
  id: string;
  message: string;
  target: AnnouncementTarget;
  date: string;
}

export interface NewSellerFormData {
  name: string;
  email: string;
  phone: string;
  address: Address;
  brands: {
    gas: string;
    water: string;
  };
  prices: {
    gas: number;
    water: number;
  };
}

export interface UserProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
  };
}
