
import { useState, useEffect } from 'react';
import { Company } from '@/models/types';
import { Button } from '@/components/ui/Button';

interface CompanyFormProps {
  company: Company | null;
  onSave: (data: Omit<Company, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function CompanyForm({ company, onSave, onCancel }: CompanyFormProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (company) {
      setName(company.name);
    } else {
      setName('');
    }
  }, [company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          type="text"
          id="name"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#38A169] focus:border-[#38A169]"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
        >
          Guardar
        </Button>
      </div>
    </form>
  );
}
