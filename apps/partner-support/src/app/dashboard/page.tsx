'use client';

import { useAuth } from '../components/auth-provider';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PartnerDashboard } from '../components/PartnerDashboard';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function PartnerDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [loadingPartnerId, setLoadingPartnerId] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }

    if (!loading && user) {
      const fetchPartnerId = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setPartnerId(data.partnerId ?? null);
        }
        setLoadingPartnerId(false);
      };
      fetchPartnerId();
    }
  }, [user, loading, router]);

  if (loading || loadingPartnerId) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center p-10">Redirecting to sign in...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PartnerDashboard primaryUserId={partnerId} />
    </div>
  );
}
