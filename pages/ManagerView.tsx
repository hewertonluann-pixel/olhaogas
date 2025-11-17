




import React, { useState, useMemo } from 'react';
import { User, SellerProfile, Order, SellerStatus, Announcement, AnnouncementTarget, NewSellerFormData } from '../types';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { COMMISSION_RATE } from '../constants';
import { MoneyIcon, ChartBarIcon, UsersIcon } from '../components/Icons';

interface ManagerViewProps {
  manager: User;
  sellers: SellerProfile[];
  orders: Order[];
  users: (User | SellerProfile)[];
  announcements: Announcement[];
  onLogout: () => void;
  onApproveSeller: (sellerId: string, approved: boolean) => void;
  onRemoveSeller: (sellerId: string) => void;
  onSendAnnouncement: (message: string, target: AnnouncementTarget) => void;
  onCreateSeller: (formData: NewSellerFormData) => void;
}

const initialSellerForm: NewSellerFormData = {
    name: '',
    email: '',
    phone: '',
    address: { street: '', number: '', neighborhood: '', city: 'São Paulo', state: 'SP' },
    brands: { gas: '', water: '' },
    prices: { gas: 0, water: 0 }
};


const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
        <div className={`rounded-full p-3 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const SellerStatusChart: React.FC<{ sellers: SellerProfile[] }> = ({ sellers }) => {
    const online = sellers.filter(s => s.status === SellerStatus.ONLINE && s.approved).length;
    const offline = sellers.filter(s => s.status === SellerStatus.OFFLINE && s.approved).length;
    const total = online + offline;
    const onlinePercentage = total > 0 ? (online / total) * 100 : 0;
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-md h-full">
            <h3 className="font-bold text-gray-700 mb-4">Vendedores Ativos</h3>
            <div className="flex items-center justify-center space-x-6">
                <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="3"
                        />
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeDasharray={`${onlinePercentage}, 100`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-800">{online}</span>
                        <span className="text-sm text-gray-600">Online</span>
                    </div>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                        <span>Online: {online}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                        <span>Offline: {offline}</span>
                    </div>
                     <div className="flex items-center font-semibold pt-1">
                        <span>Total: {total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

const SellerRow: React.FC<{seller: SellerProfile, onApprove: (id: string, approved: boolean) => void, onRemove: (id: string) => void}> = ({ seller, onApprove, onRemove }) => {
    return (
        <tr className="bg-white border-b hover:bg-gray-50">
            <td className="px-6 py-4">
                <div className="flex items-center">
                    <img className="w-10 h-10 rounded-full object-cover" src={seller.photoUrl} alt={seller.name} />
                    <div className="pl-3">
                        <div className="text-base font-semibold text-gray-900">{seller.name}</div>
                        <div className="font-normal text-gray-600">{seller.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm">
                    <span className="font-semibold text-gray-700">Gás: </span>{seller.brands.gas}
                </div>
                <div className="text-sm">
                    <span className="font-semibold text-gray-700">Água: </span>{seller.brands.water}
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${seller.status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {seller.status}
                </span>
            </td>
             <td className="px-6 py-4">
                <span className={`px-2 py-1 font-semibold text-xs rounded-full ${seller.approved ? 'bg-cyan-100 text-cyan-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {seller.approved ? 'Aprovado' : 'Pendente'}
                </span>
            </td>
            <td className="px-6 py-4 flex items-center space-x-2">
                {!seller.approved ? (
                    <button onClick={() => onApprove(seller.id, true)} className="font-medium text-green-600 hover:underline">Aprovar</button>
                ) : (
                     <button onClick={() => onApprove(seller.id, false)} className="font-medium text-yellow-600 hover:underline">Revogar</button>
                )}
                <button onClick={() => onRemove(seller.id)} className="font-medium text-red-600 hover:underline">Remover</button>
            </td>
        </tr>
    )
};

const OrderRow: React.FC<{order: Order, client?: User, seller?: SellerProfile}> = ({ order, client, seller }) => {
    return (
         <tr className="bg-white border-b hover:bg-gray-50">
             <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">#{order.id.slice(-6)}</td>
             <td className="px-6 py-4">{client?.name || 'N/A'}</td>
             <td className="px-6 py-4">{seller?.name || 'N/A'}</td>
             <td className="px-6 py-4">{new Date(order.date).toLocaleDateString('pt-BR')}</td>
             <td className="px-6 py-4">{order.status}</td>
             <td className="px-6 py-4">{order.paymentMethod || 'N/A'}</td>
             <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.paymentStatus === 'Pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.paymentStatus || 'Pendente'}
                </span>
            </td>
             <td className="px-6 py-4 font-semibold">R$ {order.totalValue.toFixed(2)}</td>
             <td className="px-6 py-4 font-semibold text-green-600">R$ {(order.totalValue * COMMISSION_RATE).toFixed(2)}</td>
        </tr>
    );
};


