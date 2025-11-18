

import React from 'react';
import type { OcorrenciaPrioridade } from '../types';

// General purpose icons
export const GlobeAltIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

export const LoadingSpinner: React.FC<{className?: string}> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={`animate-spin ${props.className}`}>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const UserGroupIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
  </svg>
);

export const ExclamationTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1.75-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z" clipRule="evenodd" />
  </svg>
);

export const UserIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path stroke="black" strokeWidth="1.5" fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
  </svg>
);

export const MapPinIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.106.38-.223.588-.354.218-.136.448-.287.688-.452.24-.165.488-.347.73-.544.242-.198.477-.41.698-.64.22-.23.42-.48.592-.746.173-.266.316-.55.43-.848.113-.298.194-.62.24-.957.046-.337.06-.69.06-1.061 0-2.652-2.149-4.8-4.8-4.8S5.2 7.148 5.2 9.8c0 .371.014.724.06 1.061.046.337.127.659.24.957.114.298.257.582.43.848.172.266.372.516.592.746.221.23.456.442.698.64.242.197.49.379.73.544.24.165.47.316.688.452.208.131.402.248.588.354a5.745 5.745 0 00.28.14l.019.008.006.003zM10 11.25a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
  </svg>
);

export const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
</svg>
);

export const ShieldExclamationIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

export const MegaphoneIcon: React.FC<{className?: string}> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15h8.05a1.5 1.5 0 001.442-1.168l1.9-7.1a1.5 1.5 0 00-1.442-1.832H10.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6V3.75a1.5 1.5 0 011.5-1.5h.75a1.5 1.5 0 011.5 1.5V6m-3 0h3" />
    </svg>
);

export const FlagIcon: React.FC<{className?: string}> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
    </svg>
);

export const CogIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-1.5-6.062c1.62.362 3.16.966 4.5 1.838m-4.5-1.838a15.962 15.962 0 01-4.5 1.838m4.5-1.838V3.375m0 2.563a15.962 15.962 0 01-4.5 1.838m-4.5-1.838a15.962 15.962 0 00-4.5 1.838m4.5-1.838V3.375m0 2.563a15.962 15.962 0 00-4.5 1.838m-4.5-1.838a15.962 15.962 0 01-4.5 1.838m0 0V3.375m4.5 2.563a15.962 15.962 0 004.5-1.838m-4.5 1.838a15.962 15.962 0 014.5-1.838m0 0V3.375m-4.5 2.563a15.962 15.962 0 014.5-1.838m0 0a15.962 15.962 0 004.5 1.838m-4.5-1.838V3.375M6 12a6 6 0 1112 0 6 6 0 01-12 0zm12 0a6 6 0 00-12 0m12 0a6 6 0 01-12 0" />
  </svg>
);

export const SaveIcon: React.FC<{className?: string}> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338A2.25 2.25 0 0017.088 3.75H15M4.5 9.75v10.5a.75.75 0 00.75.75h13.5a.75.75 0 00.75-.75V9.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 3.75a3 3 0 00-3-3h-1.5a3 3 0 00-3 3M15 3.75c0 .414-.336.75-.75.75h-3.75a.75.75 0 01-.75-.75M15 3.75V7.5" />
    </svg>
);

export const XMarkIcon: React.FC<{className?: string}> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const CloudBoltIcon: React.FC<{className?: string}> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.5 4.5 0 002.25 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 12h-3v5.25L15 12.75h-3v-5.25L9 12z" />
    </svg>
);

export const ShareIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.042.586.042h4.414c.196 0 .391-.017.586-.042M7.217 10.907a2.25 2.25 0 012.25-2.25h5.316c.621 0 1.125.504 1.125 1.125v1.042a2.25 2.25 0 01-2.25 2.25H9.467a2.25 2.25 0 01-2.25-2.25z" />
  </svg>
);

export const MagnifyingGlassIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

export const ChartBarIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

export const ArrowUturnLeftIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
  </svg>
);

export const ArrowRightOnRectangleIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

export const LockClosedIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
  </svg>
);

export const CheckBadgeIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 001.06.707L10 15.212l5.94 2.745a.75.75 0 001.06-.707V4.517c0-1.103-.806-2.068-1.93-2.207A41.182 41.182 0 0010 2zM8.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L10 11.586l-1.293-1.293z" clipRule="evenodd" />
  </svg>
);

export const NoSymbolIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.472 6.024a5.5 5.5 0 017.004 0l-7.004 7.004a5.5 5.5 0 010-7.004zm8.052 8.052a5.5 5.5 0 00-7.004 0l7.004-7.004a5.5 5.5 0 000 7.004z" clipRule="evenodd" />
  </svg>
);

export const LockOpenIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5a3 3 0 116 0v2.75a.75.75 0 001.5 0V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
  </svg>
);

export const ChevronDownIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

export const ChevronUpIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
  </svg>
);

export const ChevronLeftIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

