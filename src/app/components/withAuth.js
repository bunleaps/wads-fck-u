'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, getToken } from '@/utils/auth'; // Adjust path if necessary

// Optional: Create a simple loading spinner component or use an existing one
// const LoadingSpinner = () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

export default function withAuth(WrappedComponent, allowedRoles) {
  const ComponentWithAuth = (props) => {
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
      const token = getToken();
      if (!token) {
        router.replace('/auth/login'); // Redirect to login if no token
        return;
      }

      const user = getUser();
      if (!user || !user.details) {
        // Token exists but user details are missing or corrupted
        console.error("User details not found or corrupted in localStorage.");
        // Clear potentially corrupted storage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.replace('/auth/login');
        return;
      }

      setCurrentUser(user.details);
      const userRole = user.details.role; // Assuming user.details has a 'role' property

      // If allowedRoles are specified, check if the user's role is permitted
      if (allowedRoles && allowedRoles.length > 0) {
        if (!userRole || !allowedRoles.includes(userRole)) {
          console.warn(`Access Denied: User role "${userRole}" is not in allowed roles: [${allowedRoles.join(', ')}].`);
          router.replace('/unauthorized'); // Redirect to an unauthorized page
          return;
        }
      }
      // If allowedRoles is not provided or empty, any authenticated user is allowed.
      setIsVerified(true);
    }, [router]); // allowedRoles is typically static for a given HOC usage

    if (!isVerified) {
      return <div>Loading authentication...</div>; // Or a proper <LoadingSpinner />
    }

    return <WrappedComponent {...props} user={currentUser} />;
  };

  const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  ComponentWithAuth.displayName = `withAuth(${wrappedComponentName})`;

  return ComponentWithAuth;
}