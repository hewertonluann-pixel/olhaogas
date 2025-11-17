
import React, { useState, useCallback, useEffect } from 'react';
import { User, SellerProfile, Order, UserRole, OrderStatus, SellerStatus, PaymentMethod, PaymentStatus, Announcement, AnnouncementTarget, NewSellerFormData } from './types';
// FIX: Import `setDocument` to handle creating documents with a specific ID.
import { onCollectionUpdate, updateDocument, addDocument, removeDocument, getAllUsers, setDocument } from './services/firestoreService';

import LoginScreen from './pages/LoginScreen';
import ClientView from './pages/ClientView';
import SellerView from './pages/SellerView';
import ManagerView from './pages/ManagerView';
import { LogoIcon } from './components/Icons';

function App() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | SellerProfile | null>(null);
  const [users, setUsers] = useState<(User | SellerProfile)[]>([]);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    // Escuta atualizações em tempo real das coleções do Firestore
    const unsubscribeUsers = onCollectionUpdate<User | SellerProfile>('users', setUsers);
    const unsubscribeSellers = onCollectionUpdate<SellerProfile>('sellers', setSellers);
    const unsubscribeOrders = onCollectionUpdate<Order>('orders', setOrders);
    const unsubscribeAnnouncements = onCollectionUpdate<Announcement>('announcements', setAnnouncements);
    
    // Simula um tempo de carregamento inicial para a UI não piscar
    const timer = setTimeout(() => setLoading(false), 1500);

    // Função de limpeza para parar de escutar quando o componente desmontar
    return () => {
      unsubscribeUsers();
      unsubscribeSellers();
      unsubscribeOrders();
      unsubscribeAnnouncements();
      clearTimeout(timer);
    };
  }, []);

  const handleLogin = useCallback(async (role: UserRole) => {
    // No mundo real, a autenticação seria feita aqui.
    // Para simulação, buscamos todos os usuários e pegamos o primeiro do perfil selecionado.
    setLoading(true);
    try {
        const allUsers = await getAllUsers();
        let userToLogin: User | SellerProfile | undefined;
        
        if (role === UserRole.CLIENT) userToLogin = allUsers.find(u => u.role === UserRole.CLIENT);
        if (role === UserRole.SELLER) userToLogin = allUsers.find(u => u.role === UserRole.SELLER);
        if (role === UserRole.MANAGER) userToLogin = allUsers.find(u => u.role === UserRole.MANAGER);

        if (userToLogin) {
          setCurrentUser(userToLogin);
        } else {
          alert("Nenhum usuário com este perfil encontrado no banco de dados.");
        }
    } catch (error) {
        console.error("Erro ao tentar fazer login:", error);
        alert("Ocorreu um erro ao conectar com o banco de dados.");
    } finally {
        setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const handlePlaceOrder = useCallback(async (seller: SellerProfile, gasQuantity: number, waterQuantity: number, paymentMethod: PaymentMethod) => {
    if (!currentUser || currentUser.role !== UserRole.CLIENT) return;
    
    const paymentStatus: PaymentStatus = paymentMethod === 'Na Entrega' ? 'Pendente' : 'Pago';
    
    try {
        if (gasQuantity > 0) {
            const gasOrder = {
                clientId: currentUser.id,
                sellerId: seller.id,
                status: OrderStatus.PENDING,
                date: new Date().toISOString(),
                quantity: gasQuantity,
                product: 'Gás P13',
                totalValue: seller.prices.gas * gasQuantity,
                paymentMethod,
                paymentStatus,
            };
            await addDocument('orders', gasOrder);
        }

        if (waterQuantity > 0) {
            const waterOrder = {
                clientId: currentUser.id,
                sellerId: seller.id,
                status: OrderStatus.PENDING,
                date: new Date().toISOString(),
                quantity: waterQuantity,
                product: 'Água 20L',
                totalValue: seller.prices.water * waterQuantity,
                paymentMethod,
                paymentStatus,
            };
             await addDocument('orders', waterOrder);
        }
        
        const summary = [
            gasQuantity > 0 ? `${gasQuantity}x Gás P13` : '',
            waterQuantity > 0 ? `${waterQuantity}x Água 20L` : ''
        ].filter(Boolean).join(' e ');
        
        alert(`Pedido de ${summary} para "${seller.name}" realizado com sucesso!`);

    } catch (error) {
        console.error("Erro ao criar pedido:", error);
        alert("Não foi possível realizar o pedido. Tente novamente.");
    }
  }, [currentUser]);

  const handleUpdateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    try {
        await updateDocument('orders', orderId, { status: newStatus });
    } catch(e) {
        console.error("Erro ao atualizar status do pedido:", e);
    }
  }, []);

  const handleRateOrder = useCallback(async (orderId: string, rating: number, comment: string) => {
    try {
        const orderToUpdate = orders.find(o => o.id === orderId);
        if (!orderToUpdate) return;
        
        await updateDocument('orders', orderId, { rating, comment });
        
        // Recalcular a média de avaliação do vendedor
        const sellerOrders = orders.filter(o => o.sellerId === orderToUpdate.sellerId && typeof o.rating === 'number');
        // Adiciona a avaliação atual para o cálculo
        const allRatings = [...sellerOrders.map(o => o.rating!), rating];
        const totalRating = allRatings.reduce((sum, r) => sum + r, 0);
        const newCount = allRatings.length;
        const newAverage = newCount > 0 ? totalRating / newCount : 0;
        
        await updateDocument('sellers', orderToUpdate.sellerId, { rating: { average: newAverage, count: newCount } });
        // O user (se for vendedor) também será atualizado pelo listener do Firestore
    } catch(e) {
        console.error("Erro ao avaliar pedido:", e);
    }
  }, [orders]);


  const handleUpdateSellerStatus = useCallback(async (sellerId: string, newStatus: SellerStatus) => {
    await updateDocument('sellers', sellerId, { status: newStatus });
    await updateDocument('users', sellerId, { status: newStatus });
  }, []);

  const handleUpdateSellerInfo = useCallback(async (
    sellerId: string,
    newInfo: {
      prices: { gas: number; water: number };
      brands: { gas: string; water: string };
    }
  ) => {
    await updateDocument('sellers', sellerId, newInfo);
    await updateDocument('users', sellerId, newInfo);
    alert('Informações do produto atualizadas com sucesso!');
  }, []);
  
  const handleUpdateSellerPhoto = useCallback(async (sellerId: string) => {
    const newPhotoUrl = `https://picsum.photos/seed/${sellerId}${Date.now()}/200`;
    await updateDocument('sellers', sellerId, { photoUrl: newPhotoUrl });
    await updateDocument('users', sellerId, { photoUrl: newPhotoUrl });
    
    setCurrentUser(prevUser => {
      if (prevUser && prevUser.id === sellerId) {
        return { ...prevUser, photoUrl: newPhotoUrl };
      }
      return prevUser;
    });
  }, []);


  const handleApproveSeller = useCallback(async (sellerId: string, approved: boolean) => {
    await updateDocument('sellers', sellerId, { approved });
    await updateDocument('users', sellerId, { approved });
  }, []);

  const handleRemoveSeller = useCallback(async (sellerId: string) => {
    if (window.confirm("Tem certeza que deseja remover este vendedor? Esta ação é irreversível.")) {
      await removeDocument('sellers', sellerId);
      await removeDocument('users', sellerId);
    }
  }, []);
  
  const handleSendAnnouncement = useCallback(async (message: string, target: AnnouncementTarget) => {
    if (!message.trim()) {
      alert("A mensagem do comunicado não pode estar vazia.");
      return;
    }
    const newAnnouncement: Omit<Announcement, 'id'> = {
      message,
      target,
      date: new Date().toISOString(),
    };
    await addDocument('announcements', newAnnouncement);
    alert(`Comunicado enviado para ${target}!`);
  }, []);

  const handleSellerRegistration = useCallback(async (registrationData: { phone: string; gasBrand: string; waterBrand: string; }) => {
    if (!currentUser || currentUser.role !== UserRole.CLIENT) {
        alert("Ação não permitida.");
        return;
    }

    const newSellerProfile: Omit<SellerProfile, 'id'> = {
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

    // Adiciona em ambas as coleções para consistência
    const docRef = await addDocument('sellers', newSellerProfile);
    // FIX: The name 'db' was not found. Replaced direct Firestore call
    // with the `setDocument` service function to create a corresponding user document.
    await setDocument('users', docRef.id, newSellerProfile);

    alert('Sua solicitação para se tornar um vendedor foi enviada! O gerente irá analisar seu cadastro.');
  }, [currentUser]);

  const handleCreateSeller = useCallback(async (formData: NewSellerFormData) => {
    const newSeller: Omit<SellerProfile, 'id'> = {
        ...formData,
        role: UserRole.SELLER,
        photoUrl: `https://picsum.photos/seed/${formData.name.replace(/\s+/g, '').toLowerCase()}${Date.now()}/200`,
        status: SellerStatus.OFFLINE,
        approved: true, // Approved by default when created by manager
        rating: { average: 0, count: 0 },
    };

    const docRef = await addDocument('sellers', newSeller);
    // Adiciona na coleção de users também com o mesmo ID
    // FIX: Using `updateDocument` would fail for a new user. Replaced with
    // `setDocument` to correctly create the new user document.
    await setDocument('users', docRef.id, newSeller);


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
            onUpdateSellerPhoto={handleUpdateSellerPhoto}
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
