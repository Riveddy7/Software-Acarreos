'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/requisiciones-material-vista');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-lg text-gray-600">Redirigiendo...</div>
    </div>
  );
}
