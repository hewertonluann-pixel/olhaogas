import React, { useState, useCallback, useEffect } from 'react';
import { User, SellerProfile, Order, UserRole, OrderStatus, SellerStatus, PaymentMethod, PaymentStatus, Announcement, AnnouncementTarget, NewSellerFormData, UserProfileFormData } from './types';
import { USERS, SELLERS, MANAGER, ORDERS, ALL_USERS } from './constants';

import LoginScreen from './pages/LoginScreen';
import ClientView from './pages/ClientView';
import SellerView from './pages/SellerView';
import ManagerView from './pages/ManagerView';
import { LogoIcon } from './components/Icons';

function App() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | SellerProfile | null>(null);
  const [users, setUsers] = useState<(User | SellerProfile)[]>(ALL_USERS);
  const [sellers, setSellers] = useState<SellerProfile[]>(SELLERS);
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    // Simula um tempo de carregamento inicial
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = useCallback((role: UserRole) => {
    let userToLogin: User | SellerProfile | undefined;
    
    // Simulação de login: pega o primeiro usuário encontrado com o perfil
    if (role === UserRole.CLIENT) userToLogin = users.find(u => u.role === UserRole.CLIENT);
    if (role === UserRole.SELLER) userToLogin = users.find(s => s.role === UserRole.SELLER);
    if (role === UserRole.MANAGER) userToLogin = users.find(u => u.role === UserRole.MANAGER);

    if (userToLogin) {
      setCurrentUser(userToLogin);
    } else {
      alert("Nenhum usuário com este perfil encontrado.");
    }
  }, [users]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const handlePlaceOrder = useCallback((seller: SellerProfile, gasQuantity: number, waterQuantity: number, paymentMethod: PaymentMethod) => {
    if (!currentUser || currentUser.role !== UserRole.CLIENT) return;
    
    const paymentStatus: PaymentStatus = paymentMethod === 'Na Entrega' ? 'Pendente' : 'Pago';
    const newOrders: Order[] = [];

    if (gasQuantity > 0) {
      newOrders.push({
        id: `order-gas-${Date.now()}`,
        clientId: currentUser.id,
        sellerId: seller.id,
        status: OrderStatus.PENDING,
        date: new Date().toISOString(),
        quantity: gasQuantity,
        product: 'Gás P13',
        totalValue: seller.prices.gas * gasQuantity,
        paymentMethod,
        paymentStatus,
      });
    }

    if (waterQuantity > 0) {
      newOrders.push({
        id: `order-water-${Date.now()}`,
        clientId: currentUser.id,
        sellerId: seller.id,
        status: OrderStatus.PENDING,
        date: new Date().toISOString(),
        quantity: waterQuantity,
        product: 'Água 20L',
        totalValue: seller.prices.water * waterQuantity,
        paymentMethod,
        paymentStatus,
      });
    }

    if (newOrders.length > 0) {
      setOrders(prev => [...prev, ...newOrders]);
      const summary = [
        gasQuantity > 0 ? `${gasQuantity}x Gás P13` : '',
        waterQuantity > 0 ? `${waterQuantity}x Água 20L` : ''
      ].filter(Boolean).join(' e ');
      alert(`Pedido de ${summary} para "${seller.name}" realizado com sucesso!`);
    }
  }, [currentUser]);

  const handleUpdateOrderStatus = useCallback((orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  }, []);

  const handleRateOrder = useCallback((orderId: string, rating: number, comment: string) => {
    let sellerIdToUpdate: string | null = null;
    
    // Atualiza o pedido
    setOrders(prevOrders => prevOrders.map(o => {
      if (o.id === orderId) {
        sellerIdToUpdate = o.sellerId;
        return { ...o, rating, comment };
      }
      return o;
    }));

    // Atualiza a avaliação do vendedor
    if (sellerIdToUpdate) {
      const sellerOrders = orders.filter(o => o.sellerId === sellerIdToUpdate && (o.rating || o.id === orderId));
      const allRatings = sellerOrders.map(o => o.id === orderId ? rating : o.rating!);
      const totalRating = allRatings.reduce((sum, r) => sum + r, 0);
      const newCount = allRatings.length;
      const newAverage = newCount > 0 ? totalRating / newCount : 0;
      
      const updateRating = (s: SellerProfile) => ({ ...s, rating: { average: newAverage, count: newCount }});
      
      setSellers(prev => prev.map(s => s.id === sellerIdToUpdate ? updateRating(s) : s));
      setUsers(prev => prev.map(u => u.id === sellerIdToUpdate ? updateRating(u as SellerProfile) : u));
    }
  }, [orders]);


  const handleUpdateSellerStatus = useCallback((sellerId: string, newStatus: SellerStatus) => {
    const update = (s: SellerProfile) => ({ ...s, status: newStatus });
    setSellers(prev => prev.map(s => s.id === sellerId ? update(s) : s));
    setUsers(prev => prev.map(u => u.id === sellerId ? update(u as SellerProfile) : u));
  }, []);

  const handleUpdateSellerInfo = useCallback((
    sellerId: string,
    newInfo: {
      prices: { gas: number; water: number };
      brands: { gas: string; water: string };
    }
  ) => {
    const update = (s: SellerProfile) => ({ ...s, ...newInfo });
    setSellers(prev => prev.map(s => s.id === sellerId ? update(s) : s));
    setUsers(prev => prev.map(u => u.id === sellerId ? update(u as SellerProfile) : u));
    alert('Informações do produto atualizadas com sucesso!');
  }, []);
  
  const handleUpdateUserPhoto = useCallback((userId: string, photoFile: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhotoUrl = reader.result as string;
      const update = (u: User | SellerProfile) => ({ ...u, photoUrl: newPhotoUrl });

      setSellers(prev => prev.map(s => s.id === userId ? update(s) as SellerProfile : s));
      setUsers(prev => prev.map(u => u.id === userId ? update(u) : u));
      setCurrentUser(prevUser => prevUser && prevUser.id === userId ? update(prevUser) : prevUser);
      alert('Foto de perfil atualizada com sucesso!');
    };
    reader.readAsDataURL(photoFile);
  }, []);

  const handleUpdateUserInfo = useCallback((userId: string, formData: UserProfileFormData) => {
    const updateUser = (u: User | SellerProfile) => ({
      ...u,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: {
        ...u.address,
        street: formData.address.street,
        number: formData.address.number,
        neighborhood: formData.address.neighborhood,
      },
    });

    setUsers(prev => prev.map(u => u.id === userId ? updateUser(u) : u));
    setSellers(prev => prev.map(s => s.id === userId ? updateUser(s) as SellerProfile : s));
    setCurrentUser(prevUser => prevUser && prevUser.id === userId ? updateUser(prevUser) : prevUser);
    alert('Informações do perfil atualizadas com sucesso!');
  }, []);

  const handleApproveSeller = useCallback((sellerId: string, approved: boolean) => {
    const update = (s: SellerProfile) => ({ ...s, approved });
    setSellers(prev => prev.map(s => s.id === sellerId ? update(s) : s));
    setUsers(prev => prev.map(u => u.id === sellerId ? update(u as SellerProfile) : u));
  }, []);

  const handleRemoveSeller = useCallback((sellerId: string) => {
    if (window.confirm("Tem certeza que deseja remover este vendedor? Esta ação é irreversível.")) {
      setSellers(prev => prev.filter(s => s.id !== sellerId));
      setUsers(prev => prev.filter(u => u.id !== sellerId));
    }
  }, []);
  
  const handleSendAnnouncement = useCallback((message: string, target: AnnouncementTarget) => {
    if (!message.trim()) {
      alert("A mensagem do comunicado não pode estar vazia.");
      return;
    }
    const newAnnouncement: Announcement = {
      id: `announcement-${Date.now()}`,
      message,
      target,
      date: new Date().toISOString(),
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    alert(`Comunicado enviado para ${target}!`);
  }, []);

  const handleSellerRegistration = useCallback((registrationData: { phone: string; gasBrand: string; waterBrand: string; }) => {
    if (!currentUser || currentUser.role !== UserRole.CLIENT) {
        alert("Ação não permitida.");
        return;
    }

    const newSellerProfile: SellerProfile = {
        id: `seller-${Date.now()}`,
        name: currentUser.name,
        email: currentUser.email,
        role: UserRole.SELLER,
        phone: registrationData.phone,
        photoUrl: currentUser.photoUrl,
        address: currentUser.address,
        brands: { gas: registrationData.gasBrand, water: registrationData.waterBrand },
        prices: { gas: 0, water: 0 },
        status: SellerStatus.OFFLINE,
        approved: false,
        rating: { average: 0, count: 0 },
    };

    setSellers(prev => [...prev, newSellerProfile]);
    setUsers(prev => [...prev, newSellerProfile]);
    alert('Sua solicitação para se tornar um vendedor foi enviada! O gerente irá analisar seu cadastro.');
  }, [currentUser]);

  const handleCreateSeller = useCallback((formData: NewSellerFormData) => {
    const newSeller: SellerProfile = {
        id: `seller-created-${Date.now()}`,
        ...formData,
        role: UserRole.SELLER,
        photoUrl: `https://picsum.photos/seed/${formData.name.replace(/\s+/g, '').toLowerCase()}${Date.now()}/200`,
        status: SellerStatus.OFFLINE,
        approved: true, // Approved by default when created by manager
        rating: { average: 0, count: 0 },
    };

    setSellers(prev => [...prev, newSeller]);
    setUsers(prev => [...prev, newSeller]);
    alert(`Vendedor "${formData.name}" cadastrado com sucesso!`);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
        <LogoIcon className="w-24 h-24 text-cyan-400 animate-pulse" />
        <p className="mt-4 text-xl font-semibold tracking-wider">Olha o Gás</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentUser.role) {
      case UserRole.CLIENT:
        return (
          <ClientView
            user={currentUser}
            sellers={sellers.filter(s => s.approved)}
            orders={orders.filter(o => o.clientId === currentUser.id)}
            announcements={announcements}
            onLogout={handleLogout}
            onPlaceOrder={handlePlaceOrder}
            onRateOrder={handleRateOrder}
            onRegisterSeller={handleSellerRegistration}
            onUpdatePhoto={handleUpdateUserPhoto}
            onUpdateUserInfo={handleUpdateUserInfo}
          />
        );
      case UserRole.SELLER:
        const sellerProfile = sellers.find(s => s.id === currentUser.id);
        if (!sellerProfile) return <div>Erro: Perfil de vendedor não encontrado.</div>;
        if (!sellerProfile.approved) {
          return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Olá, {currentUser.name}!</h1>
                <p className="text-yellow-600 bg-yellow-100 border border-yellow-300 rounded-md p-4">
                  Seu cadastro está em análise. Por favor, aguarde a aprovação do gerente para acessar o painel.
                </p>
                <button
                  onClick={handleLogout}
                  className="mt-6 px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75"
                >
                  Sair
                </button>
              </div>
            </div>
          )
        }
        return (
          <SellerView
            seller={sellerProfile}
            orders={orders.filter(o => o.sellerId === currentUser.id)}
            users={users}
            announcements={announcements}
            onLogout={handleLogout}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateSellerStatus={handleUpdateSellerStatus}
            onUpdateSellerInfo={handleUpdateSellerInfo}
            onUpdateSellerPhoto={handleUpdateUserPhoto}
          />
        );
      case UserRole.MANAGER:
        return (
          <ManagerView
            manager={currentUser}
            sellers={sellers}
            orders={orders}
            users={users}
            announcements={announcements}
            onLogout={handleLogout}
            onApproveSeller={handleApproveSeller}
            onRemoveSeller={handleRemoveSeller}
            onSendAnnouncement={handleSendAnnouncement}
            onCreateSeller={handleCreateSeller}
          />
        );
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return <div className="min-h-screen bg-gray-100">{renderView()}</div>;
}

export default App;