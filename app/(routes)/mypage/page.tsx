'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import Loading from '@/app/loading';

export default function MyPageRedirect() {
  const router = useRouter();
  const { isLoggedIn, currentUser } = useApp();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
    } else if (currentUser) {
      router.replace(`/user/${currentUser.user_id || currentUser.id}`);
    }
  }, [isLoggedIn, currentUser, router]);

  return <Loading />;
}
