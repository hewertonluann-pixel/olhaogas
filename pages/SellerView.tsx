import React, { useState, useEffect, useRef } from 'react';
import { SellerProfile, Order, OrderStatus, SellerStatus, User, Announcement, AnnouncementTarget } from '../types';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { BellIcon, PencilIcon } from '../components/Icons';

// --- Notification System ---

const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Auto-close after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className="fixed top-6 right-6 z-50 bg-white rounded-lg shadow-xl p-4 flex items-center border-l-4 border-cyan-500"
      role="alert"
      aria-live="assertive"
    >
      <svg className="w-6 h-6 text-cyan-500 mr-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span className="text-gray-800 font-semibold">{message}</span>
      <button onClick={onClose} className="ml-4 -mr-2 p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500">
         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
             <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
         </svg>
      </button>
    </div>
  );
};

const playNotificationSound = () => {
  if (document.hidden) {
    return; // Don't play sound if tab is not active
  }
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioCtx) return;
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
  
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.01);
  
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.type = 'sine';
    oscillator.start(audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch(e) {
      console.error("Could not play notification sound:", e);
  }
};


// --- Announcement Banner ---
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

// --- Component Interfaces & Definitions ---

interface SellerViewProps {
  seller: SellerProfile;
  orders: Order[];
  users: (User | SellerProfile)[];
  announcements: Announcement[];
  onLogout: () => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateSellerStatus: (sellerId: string, status: SellerStatus) => void;
  onUpdateSellerInfo: (
    sellerId: string,
    newInfo: {
      prices: { gas: number; water: number };
      brands: { gas: string; water: string };
    }
  ) => void;
  onUpdateSellerPhoto: (sellerId: string, photoFile: File) => void;
}

