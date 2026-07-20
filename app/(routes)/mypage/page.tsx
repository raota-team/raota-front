'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import Loading from '@/app/loading';

export default function MyPageRedirect() {
  const router = useRouter();
  const { isLoggedIn, isAuthChecking, currentUser } = useApp();

  useEffect(() => {
    if (isAuthChecking) return;

    if (!isLoggedIn) {
      router.replace('/login');
    } else if (currentUser) {
      router.replace(`/user/${currentUser.user_id || currentUser.id}`);
    }
  }, [isAuthChecking, isLoggedIn, currentUser, router]);

  return <Loading />;
}
