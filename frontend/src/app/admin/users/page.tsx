'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/store/hooks';
import { HiUser, HiSearch, HiTrash, HiPencil } from 'react-icons/hi';

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  isVerified: boolean;
  isApproved: boolean | null;
  createdAt: string;
};

const ROLE_FILTER = [
  { value: '', label: 'All roles' },
  { value: 'CUSTOMER', label: 'Customers' },
  { value: 'SELLER', label: 'Sellers' },
  { value: 'ADMIN', label: 'Admins' },
] as const;

const ROLE_BADGE: Record<string, string> = {
  CUSTOMER: 'bg-slate-100 text-slate-700 ring-slate-200/80',
  SELLER: 'bg-emerald-50 text-emerald-800 ring-emerald-200/60',
  ADMIN: 'bg-amber-50 text-amber-800 ring-amber-200/60',
};

export default function AdminUsersPage() {
  const authUser = useAppSelector((s) => s.auth.user);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminUserRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editVerified, setEditVerified] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const load = () => {
    setLoading(true);
    const params = roleFilter ? { params: { role: roleFilter } } : undefined;
    api
      .get<{ success: boolean; data: AdminUserRow[] }>('/admin/users', params)
      .then((res) => setUsers(res.data.data || []))
      .catch(() => toast.error('Could not load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [roleFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, search]);

  const openEdit = (u: AdminUserRow) => {
    setEditing(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditVerified(u.isVerified);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSavingEdit(true);
    try {
      const payload: { name: string; email: string; isVerified?: boolean } = {
        name: editName.trim(),
        email: editEmail.trim(),
      };
      if (editing.role !== 'SELLER') {
        payload.isVerified = editVerified;
      }
      const res = await api.put<{ success: boolean; data: AdminUserRow }>(`/admin/users/${editing.id}`, payload);
      const updated = res.data.data;
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast.success('User updated');
      setEditing(null);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Could not save';
      toast.error(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  const removeUser = async (u: AdminUserRow) => {
    if (u.id === authUser?.id) {
      toast.error('You cannot delete your own account');
      return;
    }
    const label = u.name || u.email;
    const customerNote =
      u.role === 'CUSTOMER'
        ? ' All of this customer’s orders will be permanently removed from the system.'
        : '';
    if (
      !confirm(
        `Permanently delete user "${label}"?${customerNote} This cannot be undone.`
      )
    )
      return;
    setDeletingId(u.id);
    try {
      await api.delete(`/admin/users/${u.id}`);
      toast.success('User deleted');
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Could not delete user';
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-8">
        <HiUser className="w-8 h-8 text-amber-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">
            Registered accounts: customers, sellers, and admins
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-gray-900">All users</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm w-full sm:w-56 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none"
            >
              {ROLE_FILTER.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No users match your filters.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[11rem]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="py-4 px-6 text-sm text-gray-900 font-medium">{u.name}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{u.email}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-md ring-1 ${ROLE_BADGE[u.role] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {u.role === 'SELLER' ? (
                        u.isApproved ? (
                          <span className="text-emerald-700">Approved</span>
                        ) : (
                          <span className="text-amber-700">Pending</span>
                        )
                      ) : (
                        <span className="text-gray-500">
                          {u.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition"
                        >
                          <HiPencil className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeUser(u)}
                          disabled={u.id === authUser?.id || deletingId === u.id}
                          title={
                            u.id === authUser?.id
                              ? 'You cannot delete your own account'
                              : 'Delete user'
                          }
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 disabled:opacity-40 disabled:pointer-events-none transition"
                        >
                          <HiTrash className="w-4 h-4" />
                          {deletingId === u.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 text-sm text-gray-500">
            Showing {filtered.length} of {users.length} loaded
          </div>
        )}
      </div>

      {editing && (
        <div
          className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4"
          onClick={() => !savingEdit && setEditing(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">Edit user</h3>
            <p className="text-sm text-gray-500 mt-1">
              {editing.role} · {new Date(editing.createdAt).toLocaleDateString()}
            </p>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Name
                </label>
                <input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none"
                />
              </div>
              <div>
                <label htmlFor="edit-email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none"
                />
              </div>
              {editing.role !== 'SELLER' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editVerified}
                    onChange={(e) => setEditVerified(e.target.checked)}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700">Email verified</span>
                </label>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={savingEdit}
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingEdit || editName.trim().length < 2 || !editEmail.trim()}
                onClick={saveEdit}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
              >
                {savingEdit ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
