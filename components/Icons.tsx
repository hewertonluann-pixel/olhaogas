import React from 'react';

export const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0117.657 18.657z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1014.12 11.88l-4.242 4.242z" />
  </svg>
);

export const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export const GasIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <g fill="#9CA3AF">
            <path d="M12 56h40v6H12z" />
            <path d="M12 22c0-4.4 3.6-8 8-8h24c4.4 0 8 3.6 8 8v34H12V22z" />
            <path d="M20 4h24v10H20z" />
        </g>
        <path fill="#6B7280" d="M12 36h40v6H12z" />
        <path fill="#4A5568" d="M26 8h12v8H26z" />
    </svg>
);


export const WaterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        {/* Main Body */}
        <path fill="#60A5FA" d="M10 20c0-4.4 3.6-8 8-8h28c4.4 0 8 3.6 8 8v40H10V20z" />
        {/* Top Neck */}
        <path fill="#60A5FA" d="M22 12c0-2.2 1.8-4 4-4h12c2.2 0 4 1.8 4 4v0H22v0z" />
        {/* Cap */}
        <path fill="#3B82F6" d="M24 2h16v6H24z" />
        {/* Bands */}
        <path fill="#BFDBFE" d="M10 24h44v6H10z" />
        <path fill="#BFDBFE" d="M10 52h44v6H10z" />
        {/* Label */}
        <path fill="#3B82F6" d="M14 32h36v18H14z" />
        {/* Water Drop */}
        <path fill="#60A5FA" d="M32 36c-4 0-6 4-6 6 0 3.3 6 9 6 9s6-5.7 6-9c0-2-2-6-6-6z" />
    </svg>
);

export const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
    </svg>
);

export const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C44.464,36.333,48,30.836,48,24C48,22.659,47.862,21.35,47.611,20.083z" />
    </svg>
);

export const MoneyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

export const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.226A3 3 0 0118 15.75a3 3 0 01-2.25 2.72m-7.5-2.226V21a3 3 0 01-3-3v-1.5m1.5-9a3 3 0 013-3h1.5a3 3 0 013 3v1.5a3 3 0 01-3 3H12a3 3 0 01-3-3v-1.5z" />
    </svg>
);

export const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

export const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

export const PixIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48.4-128.89a8,8,0,0,1,11.2,0,8.08,8.08,0,0,1,1.7,5.65,7.9,7.9,0,0,1-1.7,5.65L144.8,144.8l43.2,43.2a8,8,0,0,1-11.31,11.31l-43.2-43.2-43.2,43.2a8,8,0,0,1-11.31-11.31l43.2-43.2L75.2,101.6a8,8,0,0,1,11.31-11.31l43.2,43.2,46.09-46.09A8,8,0,0,1,176.4,87.11Z"/>
    </svg>
);

export const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
);

export const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const QrCodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5a.75.75 0 00-.75.75v2.25c0 .414.336.75.75.75h2.25a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75H3.75zM3.75 18a.75.75 0 00-.75.75v2.25c0 .414.336.75.75.75h2.25a.75.75 0 00.75-.75v-2.25a.75.75 0 00-.75-.75H3.75zM18 4.5a.75.75 0 00-.75.75v2.25c0 .414.336.75.75.75h2.25a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75H18zM18 18a.75.75 0 00-.75.75v2.25c0 .414.336.75.75.75h2.25a.75.75 0 00.75-.75v-2.25a.75.75 0 00-.75-.75H18zM11.25 4.5a.75.75 0 00-.75.75v2.25c0 .414.336.75.75.75h2.25a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75h-2.25zM11.25 18a.75.75 0 00-.75.75v2.25c0 .414.336.75.75.75h2.25a.75.75 0 00.75-.75v-2.25a.75.75 0 00-.75-.75h-2.25zM4.5 11.25a.75.75 0 00-.75.75v2.25c0 .414.336.75.75.75h2.25a.75.75 0 00.75-.75v-2.25a.75.75 0 00-.75-.75H4.5zM18 11.25a.75.75 0 00-.75.75v2.25c0 .414.336.75.75.75h2.25a.75.75 0 00.75-.75v-2.25a.75.75 0 00-.75-.75H18z" />
    </svg>
);