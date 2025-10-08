import { useEffect, useState } from "react";
import api, { type Service, type ServiceWithSubcategories, type Subcategory } from "../../services/api";
import Swal from "sweetalert2";

type SlotEntry = {
  id: string;
  startTime: string;
  endTime: string;
  assignedVendors: number;
};

export default function Slot() {
  const [services, setServices] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [subcategories, setSubcategories] = useState<Array<{ id: string; name: string }>>([]);
  const [subcategoryId, setSubcategoryId] = useState("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<SlotEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignSlotId, setAssignSlotId] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);

  useEffect(() => {
    void loadServices();
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      void loadSubcategories(selectedServiceId);
    } else {
      setSubcategories([]);
      setSubcategoryId("");
    }
  }, [selectedServiceId]);

  useEffect(() => {
    if (subcategoryId && date) loadSlots();
  }, [subcategoryId, date]);

  const loadServices = async () => {
    try {
      const res = await api.getServices({ page: 1, limit: 200 });
      const list = (res.data.docs || []).map((s: Service) => ({ id: s._id, name: s.name }));
      setServices(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load services");
    }
  };

  const loadSubcategories = async (serviceId: string) => {
    try {
      const res = await api.getService(serviceId);
      const svc = res.data as unknown as ServiceWithSubcategories;
      const subs = (svc.subCategories || []).map((sc: Subcategory) => ({ id: sc._id, name: sc.name }));
      setSubcategories(subs);
      setSubcategoryId(subs[0]?.id || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load subcategories");
    }
  };

  const loadSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAvailableSlots({ subcategoryId, date });
      const doc = res.data;
      const list: SlotEntry[] = (doc?.data?.slots || doc?.slots || []).map((s: any) => ({
        id: s._id,
        startTime: s.startTime,
        endTime: s.endTime,
        assignedVendors: (s.vendorIds || []).length
      }));
      setSlots(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load slots");
    } finally {
      setLoading(false);
    }
  };

  const onAssign = async (slotId: string) => {
    setAssignSlotId(slotId);
    await loadVendors();
  };

  const loadVendors = async () => {
    try {
      setVendorsLoading(true);
      const res = await fetch('http://localhost:5000/api/admin/vendor/getAllVendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('authToken') ? { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } : {})
        },
        body: JSON.stringify({ page: 1, limit: 200 })
      });
      const json = await res.json();
      const list = (json?.data?.docs || []).map((v: any) => ({ id: v._id, name: v.name || v.email || 'Vendor', email: v.email || '' }));
      setVendors(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load vendors');
    } finally {
      setVendorsLoading(false);
    }
  };

  const assignToVendor = async (vendorId: string) => {
    if (!assignSlotId) return;
    try {
      await api.assignSlotByAdmin({ slotId: assignSlotId, subcategoryId, date, vendorId });
      setAssignSlotId(null);
      await Swal.fire('Assigned', 'Vendor assigned to slot', 'success');
      loadSlots();
    } catch (e) {
      Swal.fire('Error', e instanceof Error ? e.message : 'Failed to assign vendor to slot', 'error');
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex">
              <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
            </div>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service</label>
            <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              <option value="">Select service</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subcategory</label>
            <select value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white" disabled={!selectedServiceId}>
              <option value="">Select subcategory</option>
              {subcategories.map(sc => (
                <option key={sc.id} value={sc.id}>{sc.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
            <input value={date} onChange={(e) => setDate(e.target.value)} type="date" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          {/* <div className="flex items-end">
            <button onClick={loadSlots} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Load Slots</button>
          </div> */}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-gray-500 dark:text-gray-400">Loading...</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {slots.map((s) => (
              <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Start</div>
                    <div className="text-base font-semibold text-gray-900 dark:text-white">{new Date(s.startTime).toLocaleTimeString()}</div>
                  </div>
                  <button
                    onClick={() => onAssign(s.id)}
                    className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10"
                    aria-label="Assign Me"
                    title="Assign Me"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-current">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 8v6" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M23 11h-6" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                <div className="mt-3">
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">End</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{new Date(s.endTime).toLocaleTimeString()}</div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-white/10 dark:text-white/80">
                    {s.assignedVendors} Vendors
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {slots.length === 0 && !loading && (
          <div className="py-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">No slots found for the selected date.</div>
          </div>
        )}
      </div>
      {assignSlotId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Vendor</h3>
              <button onClick={() => setAssignSlotId(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold">✕</button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              {vendorsLoading ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">Loading vendors...</div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {vendors.map(v => (
                    <li key={v.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{v.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{v.email}</div>
                      </div>
                      <button onClick={() => assignToVendor(v.id)} className="inline-flex items-center rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-black/90">Assign</button>
                    </li>
                  ))}
                  {vendors.length === 0 && (
                    <li className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No vendors found.</li>
                  )}
                </ul>
              )}
            </div>
            <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
              <button onClick={() => setAssignSlotId(null)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


