'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUser, isTokenExpired, logout } from '@/utils/auth';

const withAuth = (WrappedComponent, allowedRoles) => {
  const AuthComponent = (props) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
      const user = getUser();
      const tokenIsExpired = isTokenExpired();

      if (tokenIsExpired || !user) {
        logout();
        const redirectTo = pathname !== '/auth/login' ? `?redirect=${encodeURIComponent(pathname)}` : '';
        router.replace(`/auth/login${redirectTo}`);
      } else {
        if (allowedRoles && allowedRoles.length > 0) {
          if (!user.role || !allowedRoles.includes(user.role)) {
            console.warn(`User role "${user.role}" not in allowed roles: ${allowedRoles.join(', ')}. Redirecting.`);
            router.replace('/dashboard');
            return;
          }
        }
        setCurrentUser(user);
        setIsLoading(false);
      }
    }, [router, pathname]);

    if (isLoading) {
      return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!currentUser) {
      return null;
    }

    return <WrappedComponent {...props} user={currentUser} />;
  };

  AuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthComponent;
};

export default withAuth;