export const ChevronRightIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);


export const FireIcon: React.FC<{className?: string}> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M11.3 2.046A1 1 0 0112 3v1.382l.714 1.784A1 1 0 0112 8v1.382l.714 1.784A1 1 0 0112 13v1.382l.714 1.784A1 1 0 0112 18v1a1 1 0 01-1.3.954C5.129 17.51 2 12.846 2 9.5 2 5.358 5.14 2 9.5 2c.57 0 1.12.06 1.646.173l.154.027zM9.5 15a.5.5 0 01.5-.5h.001a.5.5 0 010 1H10a.5.5 0 01-.5-.5z" clipRule="evenodd" />
    </svg>
);

// Newly added icons
export const PhoneIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

export const ChatBubbleLeftRightIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a1.125 1.125 0 01-1.59 0l-3.72-3.72c-1.133-.093-1.98-1.057-1.98-2.193v-4.286c0-.97.616-1.813 1.5-2.097M16.5 7.5c0 .414-.336.75-.75.75h-7.5a.75.75 0 010-1.5h7.5c.414 0 .75.336.75.75zM9 11.25c0 .414-.336.75-.75.75H4.5a.75.75 0 010-1.5h3.75c.414 0 .75.336.75.75z" />
  </svg>
);

export const ListBulletIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

export const SparklesIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.502L16.5 21.75l-.398-1.248a3.375 3.375 0 00-2.455-2.456L12.75 18l1.248-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.248a3.375 3.375 0 002.455 2.456L20.25 18l-1.248.398a3.375 3.375 0 00-2.455 2.456z" />
  </svg>
);

export const CubeIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);

export const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const DocumentTextIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export const MinusIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
  </svg>
);

export const PlusIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const ArrowUpIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
  </svg>
);

export const ArrowRightIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
  </svg>
);

export const ArrowLeftIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
  </svg>
);

export const ArrowUturnRightIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
  </svg>
);

export const VolunteerIcon: React.FC<{className?: string}> = (props) => (
  <svg viewBox="0 0 32 32" {...props}>
    <circle cx="16" cy="16" r="14" fill="#22C55E" stroke="#fff" strokeWidth="2" />
    <path d="M16 19a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-7 5a7 7 0 0 1 14 0H9z" fill="#fff"/>
  </svg>
);

export const OnMissionVolunteerIcon: React.FC<{className?: string}> = (props) => (
  <svg viewBox="0 0 32 32" {...props}>
    <circle cx="16" cy="16" r="14" fill="#3B82F6" stroke="#fff" strokeWidth="2" />
    <path d="M16 19a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-7 5a7 7 0 0 1 14 0H9z" fill="#fff"/>
  </svg>
);

export const ReturningVolunteerIcon: React.FC<{className?: string}> = (props) => (
  <svg viewBox="0 0 32 32" {...props}>
    <circle cx="16" cy="16" r="14" fill="#FBBF24" stroke="#fff" strokeWidth="2" />
    <path d="M16 19a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-7 5a7 7 0 0 1 14 0H9z" fill="#fff"/>
  </svg>
);

export const InactiveVolunteerIcon: React.FC<{className?: string}> = (props) => (
  <svg viewBox="0 0 32 32" {...props}>
    <circle cx="16" cy="16" r="14" fill="#6B7280" stroke="#fff" strokeWidth="2" />
    <path d="M16 19a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-7 5a7 7 0 0 1 14 0H9z" fill="#fff"/>
  </svg>
);

export const DistressVolunteerIcon: React.FC<{className?: string}> = (props) => (
  <svg viewBox="0 0 36 36" {...props}>
    <circle cx="18" cy="18" r="16" fill="#EF4444" stroke="#fff" strokeWidth="2" />
    <path d="M18 9v10m0 4v-2" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const IncidentIcon: React.FC<{className?: string; isNew?: boolean; priority: OcorrenciaPrioridade}> = ({ isNew, priority, ...props }) => {
    const priorityColors: Record<OcorrenciaPrioridade, string> = {
        'Urgente': '#EF4444',
        'Alta': '#F97316',
        'Normal': '#FBBF24',
        'Baixa': '#6B7280'
    };
    const color = priorityColors[priority] || priorityColors.Normal;

    return (
        <svg viewBox="0 0 40 40" {...props}>
            {isNew && <circle cx="20" cy="20" r="20" fill={color} className="animate-ping" />}
            <path d="M20 40 C 20 40, 0 25, 0 15 A 20 20 0 1 1 40 15 C 40 25, 20 40, 20 40 Z" fill={color} />
            <path d="M18 10h4v12h-4z M18 24h4v4h-4z" fill="white" />
        </svg>
    );
};

export const InProgressIncidentIcon: React.FC<{className?: string; priority: OcorrenciaPrioridade}> = ({ priority, ...props }) => {
    const color = '#3B82F6'; // Blue for 'in progress' regardless of priority
    return (
        <svg viewBox="0 0 40 40" {...props}>
            <path d="M20 40 C 20 40, 0 25, 0 15 A 20 20 0 1 1 40 15 C 40 25, 20 40, 20 40 Z" fill={color} />
            <path d="M12 18 l5 5 l10 -10" stroke="white" strokeWidth="3" fill="none" />
        </svg>
    );
};

export const ClosedIncidentIcon: React.FC<{className?: string}> = (props) => (
    <svg viewBox="0 0 40 40" {...props}>
        <path d="M20 40 C 20 40, 0 25, 0 15 A 20 20 0 1 1 40 15 C 40 25, 20 40, 20 40 Z" fill="#6B7280" />
        <path d="M12 18 l5 5 l10 -10" stroke="white" strokeWidth="3" fill="none" />
    </svg>
);

export const UserLocationIcon: React.FC<{className?: string}> = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="#fff" strokeWidth="2" />
    <circle cx="12" cy="12" r="11" fill="#3B82F6" fillOpacity="0.3" />
  </svg>
);

