// apps/partner-support/src/app/dashboard/page.tsx
'use client';

import { useAuth } from '../components/auth-provider';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PartnerDashboard } from '../components/PartnerDashboard';

export default function PartnerDashboardPage() {
  // This destructuring now correctly matches the AuthContextType
  const { user, partnerId, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="text-center p-10">Loading Dashboard...</div>;
  }

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PartnerDashboard primaryUserId={partnerId} />
    </div>
  );
}
