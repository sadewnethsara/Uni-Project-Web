"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { 
  Search, Upload, Download, Edit2, Trash2, X, Check, 
  ChevronLeft, ChevronRight, FileSpreadsheet, Loader2, AlertCircle
} from "lucide-react";

interface PriceEntry {
  id: string | number;
  market_id: string | number;
  market_name: string;
  vegetable_id: string | number;
  vegetable_name: string;
  price: string | number;
  date: string;
  note?: string;
}

export function DataManagement() {
  const [data, setData] = useState<PriceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Modals & States
  const [editItem, setEditItem] = useState<PriceEntry | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  
  // Toast notifications
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      const supabase = createClient();
      const { data: resData, error } = await supabase
        .from('price_entries')
        .select(`
          id,
          price,
          date,
          market_id,
          vegetable_id,
          markets ( name ),
          vegetables ( name, emoji )
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      if (Array.isArray(resData)) {
        const formatted = resData.map((p: any) => ({
          id: p.id,
          price: parseFloat(p.price),
          date: p.date,
          market_id: p.market_id,
          vegetable_id: p.vegetable_id,
          market_name: p.markets?.name || '',
          vegetable_name: p.vegetables?.name || '',
          vegetable_emoji: p.vegetables?.emoji || '🥬'
        }));
        setData(formatted);
      }
    } catch {
      showToast("Failed to fetch data from Supabase", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Derived state
  const filteredData = data.filter(item => 
    item.vegetable_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.market_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(currentData.map(item => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string | number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} items?`)) return;

    setIsProcessing(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('price_entries')
        .delete()
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      showToast(`Successfully deleted ${selectedIds.size} items`, 'success');
      setSelectedIds(new Set());
      fetchData();
    } catch (error) {
      showToast("Failed to delete items", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteOne = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    setIsProcessing(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('price_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast("Item deleted successfully", "success");
      fetchData();
    } catch (error) {
      showToast("Failed to delete item", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setIsProcessing(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('price_entries')
        .update({
          price: parseFloat(editItem.price as string),
          note: editItem.note
        })
        .eq('id', editItem.id);

      if (error) throw error;

      showToast("Item updated successfully", "success");
      setEditItem(null);
      fetchData();
    } catch (error) {
      showToast("Failed to update item", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n').filter(l => l.trim() !== '');
      if (lines.length < 2) {
        showToast("Invalid CSV format", "error");
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const bulkData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((h, i) => {
          obj[h] = values[i];
        });
        return obj;
      }).filter(item => item.market_id && item.vegetable_id && item.price && item.date);

      if (bulkData.length === 0) {
        showToast("No valid data found in CSV", "error");
        return;
      }

      setIsProcessing(true);
      try {
        const supabase = createClient();
        const payload = bulkData.map((d: any) => ({
          market_id: d.market_id,
          vegetable_id: d.vegetable_id,
          price: parseFloat(d.price),
          date: d.date,
          note: d.note || null
        }));

        const { error } = await supabase
          .from('price_entries')
          .upsert(payload, { onConflict: 'market_id,vegetable_id,date' });

        if (error) throw error;

        showToast(`Successfully imported ${bulkData.length} records`, "success");
        setShowUpload(false);
        fetchData();
      } catch (error) {
        showToast("Failed to import CSV", "error");
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,market_id,vegetable_id,price,date,note\n1,1,250,2024-10-25,Optional note";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "prices_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-50 px-6 py-3 rounded-full shadow-lg flex items-center gap-3 backdrop-blur-md border ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700' 
                : 'bg-red-500/10 border-red-500/20 text-red-700'
            }`}
          >
            {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by vegetable or market..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-100 font-medium cursor-pointer"
            >
              <Trash2 size={18} />
              Delete ({selectedIds.size})
            </motion.button>
          )}
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 font-medium shadow-sm cursor-pointer"
          >
            <Upload size={18} />
            Import CSV
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="p-8 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex flex-col items-center justify-center border-dashed relative group hover:bg-emerald-50 transition-colors">
              <input
                type="file"
                accept=".csv"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                onChange={handleFileUpload}
                ref={fileInputRef}
              />
              <FileSpreadsheet size={48} className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Drag and drop your CSV here</h3>
              <p className="text-sm text-gray-500 mb-6">or click to browse from your computer</p>
              
              <button 
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); downloadTemplate(); }}
                className="px-4 py-2 bg-white text-emerald-600 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors z-30 cursor-pointer shadow-sm relative"
              >
                Download CSV Template
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    checked={currentData.length > 0 && currentData.every(item => selectedIds.has(item.id))}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Vegetable</th>
                <th className="px-6 py-4 font-semibold">Market</th>
                <th className="px-6 py-4 font-semibold">Price (Rs.)</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <Loader2 className="animate-spin mx-auto mb-3 text-emerald-500" size={32} />
                    <p className="text-gray-500 font-medium">Loading data...</p>
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Search className="text-gray-400" size={24} />
                    </div>
                    <p className="text-gray-900 font-medium mb-1">No records found</p>
                    <p className="text-gray-500">Try adjusting your search query.</p>
                  </td>
                </tr>
              ) : (
                currentData.map((item, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    key={item.id} 
                    className={`hover:bg-emerald-50/30 transition-colors group ${selectedIds.has(item.id) ? 'bg-emerald-50/50' : ''}`}
                  >
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        checked={selectedIds.has(item.id)}
                        onChange={() => handleSelectOne(item.id)}
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.date}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.vegetable_name}</td>
                    <td className="px-6 py-4 text-gray-600">{item.market_name}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">Rs. {item.price}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditItem(item)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteOne(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!isLoading && filteredData.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{startIndex + 1}</span> to <span className="font-medium text-gray-900">{Math.min(endIndex, filteredData.length)}</span> of <span className="font-medium text-gray-900">{filteredData.length}</span> results
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum = currentPage;
                if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                
                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      currentPage === pageNum 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
                <h3 className="font-bold text-gray-900 text-lg">Edit Price Entry</h3>
                <button 
                  onClick={() => setEditItem(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveEdit} className="p-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Market</label>
                    <input 
                      type="text" 
                      value={editItem.market_name} 
                      disabled 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Vegetable</label>
                    <input 
                      type="text" 
                      value={editItem.vegetable_name} 
                      disabled 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (Rs.)</label>
                    <input 
                      type="number" 
                      value={editItem.price} 
                      onChange={(e) => setEditItem({...editItem, price: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => setEditItem(null)}
                    className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Processing Overlay */}
      <AnimatePresence>
        {isProcessing && !editItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/50 backdrop-blur-sm"
          >
            <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4 border border-gray-100">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-600" size={28} />
              </div>
              <p className="font-medium text-gray-900 text-lg">Processing request...</p>
              <p className="text-gray-500 text-sm">Please wait while we update the database.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
