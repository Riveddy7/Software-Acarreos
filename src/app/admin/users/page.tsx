'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/models/types';
import { getCollection, updateDocument, USERS_COLLECTION } from '@/lib/firebase/firestore';
import { createUser } from '@/lib/auth';
import Modal from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Column } from '@/components/ui/DataTable';

interface UserFormData {
  email: string;
  username: string;
  password: string;
  role: UserRole;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    username: '',
    password: '',
    role: 'operator'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const fetchUsers = async () => {
    try {
      const usersData = await getCollection<UserProfile>(USERS_COLLECTION);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await createUser(formData.email, formData.password, formData.username, formData.role);
      await fetchUsers(); // Refresh the list
      setShowModal(false);
      setFormData({ email: '', username: '', password: '', role: 'operator' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear usuario';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    try {
      setDeleting(true);
      // Note: In a real app, you would implement a delete user function
      // For now, we'll just toggle the status as before
      await toggleUserStatus(selectedUser.id, selectedUser.isActive);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (e) {
      console.error(e);
      alert('Error al eliminar el usuario.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDocument(USERS_COLLECTION, userId, { isActive: !currentStatus });
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    if (role === 'admin') {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
    return `${baseClasses} bg-blue-100 text-blue-800`;
  };

  const getStatusBadge = (isActive: boolean) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    if (isActive) {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Define columns for the DataTable
  const columns: Column<UserProfile>[] = [
    {
      key: 'username',
      label: 'Usuario',
      render: (value, user) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Rol',
      render: (value) => {
        const getRoleBadge = (role: UserRole) => {
          const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
          if (role === 'admin') {
            return `${baseClasses} bg-red-100 text-red-800`;
          }
          return `${baseClasses} bg-blue-100 text-blue-800`;
        };
        
        return (
          <span className={getRoleBadge(value)}>
            {value === 'admin' ? 'Administrador' : 'Operador'}
          </span>
        );
      }
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (value) => {
        const getStatusBadge = (isActive: boolean) => {
          const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
          if (isActive) {
            return `${baseClasses} bg-green-100 text-green-800`;
          }
          return `${baseClasses} bg-gray-100 text-gray-800`;
        };
        
        return (
          <span className={getStatusBadge(value)}>
            {value ? 'Activo' : 'Inactivo'}
          </span>
        );
      }
    },
    {
      key: 'createdAt',
      label: 'Creado',
      render: (value) => (
        <span className="text-sm text-gray-700">{value.toDate().toLocaleDateString()}</span>
      )
    },
    {
      key: 'lastLogin',
      label: 'Último Acceso',
      render: (value) => (
        <span className="text-sm text-gray-700">
          {value ? value.toDate().toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    {
      key: 'id' as keyof UserProfile,
      label: 'Acciones',
      render: (_, user) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(user)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteModal(user)}
            className="text-red-600 hover:text-red-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-3">
          <SearchInput
            placeholder="Buscar por nombre de usuario o email..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="md:col-span-1">
          <Button onClick={() => setShowModal(true)} className="w-full">
            Crear Usuario
          </Button>
        </div>
      </div>

      <DataTable
        data={filteredUsers}
        columns={columns}
        loading={loading}
        emptyMessage="No hay usuarios que coincidan con la búsqueda"
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Crear Nuevo Usuario">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#38A169] focus:border-[#38A169]"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Nombre de usuario
            </label>
            <input
              type="text"
              id="username"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#38A169] focus:border-[#38A169]"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              required
              minLength={6}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#38A169] focus:border-[#38A169]"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Rol
            </label>
            <select
              id="role"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#38A169] focus:border-[#38A169]"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            >
              <option value="operator">Operador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={submitting}
            >
              Crear Usuario
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que quieres eliminar al usuario "${selectedUser?.username}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        danger={true}
        loading={deleting}
      />
    </div>
  );
}