export const SearchMarkerIcon: React.FC<{className?: string}> = (props) => (
    <svg viewBox="0 0 40 40" {...props}>
        <path d="M20 40 C 20 40, 0 25, 0 15 A 20 20 0 1 1 40 15 C 40 25, 20 40, 20 40 Z" fill="#8B5CF6" />
        <circle cx="20" cy="15" r="6" fill="none" stroke="white" strokeWidth="2" />
        <line x1="25" y1="20" x2="31" y2="26" stroke="white" strokeWidth="2" />
    </svg>
);

export const TeammateIcon: React.FC<{className?: string}> = (props) => (
  <svg viewBox="0 0 32 32" {...props}>
    <circle cx="16" cy="16" r="14" fill="#14B8A6" stroke="#fff" strokeWidth="2" />
    <path d="M16 19a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-7 5a7 7 0 0 1 14 0H9z" fill="#fff"/>
  </svg>
);

export const TableCellsIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

export const CrosshairIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const WeatherConditionIcon: React.FC<{className?: string; iconCode: string}> = ({iconCode, ...props}) => {
    if (iconCode.includes('01')) return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>; // Sun
    if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.5 4.5 0 002.25 15z" /></svg>; // Cloud
    if (iconCode.includes('09') || iconCode.includes('10')) return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v6.75m-4.5-3.75h9M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.5 4.5 0 002.25 15z" /></svg>; // Rain
    if (iconCode.includes('11')) return <CloudBoltIcon {...props} />; // Thunder
    if (iconCode.includes('13')) return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.5 4.5 0 002.25 15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v6.75m-4.5-3.75h9" /></svg>; // Snow
    if (iconCode.includes('50')) return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 9.75h16.5M3.75 12.75h16.5" /></svg>; // Mist/Fog
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>; // Default to Sun
};

export const WindIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.125 1.125 0 010 2.25H5.625a1.125 1.125 0 010-2.25z" />
  </svg>
);

export const WaterDropIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.75 9.75 0 006.75-2.925C21.625 14.95 12 2.25 12 2.25S2.375 14.95 5.25 18.075A9.75 9.75 0 0012 21z" />
  </svg>
);

export const WhatsAppIcon: React.FC<{className?: string}> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM12.04 20.12c-1.48 0-2.93-.4-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.32a8.09 8.09 0 01-1.23-4.34c0-4.46 3.63-8.09 8.09-8.09s8.09 3.63 8.09 8.09-3.63 8.09-8.09 8.09zm4.46-6.2c-.25-.12-1.47-.72-1.7-.85-.23-.12-.39-.18-.56.12-.17.31-.64.85-.79 1.02-.15.17-.29.18-.54.06s-1.02-.38-1.94-1.2c-.72-.63-1.2-1.4-1.34-1.64-.14-.25-.02-.38.1-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.55-.42-.14 0-.3 0-.46 0-.16 0-.42.06-.64.31-.22.25-.83.81-.83 1.98s.85 2.3 1 2.46c.14.17 1.67 2.55 4.05 3.56.57.24 1.02.38 1.37.48.57.17 1.08.14 1.48.09.45-.06 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.47-.28z"/>
    </svg>
);

export const HomeIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

export const InformationCircleIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const PencilIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

export const TrashIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09.92-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

export const BellIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

export const MicrophoneIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
    <path d="M5.5 10.5a.5.5 0 01.5.5v1a4 4 0 004 4h.5a.5.5 0 010 1h-.5a5 5 0 01-5-5v-1a.5.5 0 01.5-.5z" />
    <path d="M10 15a4 4 0 004-4v-1a.5.5 0 011 0v1a5 5 0 01-5 5h-.5a.5.5 0 010-1h.5z" />
  </svg>
);

export const StopIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
  </svg>
);

export const PaperAirplaneIcon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

export const Bars3Icon: React.FC<{className?: string}> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);