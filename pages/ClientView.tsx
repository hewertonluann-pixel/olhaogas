

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, SellerProfile, Order, OrderStatus, PaymentMethod, Announcement, AnnouncementTarget, UserProfileFormData } from '../types';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { GasIcon, WaterIcon, StarIcon, PixIcon, CreditCardIcon, CheckCircleIcon, QrCodeIcon, BellIcon, PencilIcon } from '../components/Icons';

interface ClientViewProps {
  user: User;
  sellers: SellerProfile[];
  orders: Order[];
  announcements: Announcement[];
  onLogout: () => void;
  onPlaceOrder: (seller: SellerProfile, gasQuantity: number, waterQuantity: number, paymentMethod: PaymentMethod) => void;
  onRateOrder: (orderId: string, rating: number, comment: string) => void;
  onRegisterSeller: (registrationData: { phone: string; gasBrand: string; waterBrand: string; }) => void;
  onUpdatePhoto: (userId: string, photoFile: File) => void;
  onUpdateUserInfo: (userId: string, formData: UserProfileFormData) => void;
}

const AnnouncementBanner: React.FC<{ announcement: Announcement; onDismiss: () => void; onClick: () => void; }> = ({ announcement, onDismiss, onClick }) => (
  <div className="bg-cyan-50 border border-cyan-200 text-cyan-800 rounded-md relative mb-6 flex items-start group" role="alert">
    <div 
        onClick={onClick} 
        className="flex-grow flex items-start text-left px-4 py-3 cursor-pointer rounded-l-md group-hover:bg-cyan-100/60 transition-colors"
    >
        <BellIcon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0"/>
        <span className="block sm:inline mr-8">{announcement.message}</span>
    </div>
    <button onClick={onDismiss} className="absolute top-0 bottom-0 right-0 px-4 py-3 z-10" aria-label="Fechar comunicado">
      <svg className="fill-current h-6 w-6 text-cyan-700" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Fechar</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.821l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
    </button>
  </div>
);

const StarRating: React.FC<{ rating: number, count?: number }> = ({ rating, count }) => {
    return (
        <div className="flex items-center">
            {/* Fix: Changed [...Array(5)] to Array.from({ length: 5 }) to prevent potential iterator errors. */}
            {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} className={`w-5 h-5 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
            ))}
            {count !== undefined && <span className="text-sm text-gray-600 ml-2">({count} {count === 1 ? 'avaliação' : 'avaliações'})</span>}
        </div>
    );
};

const QuantityControl: React.FC<{
    quantity: number;
    onDecrement: () => void;
    onIncrement: () => void;
}> = ({ quantity, onDecrement, onIncrement }) => (
    <div className="flex items-center space-x-2">
        <button onClick={onDecrement} disabled={quantity === 0} className="w-10 h-10 rounded-full bg-gray-200 text-gray-800 font-bold text-2xl disabled:opacity-50 hover:bg-gray-300 transition-colors">-</button>
        <span className="w-10 text-center font-semibold text-xl text-gray-800">{quantity}</span>
        <button onClick={onIncrement} className="w-10 h-10 rounded-full bg-gray-200 text-gray-800 font-bold text-2xl hover:bg-gray-300 transition-colors">+</button>
    </div>
);

const SellerCard: React.FC<{ seller: SellerProfile; onOrder: (seller: SellerProfile, gas: number, water: number) => void; }> = ({ seller, onOrder }) => {
  const [gasQuantity, setGasQuantity] = useState(0);
  const [waterQuantity, setWaterQuantity] = useState(0);
  
  const statusColor = seller.status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  const isOnline = seller.status === 'Online';
  
  const total = (gasQuantity * seller.prices.gas) + (waterQuantity * seller.prices.water);

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden flex flex-col ${!isOnline ? 'opacity-60' : ''}`}>
      <div className="p-6">
        <div className="flex items-center">
          <img className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-gray-200" src={seller.photoUrl} alt={seller.name} />
          <div className="flex-1">
            <p className="text-xl font-bold text-gray-800">{seller.name}</p>
            <p className="text-sm text-gray-600">Gás: {seller.brands.gas} &bull; Água: {seller.brands.water}</p>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>{seller.status}</span>
        </div>
        <div className="mt-4">
            <StarRating rating={seller.rating.average} count={seller.rating.count} />
        </div>
      </div>
      <div className="px-6 pt-4 space-y-4">
        {/* Gas Item */}
        <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <GasIcon className="w-12 h-12 text-red-500" />
                <div>
                    <p className="font-semibold text-gray-700">Gás P13</p>
                    <p className="text-gray-600 font-medium">R$ {seller.prices.gas.toFixed(2)}</p>
                </div>
            </div>
            <QuantityControl 
                quantity={gasQuantity}
                onDecrement={() => setGasQuantity(q => Math.max(0, q-1))}
                onIncrement={() => setGasQuantity(q => q+1)}
            />
        </div>
        {/* Water Item */}
        <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <WaterIcon className="w-12 h-12 text-blue-500" />
                <div>
                    <p className="font-semibold text-gray-700">Água 20L</p>
                    <p className="text-gray-600 font-medium">R$ {seller.prices.water.toFixed(2)}</p>
                </div>
            </div>
            <QuantityControl 
                quantity={waterQuantity}
                onDecrement={() => setWaterQuantity(q => Math.max(0, q-1))}
                onIncrement={() => setWaterQuantity(q => q+1)}
            />
        </div>
      </div>
      <div className="p-6 mt-auto bg-gray-50 rounded-b-xl">
        <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="text-2xl font-bold text-gray-800">R$ {total.toFixed(2)}</span>
        </div>
        <button
          onClick={() => onOrder(seller, gasQuantity, waterQuantity)}
          disabled={!isOnline || total === 0}
          className="w-full px-6 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-md hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75"
        >
          Pedir Agora
        </button>
      </div>
    </div>
  );
};

