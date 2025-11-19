
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { getCollection } from '@/lib/firebase/firestore';
import { Company } from '@/models/types';
import { COMPANIES_COLLECTION } from '@/lib/firebase/firestore';

export default function CompanySelectionPage() {
  const { user } = useAuth();
  const { setCompanyId } = useCompany();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getCollection<Company>(COMPANIES_COLLECTION).then((data) => {
        setCompanies(data);
        setLoading(false);
      });
    }
  }, [user]);

  const handleCompanySelection = (companyId: string) => {
    setCompanyId(companyId);
    router.push('/admin');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Select a Company</h1>
      <ul>
        {companies.map((company) => (
          <li key={company.id}>
            <button onClick={() => handleCompanySelection(company.id)}>
              {company.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
