import React, { useState } from 'react';
import { UserRole } from '../types';
import { LogoIcon, GoogleIcon } from '../components/Icons';
import Modal from '../components/Modal';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    onLogin(role);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 flex flex-col justify-center items-center p-4">
        <div className="text-center mb-10">
          <div className="flex justify-center items-center">
            <LogoIcon className="w-16 h-16 text-cyan-400" />
            <h1 className="text-4xl sm:text-5xl font-bold text-white ml-4 tracking-tight">Olha o Gás</h1>
          </div>
          <p className="text-lg text-gray-300 mt-2">Sua entrega de gás e água, mais rápida e fácil.</p>
        </div>

        <div className="w-full max-w-xs">
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center p-3 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
                <GoogleIcon className="w-6 h-6" />
                <span className="ml-3 font-semibold text-gray-700">Entrar com o Google</span>
            </button>
        </div>
        <p className="text-sm text-gray-500 mt-8">Este é um sistema de demonstração.</p>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Simulação de Login">
        <div>
          <p className="text-gray-600 mb-4">Escolha o perfil com o qual você deseja entrar:</p>
          <div className="space-y-3">
              <button onClick={() => handleRoleSelect(UserRole.CLIENT)} className="w-full text-left p-3 bg-gray-100 hover:bg-cyan-100 rounded-md transition-colors">
                  <span className="font-semibold">Cliente</span> - Fazer e acompanhar pedidos.
              </button>
              <button onClick={() => handleRoleSelect(UserRole.SELLER)} className="w-full text-left p-3 bg-gray-100 hover:bg-cyan-100 rounded-md transition-colors">
                  <span className="font-semibold">Vendedor</span> - Gerenciar entregas.
              </button>
              <button onClick={() => handleRoleSelect(UserRole.MANAGER)} className="w-full text-left p-3 bg-gray-100 hover:bg-cyan-100 rounded-md transition-colors">
                  <span className="font-semibold">Gerente</span> - Administrar o sistema.
              </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default LoginScreen;
