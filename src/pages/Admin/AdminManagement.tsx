import { useEffect, useMemo, useState } from "react";
import api, { type Admin } from "../../services/api";
import Swal from "sweetalert2";
import { Edit, Plus, Trash2 } from "lucide-react";

type Status = "active" | "inactive";

type AdminUI = {
  id: string;
  name: string;
  emailId: string;
  status: Status;
  createdAt?: string;
};

function toUI(a: Admin): AdminUI {
  return {
    id: a._id || "",
    name: (a.name || "").trim() || (a.emailId || a.email || "").split("@")[0],
    emailId: a.emailId || a.email || "",
    status: a.isActive ? "active" : "inactive",
    createdAt: a.createdAt,
  };
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminUI | null>(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdmins({ page: 1, limit: 100, search });
      const list = (res.data.docs || []).map(toUI);
      setAdmins(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setSearch(""); // Clear the search
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdmins({ page: 1, limit: 100, search: "" }); // Fetch without search
      const list = (res.data.docs || []).map(toUI);
      setAdmins(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const t = search.toLowerCase();
    return admins.filter(a => a.name.toLowerCase().includes(t) || a.emailId.toLowerCase().includes(t));
  }, [admins, search]);

  const onDelete = async (id: string) => {
    const res = await Swal.fire({
      title: 'Delete admin?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d33'
    });
    if (!res.isConfirmed) return;
    try {
      await api.deleteAdmin(id);
      await Swal.fire('Deleted', 'Admin removed successfully', 'success');
      loadAdmins();
    } catch (e) {
      Swal.fire('Error', e instanceof Error ? e.message : 'Failed to delete admin', 'error');
    }
  };

  const onToggle = async (adm: AdminUI) => {
    try {
      const next = adm.status === 'active' ? false : true;
      await api.toggleAdminActive(adm.id, next);
      setAdmins(prev => prev.map(a => a.id === adm.id ? { ...a, status: next ? 'active' : 'inactive' } : a));
    } catch (e) {
      Swal.fire('Error', e instanceof Error ? e.message : 'Failed to update status', 'error');
    }
  };

  return (
    <>
      {/* <PageMeta title="Admin Management | Homezy Admin Panel" description="Manage admins" /> */}
      {/* <PageBreadcrumb pageTitle="Admin Management" /> */}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex">
              <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Admins</h3>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(true)} className="inline-flex items-center justify-center rounded-lg border border-blue-300 bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 hover:text-white dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 dark:hover:text-blue-200 transition-colors duration-200"><Plus className="h-4 w-4 mr-2" />Add Admin</button>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search admins by name or email..." className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
          </div>
          <div>
            <button onClick={handleRefresh} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Clear</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Admin</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-6 text-center">Loading...</td></tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 dark:bg-white/10 dark:text-white/80">
                          <span className="text-xs font-semibold">{(a.name || 'A').slice(0,2).toUpperCase()}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{a.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{a.emailId}</td>
                    <td className="px-6 py-4">
                      <span
                        onClick={() => onToggle(a)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                          a.status === 'active'
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {a.status === 'active' ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setEditAdmin(a)} 
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-blue-100 text-primary hover:bg-blue-200 hover:text-primary/80 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-700 transition-colors duration-200"
                          title="Edit Admin"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => onDelete(a.id)} 
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 dark:bg-red-900 dark:text-red-400 dark:hover:bg-red-800 dark:hover:text-red-300 border border-red-300 dark:border-red-700 transition-colors duration-200"
                          title="Delete Admin"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && !loading && (
          <div className="py-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">No admins found.</div>
          </div>
        )}
      </div>

      {showAdd && (
        <AdminModal title="Add Admin" onClose={() => setShowAdd(false)} onSubmit={async (payload) => {
          try {
            await api.createAdmin({ name: payload.name, emailId: payload.emailId, password: payload.password, isActive: payload.status === 'active' });
            setShowAdd(false);
            await Swal.fire('Saved', 'Admin created successfully', 'success');
            loadAdmins();
          } catch (e) {
            Swal.fire('Error', e instanceof Error ? e.message : 'Failed to create admin', 'error');
          }
        }} />
      )}

      {editAdmin && (
        <AdminModal title="Edit Admin" initial={editAdmin} onClose={() => setEditAdmin(null)} onSubmit={async (payload) => {
          try {
            await api.updateAdminBasic({ id: payload.id!, name: payload.name, emailId: payload.emailId, isActive: payload.status === 'active' });
            setEditAdmin(null);
            await Swal.fire('Saved', 'Admin updated successfully', 'success');
            loadAdmins();
          } catch (e) {
            Swal.fire('Error', e instanceof Error ? e.message : 'Failed to update admin', 'error');
          }
        }} />
      )}
    </>
  );
}

type ModalPayload = { id?: string; name: string; emailId: string; password: string; status: Status };

function AdminModal({ title, initial, onClose, onSubmit }: { title: string; initial?: AdminUI; onClose: () => void; onSubmit: (p: ModalPayload) => void; }) {
  const [name, setName] = useState(initial?.name || "");
  const [emailId, setEmailId] = useState(initial?.emailId || "");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>(initial?.status || "active");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!name.trim() || !emailId.trim()) return;
    const payload: ModalPayload = { id: initial?.id, name: name.trim(), emailId: emailId.trim(), status, password: "" };
    if (!initial) payload.password = password;
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold">✕</button>
        </div>
        <form id="admin-modal-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Enter name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input value={emailId} onChange={(e) => setEmailId(e.target.value)} type="email" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Enter email" />
            </div>
            {!initial && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Enter password" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </form>
        <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
          <button onClick={onClose} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Close</button>
          <button form="admin-modal-form" type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">Save</button>
        </div>
      </div>
    </div>
  );
}


