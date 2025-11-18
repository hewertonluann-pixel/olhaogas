import { User, SellerProfile, Order, UserRole, SellerStatus, OrderStatus } from './types';

export const COMMISSION_RATE = 0.05; // 5% de comissão sobre cada venda

export const USERS: User[] = [
  {
    id: 'user-1',
    name: 'Ana Carolina',
    email: 'ana.carolina@example.com',
    role: UserRole.CLIENT,
    phone: '(11) 98765-4321',
    photoUrl: 'https://picsum.photos/seed/anacarolina/200',
    address: {
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Jardim Primavera',
      city: 'São Paulo',
      state: 'SP',
    },
  },
];

export const SELLERS: SellerProfile[] = [
  {
    id: 'seller-1',
    name: 'Gás Rápido do João',
    email: 'joao.gas@example.com',
    role: UserRole.SELLER,
    phone: '(11) 91234-5678',
    photoUrl: 'https://picsum.photos/seed/joaogas/200',
    address: {
      street: 'Avenida Principal',
      number: '456',
      neighborhood: 'Jardim Primavera',
      city: 'São Paulo',
      state: 'SP',
    },
    brands: { gas: 'Supergás', water: 'Crystal' },
    prices: { gas: 110.50, water: 8.50 },
    status: SellerStatus.ONLINE,
    approved: true,
    rating: { average: 4.8, count: 25 },
  },
  {
    id: 'seller-2',
    name: 'Maria Gás e Água',
    email: 'maria.gas@example.com',
    role: UserRole.SELLER,
    phone: '(11) 92345-6789',
    photoUrl: 'https://picsum.photos/seed/mariagas/200',
    address: {
      street: 'Rua dos Pássaros',
      number: '789',
      neighborhood: 'Jardim Primavera',
      city: 'São Paulo',
      state: 'SP',
    },
    brands: { gas: 'Ultragaz', water: 'Minalba' },
    prices: { gas: 108.00, water: 8.00 },
    status: SellerStatus.OFFLINE,
    approved: true,
    rating: { average: 4.5, count: 18 },
  },
    {
    id: 'seller-4',
    name: 'Entrega Veloz',
    email: 'veloz@example.com',
    role: UserRole.SELLER,
    phone: '(11) 94567-1234',
    photoUrl: 'https://picsum.photos/seed/velozgas/200',
    address: {
      street: 'Rua Larga',
      number: '202',
      neighborhood: 'Jardim Primavera',
      city: 'São Paulo',
      state: 'SP',
    },
    brands: { gas: 'Copagaz', water: 'Bonafont' },
    prices: { gas: 115.00, water: 9.00 },
    status: SellerStatus.ONLINE,
    approved: true,
    rating: { average: 4.9, count: 42 },
  },
  {
    id: 'seller-3',
    name: 'Carlos Entregas',
    email: 'carlos.entregas@example.com',
    role: UserRole.SELLER,
    phone: '(11) 93456-7890',
    photoUrl: 'https://picsum.photos/seed/carlosgas/200',
    address: {
      street: 'Travessa dos Ventos',
      number: '101',
      neighborhood: 'Vila Madalena',
      city: 'São Paulo',
      state: 'SP',
    },
    brands: { gas: 'Nacional Gás', water: 'Schin' },
    prices: { gas: 112.75, water: 8.75 },
    status: SellerStatus.ONLINE,
    approved: false,
    rating: { average: 0, count: 0 },
  },
];

export const MANAGER: User = {
  id: 'manager-1',
  name: 'Sr. Roberto',
  email: 'roberto.gerente@olhaogas.com',
  role: UserRole.MANAGER,
  phone: '(11) 99999-0000',
  photoUrl: 'https://picsum.photos/seed/robertogerente/200',
  address: {
    street: 'Rua da Administração',
    number: '1',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
  },
};

export const ALL_USERS: (User | SellerProfile)[] = [
    ...USERS,
    ...SELLERS,
    MANAGER,
];

// Gerando dados de pedidos mais realistas para o dashboard
const generateMockOrders = () => {
  const orders: Order[] = [];
  const today = new Date();
  
  // Pedidos de hoje
  for (let i = 0; i < 5; i++) {
    const hour = Math.floor(Math.random() * today.getHours());
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour);
     orders.push({
      id: `order-today-${i}`,
      clientId: 'user-1',
      sellerId: SELLERS[i % 2].id,
      status: i % 3 === 0 ? OrderStatus.DELIVERED : ( i % 3 === 1 ? OrderStatus.ON_THE_WAY : OrderStatus.PENDING ),
      date: date.toISOString(),
      quantity: 1,
      product: 'Gás P13',
      totalValue: SELLERS[i % 2].prices.gas,
      rating: i % 3 === 0 ? 5 : undefined,
    });
  }

  // Pedidos do mês
  for (let i = 0; i < 30; i++) {
    const day = Math.floor(Math.random() * today.getDate());
    const date = new Date(today.getFullYear(), today.getMonth(), day);
     orders.push({
      id: `order-month-${i}`,
      clientId: 'user-1',
      sellerId: SELLERS[i % 3].id,
      status: OrderStatus.DELIVERED,
      date: date.toISOString(),
      quantity: 1,
      product: 'Gás P13',
      totalValue: SELLERS[i % 3].prices.gas,
      rating: 4,
    });
  }
  
  return orders;
}


export const ORDERS: Order[] = generateMockOrders();