const OrderItem: React.FC<{ order: Order; seller?: SellerProfile, onRate: (order: Order) => void; }> = ({ order, seller, onRate }) => {
    const statusStyles: { [key in OrderStatus]: string } = {
        [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        [OrderStatus.ON_THE_WAY]: 'bg-blue-100 text-blue-800 border-blue-300',
        [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800 border-green-300',
    };
    
    const paymentStatusText = order.paymentStatus === 'Pago' 
        ? `Pago com ${order.paymentMethod}`
        : 'Pendente na entrega';
    const paymentStatusColor = order.paymentStatus === 'Pago' ? 'text-green-700' : 'text-yellow-700';

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <div className="flex-1">
                <p className="font-bold text-gray-800">Pedido #{order.id.slice(-6)}</p>
                <p className="text-sm text-gray-700">Vendedor: {seller?.name || 'Não encontrado'}</p>
                <p className="text-sm text-gray-600">{new Date(order.date).toLocaleDateString('pt-BR')} - {order.quantity}x {order.product}</p>
                 <p className={`text-xs font-semibold mt-1 ${paymentStatusColor}`}>{paymentStatusText}</p>
            </div>
            <div className="w-full sm:w-auto flex flex-col sm:items-end space-y-2">
                 <p className="text-lg font-bold text-gray-800">R$ {order.totalValue.toFixed(2)}</p>
                 <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[order.status]}`}>
                    {order.status}
                </span>
                {order.status === OrderStatus.DELIVERED && !order.rating && (
                    <button onClick={() => onRate(order)} className="mt-2 text-sm text-cyan-600 font-semibold hover:underline">
                        Avaliar
                    </button>
                )}
                {order.rating && (
                    <div className="mt-2 flex items-center">
                        <span className="text-sm text-gray-600 mr-2">Sua avaliação:</span>
                        {/* Fix: Changed [...Array(5)] to Array.from({ length: 5 }) to prevent potential iterator errors. */}
                        {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon key={i} className={`w-4 h-4 ${i < order.rating! ? 'text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


const ClientView: React.FC<ClientViewProps> = ({ user, sellers, orders, announcements, onLogout, onPlaceOrder, onRateOrder, onRegisterSeller, onUpdatePhoto, onUpdateUserInfo }) => {
  const [activeTab, setActiveTab] = useState('sellers');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('PIX');
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [visibleAnnouncement, setVisibleAnnouncement] = useState<Announcement | null>(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementToView, setAnnouncementToView] = useState<Announcement | null>(null);
  
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationPhone, setRegistrationPhone] = useState(user.phone || '');
  const [registrationGasBrand, setRegistrationGasBrand] = useState('');
  const [registrationWaterBrand, setRegistrationWaterBrand] = useState('');

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<UserProfileFormData | null>(null);

  useEffect(() => {
    const latestClientAnnouncement = announcements.find(ann => ann.target === AnnouncementTarget.CLIENTS);
    if (latestClientAnnouncement) {
      setVisibleAnnouncement(latestClientAnnouncement);
    }
  }, [announcements]);
  
  const handleOpenAnnouncement = (ann: Announcement) => {
    setAnnouncementToView(ann);
    setIsAnnouncementModalOpen(true);
  };

  const handleRegistrationSubmit = () => {
    if (!registrationPhone.trim() || !registrationGasBrand.trim() || !registrationWaterBrand.trim()) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    onRegisterSeller({
        phone: registrationPhone,
        gasBrand: registrationGasBrand,
        waterBrand: registrationWaterBrand,
    });
    setIsRegistrationModalOpen(false);
    // Reset fields
    setRegistrationPhone(user.phone || '');
    setRegistrationGasBrand('');
    setRegistrationWaterBrand('');
  };


  const [orderSummary, setOrderSummary] = useState<{
    seller: SellerProfile | null;
    gas: number;
    water: number;
    total: number;
  }>({ seller: null, gas: 0, water: 0, total: 0 });

  const [orderToRate, setOrderToRate] = useState<Order | null>(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [comment, setComment] = useState('');
  
  const sellersByNeighborhood = useMemo(() => {
    // FIX: Explicitly added a generic type to `reduce` to ensure correct return type inference from TypeScript.
    // This prevents the return value from being inferred as `unknown`, which caused the iterator error.
    return sellers.reduce<Record<string, SellerProfile[]>>((acc, seller) => {
      const neighborhood = seller.address.neighborhood;
      if (!acc[neighborhood]) {
        acc[neighborhood] = [];
      }
      acc[neighborhood].push(seller);
      return acc;
    }, {});
  }, [sellers]);

  const handleOrderClick = (seller: SellerProfile, gasQuantity: number, waterQuantity: number) => {
    const total = (gasQuantity * seller.prices.gas) + (waterQuantity * seller.prices.water);
    setOrderSummary({ seller, gas: gasQuantity, water: waterQuantity, total });
    setIsOrderModalOpen(true);
  };

  const handleConfirmOrder = () => {
    setIsOrderModalOpen(false);
    setPaymentState('idle');
    setIsPaymentModalOpen(true);
  };

  const handleFinalizePayment = () => {
    if (!orderSummary.seller) return;

    setPaymentState('processing');
    setTimeout(() => {
        setPaymentState('success');
        setTimeout(() => {
            onPlaceOrder(orderSummary.seller!, orderSummary.gas, orderSummary.water, selectedPaymentMethod);
            setIsPaymentModalOpen(false);
        }, 1500);
    }, 2000);
  }

  const handleOpenRatingModal = (order: Order) => {
    setOrderToRate(order);
    setCurrentRating(0);
    setComment('');
    setIsRatingModalOpen(true);
  };

  const handleConfirmRating = () => {
    if (orderToRate && currentRating > 0) {
        onRateOrder(orderToRate.id, currentRating, comment);
    }
    setIsRatingModalOpen(false);
  }
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpdate = () => {
      if (selectedFile) {
          onUpdatePhoto(user.id, selectedFile);
          setIsPhotoModalOpen(false);
          setSelectedFile(null);
          setPreviewUrl(null);
      }
  };
  
  const openPhotoModal = () => {
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsPhotoModalOpen(true);
  }

  const handleOpenEditModal = () => {
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: {
        street: user.address.street,
        number: user.address.number,
        neighborhood: user.address.neighborhood,
      },
    });
    setIsEditModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!editFormData) return;

    if (name.startsWith('address.')) {
        const key = name.split('.')[1] as keyof UserProfileFormData['address'];
        setEditFormData(prev => ({
            ...prev!,
            address: {
                ...prev!.address,
                [key]: value
            }
        }));
    } else {
        setEditFormData(prev => ({
            ...prev!,
            [name]: value
        }));
    }
  };

  const handleUpdateInfoSubmit = () => {
    if (editFormData) {
        onUpdateUserInfo(user.id, editFormData);
        setIsEditModalOpen(false);
    }
  };


  const TabButton: React.FC<{tabName: string; label: string}> = ({ tabName, label }) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`px-4 py-2 text-sm sm:text-base font-medium rounded-t-lg transition-colors ${activeTab === tabName ? 'border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600 hover:text-gray-800'}`}
    >
        {label}
    </button>
  );

  return (
    <div>
      <Header user={user} onLogout={onLogout} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {visibleAnnouncement && (
          <AnnouncementBanner 
            announcement={visibleAnnouncement} 
            onDismiss={() => setVisibleAnnouncement(null)}
            onClick={() => handleOpenAnnouncement(visibleAnnouncement)}
          />
        )}

        <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
                <TabButton tabName="sellers" label="Vendedores"/>
                <TabButton tabName="orders" label="Meus Pedidos"/>
                <TabButton tabName="profile" label="Meu Perfil"/>
            </nav>
        </div>

        {activeTab === 'sellers' && (
          <div>
            {Object.entries(sellersByNeighborhood).map(([neighborhood, sellersInHood]) => (
                <div key={neighborhood} className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
                        Vendedores em: <span className="text-cyan-600">{neighborhood}</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...sellersInHood].sort((a,b) => (a.status === 'Online' ? -1 : 1)).map(seller => (
                            <SellerCard key={seller.id} seller={seller} onOrder={handleOrderClick} />
                        ))}
                    </div>
                </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Histórico de Pedidos</h2>
            <div className="space-y-4">
              {orders.length > 0 ? (
                [...orders].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(order => (
                  <OrderItem key={order.id} order={order} seller={sellers.find(s => s.id === order.sellerId)} onRate={handleOpenRatingModal} />
                ))
              ) : (
                <p className="text-gray-600 text-center py-8">Você ainda não fez nenhum pedido.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Meu Perfil</h2>
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center">
                <div className="relative flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                  <img className="w-32 h-32 rounded-full object-cover border-4 border-gray-200" src={user.photoUrl} alt={user.name} />
                  <button
                    onClick={openPhotoModal}
                    className="absolute -bottom-1 -right-1 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    aria-label="Alterar foto de perfil"
                  >
                    <PencilIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <div className="text-center sm:text-left w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{user.name}</h3>
                      <p className="text-gray-600">{user.email}</p>
                      <p className="text-gray-600">{user.phone}</p>
                      <p className="mt-2 text-sm text-gray-500">
                        {user.address.street}, {user.address.number}<br/>
                        {user.address.neighborhood}, {user.address.city} - {user.address.state}
                      </p>
                    </div>
                     <button 
                        onClick={handleOpenEditModal}
                        className="p-2 text-gray-500 hover:text-cyan-600 hover:bg-cyan-100 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        aria-label="Editar perfil"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        <div className="bg-white p-4 rounded-lg shadow-sm mt-12 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-700 font-medium mb-2 sm:mb-0">Quer aumentar suas vendas? Venda gás e água em nossa plataforma!</p>
            <button
                onClick={() => setIsRegistrationModalOpen(true)}
                className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-colors"
            >
                Venda com a gente
            </button>
        </div>
      </main>

      <Modal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} title={`Confirmar Pedido`}>
        {orderSummary.seller && (
            <div>
              <p className="mb-4 text-gray-700">Resumo do seu pedido com <span className="font-semibold">{orderSummary.seller.name}</span>:</p>
              <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                {orderSummary.gas > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">{orderSummary.gas}x Gás P13</span>
                    <span className="font-medium text-gray-800">R$ {(orderSummary.gas * orderSummary.seller.prices.gas).toFixed(2)}</span>
                  </div>
                )}
                {orderSummary.water > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">{orderSummary.water}x Água 20L</span>
                    <span className="font-medium text-gray-800">R$ {(orderSummary.water * orderSummary.seller.prices.water).toFixed(2)}</span>
                  </div>
                )}
                 <div className="flex justify-between pt-2 border-t font-bold text-lg text-gray-900">
                    <span>Total</span>
                    <span>R$ {orderSummary.total.toFixed(2)}</span>
                  </div>
              </div>
              <p className="mt-4 text-sm text-gray-700">O endereço de entrega será: <span className="font-medium">{user.address.street}, {user.address.number}.</span></p>

              <div className="mt-6 flex justify-end space-x-3">
                 <button onClick={() => setIsOrderModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                    Cancelar
                 </button>
                 <button onClick={handleConfirmOrder} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700">
                    Ir para Pagamento
                 </button>
              </div>
            </div>
        )}
      </Modal>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Pagamento">
        <div className="min-h-[350px]">
            {paymentState === 'idle' && orderSummary.seller && (
                <div>
                    <div className="mb-4">
                        <p className="text-center text-gray-700">Valor total</p>
                        <p className="text-center text-4xl font-bold text-gray-900">R$ {orderSummary.total.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-center border border-gray-200 rounded-lg p-1 mb-6">
                        <button onClick={() => setSelectedPaymentMethod('PIX')} className={`flex-1 p-2 rounded-md text-sm font-semibold flex items-center justify-center transition-colors ${selectedPaymentMethod === 'PIX' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-100'}`}><PixIcon className="w-5 h-5 mr-2"/> PIX</button>
                        <button onClick={() => setSelectedPaymentMethod('Cartão de Crédito')} className={`flex-1 p-2 rounded-md text-sm font-semibold flex items-center justify-center transition-colors ${selectedPaymentMethod === 'Cartão de Crédito' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-100'}`}><CreditCardIcon className="w-5 h-5 mr-2" /> Cartão</button>
                        <button onClick={() => setSelectedPaymentMethod('Na Entrega')} className={`flex-1 p-2 rounded-md text-sm font-semibold flex items-center justify-center transition-colors ${selectedPaymentMethod === 'Na Entrega' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-100'}`}>Na Entrega</button>
                    </div>

                    {selectedPaymentMethod === 'PIX' && (
                        <div className="text-center">
                            <QrCodeIcon className="w-40 h-40 mx-auto text-gray-700 p-2 border rounded-lg"/>
                            <p className="text-sm text-gray-700 mt-2">Escaneie o QR Code para pagar.</p>
                            <button onClick={handleFinalizePayment} className="mt-4 w-full px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700">
                                Simular Pagamento PIX
                            </button>
                        </div>
                    )}
                    {selectedPaymentMethod === 'Cartão de Crédito' && (
                         <div className="space-y-3">
                            <input type="text" placeholder="Número do Cartão" className="w-full p-2 border rounded-md" disabled/>
                            <input type="text" placeholder="Nome no Cartão" className="w-full p-2 border rounded-md" disabled/>
                            <div className="flex space-x-3">
                                <input type="text" placeholder="MM/AA" className="w-1/2 p-2 border rounded-md" disabled/>
                                <input type="text" placeholder="CVV" className="w-1/2 p-2 border rounded-md" disabled/>
                            </div>
                            <button onClick={handleFinalizePayment} className="w-full px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700">
                                Pagar com Cartão
                            </button>
                        </div>
                    )}
                     {selectedPaymentMethod === 'Na Entrega' && (
                        <div className="text-center">
                            <p className="bg-gray-100 p-4 rounded-md text-gray-700">O pagamento será realizado diretamente ao entregador no momento do recebimento do produto.</p>
                            <button onClick={() => onPlaceOrder(orderSummary.seller!, orderSummary.gas, orderSummary.water, 'Na Entrega')} className="mt-4 w-full px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700">
                                Confirmar Pedido
                            </button>
                        </div>
                    )}
                </div>
            )}
            {paymentState === 'processing' && (
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-dashed rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg font-semibold text-gray-700">Processando pagamento...</p>
                </div>
            )}
             {paymentState === 'success' && (
                <div className="flex flex-col items-center justify-center h-full">
                    <CheckCircleIcon className="w-24 h-24 text-green-500"/>
                    <p className="mt-4 text-2xl font-bold text-gray-800">Pagamento Aprovado!</p>
                    <p className="text-gray-600">Seu pedido já foi enviado ao vendedor.</p>
                </div>
            )}
        </div>
      </Modal>

        <Modal isOpen={isRatingModalOpen} onClose={() => setIsRatingModalOpen(false)} title={`Avaliar Pedido #${orderToRate?.id.slice(-6)}`}>
            {orderToRate && (
                <div>
                    <p className="mb-4 text-gray-700">Como foi sua experiência com <span className="font-semibold">{sellers.find(s => s.id === orderToRate.sellerId)?.name}</span>?</p>
                    
                    <div className="mb-4">
                        <label className="font-semibold text-gray-700">Sua Avaliação:</label>
                        <div className="flex justify-center items-center my-3 space-x-2">
                             {/* Fix: Changed [...Array(5)] to Array.from({ length: 5 }) to fix iterator error. */}
                             {Array.from({ length: 5 }).map((_, i) => {
                                const ratingValue = i + 1;
                                return (
                                    <button key={ratingValue} onClick={() => setCurrentRating(ratingValue)}>
                                        <StarIcon className={`w-10 h-10 transition-colors ${ratingValue <= currentRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`} />
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                     <div className="mb-6">
                        <label htmlFor="comment" className="block mb-2 font-semibold text-gray-700">Comentário (opcional):</label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="Deixe sua opinião sobre o serviço..."
                        />
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button onClick={() => setIsRatingModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Cancelar
                        </button>
                        <button onClick={handleConfirmRating} disabled={currentRating === 0} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 disabled:bg-gray-400">
                            Enviar Avaliação
                        </button>
                    </div>
                </div>
            )}
        </Modal>

        <Modal isOpen={isAnnouncementModalOpen} onClose={() => setIsAnnouncementModalOpen(false)} title="Comunicado">
            <p className="text-gray-700 whitespace-pre-wrap">{announcementToView?.message}</p>
            <div className="mt-6 flex justify-end">
                <button onClick={() => setIsAnnouncementModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                    Fechar
                </button>
            </div>
        </Modal>

        <Modal isOpen={isRegistrationModalOpen} onClose={() => setIsRegistrationModalOpen(false)} title="Torne-se um Vendedor">
            <div>
                <p className="text-gray-600 mb-4">Preencha os dados abaixo para solicitar seu cadastro. Suas informações de perfil (nome, email, endereço) serão aproveitadas.</p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-700">Telefone para Contato</label>
                        <input type="tel" id="reg-phone" value={registrationPhone} onChange={e => setRegistrationPhone(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" />
                    </div>
                    <div>
                        <label htmlFor="reg-gas" className="block text-sm font-medium text-gray-700">Marca do Gás que vende</label>
                        <input type="text" id="reg-gas" value={registrationGasBrand} onChange={e => setRegistrationGasBrand(e.target.value)} placeholder="Ex: Supergás" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" />
                    </div>
                    <div>
                        <label htmlFor="reg-water" className="block text-sm font-medium text-gray-700">Marca da Água que vende</label>
                        <input type="text" id="reg-water" value={registrationWaterBrand} onChange={e => setRegistrationWaterBrand(e.target.value)} placeholder="Ex: Crystal" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={() => setIsRegistrationModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                        Cancelar
                    </button>
                    <button onClick={handleRegistrationSubmit} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700">
                        Enviar Solicitação
                    </button>
                </div>
            </div>
        </Modal>

      <Modal isOpen={isPhotoModalOpen} onClose={() => setIsPhotoModalOpen(false)} title="Alterar Foto de Perfil">
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div 
            className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-center cursor-pointer hover:bg-gray-200"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Pré-visualização" className="h-full w-full object-cover rounded-lg" />
            ) : (
              <p className="text-gray-500">Clique para selecionar uma imagem</p>
            )}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setIsPhotoModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={handlePhotoUpdate}
              disabled={!selectedFile}
              className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Salvar Nova Foto
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Perfil">
        {editFormData && (
          <div>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                <input type="text" name="name" id="name" value={editFormData.name} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" id="email" value={editFormData.email} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                <input type="tel" name="phone" id="phone" value={editFormData.phone} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" />
              </div>
              <div className="border-t pt-4">
                <h4 className="text-md font-semibold text-gray-700">Endereço</h4>
                <div className="mt-2 space-y-4">
                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700">Rua</label>
                    <input type="text" name="address.street" id="street" value={editFormData.address.street} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="number" className="block text-sm font-medium text-gray-700">Número</label>
                      <input type="text" name="address.number" id="number" value={editFormData.address.number} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" />
                    </div>
                    <div>
                      <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700">Bairro</label>
                      <input type="text" name="address.neighborhood" id="neighborhood" value={editFormData.address.neighborhood} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                Cancelar
              </button>
              <button onClick={handleUpdateInfoSubmit} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700">
                Salvar Alterações
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default ClientView;