const ManagerView: React.FC<ManagerViewProps> = ({ manager, sellers, orders, users, announcements, onLogout, onApproveSeller, onRemoveSeller, onSendAnnouncement, onCreateSeller }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeFilter, setTimeFilter] = useState<'day' | 'month' | 'all'>('day');
  
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState<AnnouncementTarget>(AnnouncementTarget.CLIENTS);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSellerData, setNewSellerData] = useState<NewSellerFormData>(initialSellerForm);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    
    if (keys.length === 1) {
        setNewSellerData(prev => ({ ...prev, [name]: value }));
    } else {
        const [level1, level2] = keys as [keyof NewSellerFormData, string];
        if (typeof newSellerData[level1] === 'object' && newSellerData[level1] !== null) {
            const isPrice = level1 === 'prices';
            setNewSellerData(prev => ({
                ...prev,
                [level1]: {
                    ...(prev[level1] as object),
                    [level2]: isPrice ? parseFloat(value) || 0 : value,
                },
            }));
        }
    }
  };

  const handleCreateSubmit = () => {
    if (!newSellerData.name || !newSellerData.email || !newSellerData.phone || !newSellerData.address.street) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    onCreateSeller(newSellerData);
    setIsCreateModalOpen(false);
    setNewSellerData(initialSellerForm);
  };


  const handleSendClick = () => {
    onSendAnnouncement(announcementMessage, announcementTarget);
    setAnnouncementMessage(''); // Clear message after sending
  };

  const { totalCommission, totalSales, periodLabel } = useMemo(() => {
    const now = new Date();
    
    let filteredOrders = orders;
    let label = 'Geral';

    if (timeFilter === 'day') {
      const todayString = now.toDateString();
      filteredOrders = orders.filter(order => new Date(order.date).toDateString() === todayString);
      label = 'Hoje';
    } else if (timeFilter === 'month') {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      });
      label = 'Este Mês';
    }

    const commission = filteredOrders.reduce((sum, order) => sum + order.totalValue * COMMISSION_RATE, 0);
    const sales = filteredOrders.reduce((sum, order) => sum + order.totalValue, 0);

    return { totalCommission: commission, totalSales: sales, periodLabel: label };
  }, [orders, timeFilter]);

  const TabButton: React.FC<{tabName: string; label: string}> = ({ tabName, label }) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`px-4 py-2 text-sm sm:text-base font-medium rounded-t-lg transition-colors ${activeTab === tabName ? 'border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600 hover:text-gray-800'}`}
    >
        {label}
    </button>
  );

  const FilterButton: React.FC<{filterValue: 'day' | 'month' | 'all'; label: string}> = ({ filterValue, label }) => (
    <button
      onClick={() => setTimeFilter(filterValue)}
      className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${timeFilter === filterValue ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-600 hover:bg-gray-300'}`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <Header user={manager} onLogout={onLogout} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Painel Administrativo</h1>
         <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
                <TabButton tabName="dashboard" label="Dashboard"/>
                <TabButton tabName="sellers" label="Gerenciar Vendedores"/>
                <TabButton tabName="orders" label="Todos os Pedidos"/>
                <TabButton tabName="announcements" label="Comunicados"/>
            </nav>
        </div>

        {activeTab === 'dashboard' && (
            <div className="space-y-6">
                <div className="flex justify-end">
                    <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
                        <FilterButton filterValue="day" label="Hoje" />
                        <FilterButton filterValue="month" label="Este Mês" />
                        <FilterButton filterValue="all" label="Geral" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard title={`Comissão (${periodLabel})`} value={`R$ ${totalCommission.toFixed(2)}`} icon={<MoneyIcon className="w-6 h-6 text-green-600"/>} color="bg-green-100" />
                    <StatCard title={`Vendas (${periodLabel})`} value={`R$ ${totalSales.toFixed(2)}`} icon={<ChartBarIcon className="w-6 h-6 text-cyan-600"/>} color="bg-cyan-100" />
                </div>
                <div className="max-w-md mx-auto">
                    <SellerStatusChart sellers={sellers} />
                </div>
            </div>
        )}

        {activeTab === 'sellers' && (
            <div>
                 <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        Cadastrar Novo Vendedor
                    </button>
                </div>
                 <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left text-gray-700">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Vendedor</th>
                                <th scope="col" className="px-6 py-3">Marcas</th>
                                <th scope="col" className="px-6 py-3">Status Atividade</th>
                                <th scope="col" className="px-6 py-3">Status Aprovação</th>
                                <th scope="col" className="px-6 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...sellers].sort((a,b) => a.approved === b.approved ? 0 : a.approved? 1 : -1).map(s => <SellerRow key={s.id} seller={s} onApprove={onApproveSeller} onRemove={onRemoveSeller} />)}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'orders' && (
             <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-700">
                     <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID Pedido</th>
                            <th scope="col" className="px-6 py-3">Cliente</th>
                            <th scope="col" className="px-6 py-3">Vendedor</th>
                            <th scope="col" className="px-6 py-3">Data</th>
                            <th scope="col" className="px-6 py-3">Status Pedido</th>
                            <th scope="col" className="px-6 py-3">Método Pag.</th>
                            <th scope="col" className="px-6 py-3">Status Pag.</th>
                            <th scope="col" className="px-6 py-3">Valor Total</th>
                            <th scope="col" className="px-6 py-3">Comissão</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(order => {
                           const client = users.find(u => u.id === order.clientId);
                           const seller = sellers.find(s => s.id === order.sellerId);
                           return <OrderRow key={order.id} order={order} client={client} seller={seller} />
                        })}
                    </tbody>
                </table>
             </div>
        )}
        
        {activeTab === 'announcements' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Enviar Novo Comunicado</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="announcement-message" className="block text-sm font-medium text-gray-700">Mensagem</label>
                  <textarea
                    id="announcement-message"
                    rows={5}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                    placeholder="Digite sua mensagem aqui..."
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enviar para</label>
                  <div className="mt-2 flex space-x-4">
                    <div className="flex items-center">
                      <input
                        id="target-clients"
                        name="announcement-target"
                        type="radio"
                        checked={announcementTarget === AnnouncementTarget.CLIENTS}
                        onChange={() => setAnnouncementTarget(AnnouncementTarget.CLIENTS)}
                        className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-gray-300"
                      />
                      <label htmlFor="target-clients" className="ml-2 block text-sm text-gray-900">Clientes</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="target-sellers"
                        name="announcement-target"
                        type="radio"
                        checked={announcementTarget === AnnouncementTarget.SELLERS}
                        onChange={() => setAnnouncementTarget(AnnouncementTarget.SELLERS)}
                        className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-gray-300"
                      />
                      <label htmlFor="target-sellers" className="ml-2 block text-sm text-gray-900">Vendedores</label>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    onClick={handleSendClick}
                    disabled={!announcementMessage.trim()}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-400"
                  >
                    Enviar Comunicado
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Histórico de Comunicados</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {announcements.length > 0 ? (
                  announcements.map(ann => (
                    <div key={ann.id} className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm text-gray-800">{ann.message}</p>
                      <div className="text-xs text-gray-500 mt-2 flex justify-between items-center">
                        <span>Para: <span className="font-semibold">{ann.target}</span></span>
                        <span>{new Date(ann.date).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600 text-center py-4">Nenhum comunicado enviado ainda.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Cadastrar Novo Vendedor">
          <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
              <h4 className="text-md font-semibold text-gray-700 border-b pb-2">Informações Pessoais</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                    <input type="text" name="name" value={newSellerData.name} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" value={newSellerData.email} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" />
                </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <input type="tel" name="phone" value={newSellerData.phone} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" />
              </div>

              <h4 className="text-md font-semibold text-gray-700 border-b pb-2 pt-4">Endereço</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Rua</label>
                      <input type="text" name="address.street" value={newSellerData.address.street} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Número</label>
                      <input type="text" name="address.number" value={newSellerData.address.number} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Bairro</label>
                      <input type="text" name="address.neighborhood" value={newSellerData.address.neighborhood} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" />
                  </div>
              </div>
              
              <h4 className="text-md font-semibold text-gray-700 border-b pb-2 pt-4">Produtos</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Marca do Gás</label>
                      <input type="text" name="brands.gas" value={newSellerData.brands.gas} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Preço do Gás (R$)</label>
                      <input type="number" name="prices.gas" value={newSellerData.prices.gas} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Marca da Água</label>
                      <input type="text" name="brands.water" value={newSellerData.brands.water} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" />
                  </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700">Preço da Água (R$)</label>
                      <input type="number" name="prices.water" value={newSellerData.prices.water} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" />
                  </div>
              </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
              <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                  Cancelar
              </button>
              <button onClick={handleCreateSubmit} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700">
                  Salvar Vendedor
              </button>
          </div>
      </Modal>

    </div>
  );
};

export default ManagerView;