const OrderCard: React.FC<{ order: Order; client?: User; onUpdate: (order: Order, status: OrderStatus) => void }> = ({ order, client, onUpdate }) => {
    const statusStyles: { [key in OrderStatus]: string } = {
        [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        [OrderStatus.ON_THE_WAY]: 'bg-blue-100 text-blue-800 border-blue-300',
        [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800 border-green-300',
    };

    const clientAddress = client?.address ? `${client.address.street}, ${client.address.number} - ${client.address.neighborhood}` : 'Endereço não encontrado';
    const paymentStatusText = order.paymentStatus === 'Pago' ? `Pago (${order.paymentMethod})` : 'Receber na Entrega';
    const paymentStatusColor = order.paymentStatus === 'Pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

    return (
        <div className="bg-white rounded-lg shadow-md border overflow-hidden">
            <div className={`p-4 border-l-4 ${statusStyles[order.status].replace('bg-', 'border-').replace('text-', 'border-')}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-gray-800">Pedido #{order.id.slice(-6)}</p>
                        <p className="text-sm text-gray-700">Cliente: {client?.name || 'Não encontrado'}</p>
                        <p className="text-sm text-gray-600">{clientAddress}</p>
                    </div>
                     <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[order.status]}`}>
                        {order.status}
                    </span>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <div>
                        <p className="text-gray-600 text-sm">{order.quantity}x {order.product}</p>
                        <p className="font-bold text-lg text-gray-800">R$ {order.totalValue.toFixed(2)}</p>
                        <span className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${paymentStatusColor}`}>{paymentStatusText}</span>
                    </div>
                    {order.status !== OrderStatus.DELIVERED && (
                        <div className="flex space-x-2">
                             {order.status === OrderStatus.PENDING && (
                                <button onClick={() => onUpdate(order, OrderStatus.ON_THE_WAY)} className="px-3 py-1.5 text-sm bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600">
                                    A Caminho
                                </button>
                             )}
                            {order.status === OrderStatus.ON_THE_WAY && (
                                <button onClick={() => onUpdate(order, OrderStatus.DELIVERED)} className="px-3 py-1.5 text-sm bg-green-500 text-white font-semibold rounded-md hover:bg-green-600">
                                    Entregue
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const SellerView: React.FC<SellerViewProps> = ({ seller, orders, users, announcements, onLogout, onUpdateOrderStatus, onUpdateSellerStatus, onUpdateSellerInfo, onUpdateSellerPhoto }) => {
    
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isPhotoChangeModalOpen, setIsPhotoChangeModalOpen] = useState(false);
    const [newGasPrice, setNewGasPrice] = useState(String(seller.prices.gas.toFixed(2)));
    const [newWaterPrice, setNewWaterPrice] = useState(String(seller.prices.water.toFixed(2)));
    const [newGasBrand, setNewGasBrand] = useState(seller.brands.gas);
    const [newWaterBrand, setNewWaterBrand] = useState(seller.brands.water);
    const [visibleAnnouncement, setVisibleAnnouncement] = useState<Announcement | null>(null);
    const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
    const [announcementToView, setAnnouncementToView] = useState<Announcement | null>(null);
    const [orderToUpdate, setOrderToUpdate] = useState<Order | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);
    const prevPendingOrdersCount = useRef(pendingOrders.length);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const currentPendingCount = orders.filter(o => o.status === OrderStatus.PENDING).length;

        if (currentPendingCount > prevPendingOrdersCount.current) {
            const newOrdersCount = currentPendingCount - prevPendingOrdersCount.current;
            setToastMessage(newOrdersCount > 1 ? `Você tem ${newOrdersCount} novos pedidos!` : 'Você tem um novo pedido!');
            playNotificationSound();
        }

        prevPendingOrdersCount.current = currentPendingCount;
    }, [orders]);
    
    useEffect(() => {
        const latestSellerAnnouncement = announcements.find(ann => ann.target === AnnouncementTarget.SELLERS);
        if (latestSellerAnnouncement) {
          setVisibleAnnouncement(latestSellerAnnouncement);
        }
    }, [announcements]);
    
    const otherOrders = orders.filter(o => o.status !== OrderStatus.PENDING).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const handleOpenAnnouncement = (ann: Announcement) => {
        setAnnouncementToView(ann);
        setIsAnnouncementModalOpen(true);
    };

    const handleInitiateStatusUpdate = (order: Order, status: OrderStatus) => {
        if (status === OrderStatus.DELIVERED) {
            setOrderToUpdate(order);
        } else {
            onUpdateOrderStatus(order.id, status);
        }
    };

    const handleConfirmDelivery = () => {
        if (orderToUpdate) {
            onUpdateOrderStatus(orderToUpdate.id, OrderStatus.DELIVERED);
            setOrderToUpdate(null);
        }
    };

    const handleStatusToggle = () => {
        const newStatus = seller.status === SellerStatus.ONLINE ? SellerStatus.OFFLINE : SellerStatus.ONLINE;
        onUpdateSellerStatus(seller.id, newStatus);
    }

    const handleOpenInfoModal = () => {
        setNewGasPrice(String(seller.prices.gas.toFixed(2)));
        setNewWaterPrice(String(seller.prices.water.toFixed(2)));
        setNewGasBrand(seller.brands.gas);
        setNewWaterBrand(seller.brands.water);
        setIsInfoModalOpen(true);
    }

    const handleInfoUpdate = () => {
        const gas = parseFloat(newGasPrice);
        const water = parseFloat(newWaterPrice);
        
        if (isNaN(gas) || isNaN(water) || gas <= 0 || water <= 0) {
            alert("Por favor, insira valores válidos e positivos para os preços.");
            return;
        }
        if (!newGasBrand.trim() || !newWaterBrand.trim()) {
            alert("Por favor, insira o nome da marca para o gás e para a água.");
            return;
        }

        onUpdateSellerInfo(seller.id, {
          prices: { gas, water },
          brands: { gas: newGasBrand, water: newWaterBrand },
        });
        setIsInfoModalOpen(false);
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
            onUpdateSellerPhoto(seller.id, selectedFile);
            setIsPhotoChangeModalOpen(false);
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    };
    
    const openPhotoModal = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsPhotoChangeModalOpen(true);
    }

  return (
    <div>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      <Header user={seller} onLogout={onLogout} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {visibleAnnouncement && (
          <AnnouncementBanner 
            announcement={visibleAnnouncement} 
            onDismiss={() => setVisibleAnnouncement(null)}
            onClick={() => handleOpenAnnouncement(visibleAnnouncement)}
          />
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="flex items-center mb-4 sm:mb-0">
                    <div className="relative flex-shrink-0 mr-5">
                        <img className="w-24 h-24 rounded-full object-cover" src={seller.photoUrl} alt={seller.name} />
                        <button
                            onClick={openPhotoModal}
                            className="absolute -bottom-1 -right-1 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            aria-label="Alterar foto de perfil"
                        >
                            <PencilIcon className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{seller.name}</h1>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-gray-700 mt-2">
                            <div><span className="font-medium">Gás:</span> {seller.brands.gas} (<span className="font-semibold text-cyan-700">R$ {seller.prices.gas.toFixed(2)}</span>)</div>
                            <div><span className="font-medium">Água:</span> {seller.brands.water} (<span className="font-semibold text-blue-700">R$ {seller.prices.water.toFixed(2)}</span>)</div>
                             <button onClick={handleOpenInfoModal} className="p-1.5 text-gray-500 hover:text-cyan-600 hover:bg-cyan-100 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500" aria-label="Alterar preços e marcas">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-4 self-start sm:self-center">
                    <span className="font-medium text-gray-700">Status:</span>
                    <button
                        onClick={handleStatusToggle}
                        className={`w-32 text-center px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                            seller.status === SellerStatus.ONLINE 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                    >
                        {seller.status}
                    </button>
                </div>
            </div>
        </div>
        
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Pedidos Pendentes ({pendingOrders.length})</h2>
            {pendingOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingOrders.map(order => (
                        <OrderCard key={order.id} order={order} client={users.find(u => u.id === order.clientId)} onUpdate={handleInitiateStatusUpdate}/>
                    ))}
                </div>
            ) : (
                <p className="text-gray-600">Nenhum pedido pendente no momento.</p>
            )}
        </div>
        
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Histórico de Pedidos</h2>
             {otherOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {otherOrders.map(order => (
                        <OrderCard key={order.id} order={order} client={users.find(u => u.id === order.clientId)} onUpdate={handleInitiateStatusUpdate}/>
                    ))}
                </div>
            ) : (
                <p className="text-gray-600">Nenhum pedido no histórico.</p>
            )}
        </div>

      </main>

       <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Alterar Informações dos Produtos">
        <div className="space-y-4">
            <div>
                <label htmlFor="gas-brand" className="block text-sm font-medium text-gray-700">Marca do Gás (P13)</label>
                <input
                    type="text"
                    name="gas-brand"
                    id="gas-brand"
                    className="mt-1 focus:ring-cyan-500 focus:border-cyan-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={newGasBrand}
                    onChange={(e) => setNewGasBrand(e.target.value)}
                    placeholder="Ex: Supergás"
                />
            </div>
            <div>
                <label htmlFor="gas-price" className="block text-sm font-medium text-gray-700">Preço do Gás (P13)</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">R$</span>
                    </div>
                    <input
                        type="number"
                        name="gas-price"
                        id="gas-price"
                        className="focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-10 pr-4 py-2 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        value={newGasPrice}
                        onChange={(e) => setNewGasPrice(e.target.value)}
                        step="0.01"
                        min="0"
                    />
                </div>
            </div>
             <div className="border-t border-gray-200 !mt-6 !mb-2"></div>
             <div>
                <label htmlFor="water-brand" className="block text-sm font-medium text-gray-700">Marca da Água (20L)</label>
                 <input
                    type="text"
                    name="water-brand"
                    id="water-brand"
                    className="mt-1 focus:ring-cyan-500 focus:border-cyan-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={newWaterBrand}
                    onChange={(e) => setNewWaterBrand(e.target.value)}
                    placeholder="Ex: Crystal"
                />
            </div>
             <div>
                <label htmlFor="water-price" className="block text-sm font-medium text-gray-700">Preço da Água (20L)</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">R$</span>
                    </div>
                    <input
                        type="number"
                        name="water-price"
                        id="water-price"
                        className="focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-10 pr-4 py-2 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        value={newWaterPrice}
                        onChange={(e) => setNewWaterPrice(e.target.value)}
                        step="0.01"
                        min="0"
                    />
                </div>
            </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
            <button onClick={() => setIsInfoModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                Cancelar
            </button>
            <button onClick={handleInfoUpdate} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700">
                Salvar Alterações
            </button>
        </div>
      </Modal>

      <Modal isOpen={!!orderToUpdate} onClose={() => setOrderToUpdate(null)} title="Confirmar Entrega">
        {orderToUpdate && (
            <div>
                <p className="text-gray-700">
                    Confirma que foi entregue o pedido <strong>#{orderToUpdate.id.slice(-6)}</strong>?
                </p>
                <p className="text-sm text-gray-500 mt-2">Esta ação não poderá ser desfeita.</p>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={() => setOrderToUpdate(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                        Cancelar
                    </button>
                    <button onClick={handleConfirmDelivery} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">
                        Confirmar Entrega
                    </button>
                </div>
            </div>
        )}
       </Modal>
      
      <Modal isOpen={isAnnouncementModalOpen} onClose={() => setIsAnnouncementModalOpen(false)} title="Comunicado do Gerente">
        {announcementToView && (
            <div>
              <p className="text-gray-700 whitespace-pre-wrap">{announcementToView.message}</p>
              <div className="mt-6 flex justify-end">
                  <button onClick={() => setIsAnnouncementModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                      Fechar
                  </button>
              </div>
            </div>
        )}
      </Modal>

      <Modal isOpen={isPhotoChangeModalOpen} onClose={() => setIsPhotoChangeModalOpen(false)} title="Alterar Foto de Perfil">
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
              onClick={() => setIsPhotoChangeModalOpen(false)}
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

    </div>
  );
};

export default SellerView;