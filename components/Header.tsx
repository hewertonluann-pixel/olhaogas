
import React from 'react';
import { User, SellerProfile } from '../types';
import { LogoIcon, LogoutIcon } from './Icons';

interface HeaderProps {
  user: User | SellerProfile;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <LogoIcon className="h-8 w-8 text-cyan-600" />
            <span className="ml-3 text-xl font-bold text-gray-800 hidden sm:block">Olha o Gás</span>
          </div>
          <div className="flex items-center">
            <div className="text-right mr-4">
              <p className="font-semibold text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500 capitalize">{user.role.toLowerCase()}</p>
            </div>
            <img className="h-10 w-10 rounded-full object-cover" src={user.photoUrl} alt={user.name} />
            <button
              onClick={onLogout}
              className="ml-4 p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Sair"
            >
              <LogoutIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
