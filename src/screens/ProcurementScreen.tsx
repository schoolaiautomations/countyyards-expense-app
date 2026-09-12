import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Sprout, 
  CheckSquare, 
  Square, 
  ArrowUpDown, 
  Trash2, 
  Edit2, 
  ArrowUp, 
  ArrowDown, 
  ChevronDown, 
  ChevronUp,
  PackageCheck,
  RotateCcw,
  Navigation,
  MapPin,
  Store
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { ProcurementItem } from '../types';
import { ProcurementModal } from '../components/ProcurementModal';
import { ProcurementRouteModal } from '../components/ProcurementRouteModal';
import { LoadingScreen, SyncingBadge } from '../components/LoadingScreen';
import { formatCurrency } from '../utils/formatters';

interface ProcurementScreenProps {
  onBack: () => void;
}

export const ProcurementScreen: React.FC<ProcurementScreenProps> = ({ onBack }) => {
  const { 
    procurementItems, 
    loading, 
    createProcurementItem, 
    updateProcurementItem, 
    deleteProcurementItem, 
    clearAllProcurementItems,
    toggleProcurementStatus, 
    reorderProcurementItems 
  } = useProjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProcurementItem | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [showDoneSection, setShowDoneSection] = useState(true);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return procurementItems;
    const q = searchQuery.toLowerCase();
    return procurementItems.filter(item => item.plant_name.toLowerCase().includes(q));
  }, [procurementItems, searchQuery]);

  // Separate into Pending (Top) and Done (Bottom)
  // Pending items are sorted strictly by priority_order
  const pendingItems = useMemo(() => {
    return filteredItems
      .filter(i => !i.is_done)
      .sort((a, b) => {
        const orderA = a.priority_order ?? 9999;
        const orderB = b.priority_order ?? 9999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [filteredItems]);

  const doneItems = useMemo(() => {
    return filteredItems
      .filter(i => i.is_done)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [filteredItems]);

  const totalPaid = useMemo(() => {
    return filteredItems.reduce((sum, i) => sum + Number(i.paid_amount || 0), 0);
  }, [filteredItems]);

  // Handle Save
  const handleSave = async (data: Omit<ProcurementItem, 'id' | 'created_at'>) => {
    if (editingItem) {
      await updateProcurementItem(editingItem.id, data);
      setEditingItem(null);
    } else {
      await createProcurementItem(data);
    }
  };

  // Reorder Up / Down
  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const items = [...pendingItems];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
    await reorderProcurementItems(items.map(i => i.id));
  };

  const handleMoveDown = async (index: number) => {
    if (index >= pendingItems.length - 1) return;
    const items = [...pendingItems];
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
    await reorderProcurementItems(items.map(i => i.id));
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" from list?`)) {
      await deleteProcurementItem(id);
    }
  };

  const handleClearAll = async () => {
    if (procurementItems.length === 0) return;
    const confirmed = window.confirm(
      'Are you sure you want to delete ALL plants & materials? This will clear the entire checklist before procuring for a new project.'
    );
    if (confirmed) {
      await clearAllProcurementItems();
    }
  };

  return (
    <div className="px-4 py-3 max-w-lg mx-auto flex flex-col justify-start animate-in fade-in pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="p-1 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-stone-800 tracking-tight leading-tight flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-[#78350f]" />
              Plant Procurement
            </h2>
            <p className="text-[11px] text-stone-500 font-normal">
              Kadiyam sourcing checklist
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Delete All / Clear Button */}
          {procurementItems.length > 0 && (
            <button
              onClick={handleClearAll}
              title="Delete all previous plants to start fresh for another project"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          {/* Add Item Button */}
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="bg-[#78350f] hover:bg-[#632c0c] active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Plant</span>
          </button>
        </div>
      </div>

      {/* Syncing indicator */}
      {loading && procurementItems.length > 0 && <SyncingBadge />}

      {/* KPI Overview Banner (Warm Earth Brown) */}
      <div className="bg-gradient-to-br from-[#451a03] via-[#78350f] to-[#451a03] rounded-2xl p-3.5 text-white shadow-xs mb-3.5 border border-amber-900/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200">
            Kadiyam Trip Summary
          </span>
          <span className="text-[11px] font-extrabold bg-white/15 text-amber-100 px-2.5 py-0.5 rounded-full border border-white/20">
            {pendingItems.length} left • {doneItems.length} done
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-white/10">
          <div className="p-1">
            <span className="text-[9px] uppercase font-bold text-stone-300 block">Total Items</span>
            <span className="text-lg font-black text-white">{filteredItems.length}</span>
          </div>

          <div className="p-1 bg-white/10 rounded-xl">
            <span className="text-[9px] uppercase font-bold text-amber-200 block">Left in Top</span>
            <span className="text-lg font-black text-amber-300">{pendingItems.length}</span>
          </div>

          <div className="p-1">
            <span className="text-[9px] uppercase font-bold text-emerald-200 block">Done</span>
            <span className="text-lg font-black text-emerald-400">{doneItems.length}</span>
          </div>
        </div>

        {totalPaid > 0 && (
          <div className="text-right text-[11px] text-amber-100 pt-2 mt-2 border-t border-white/10">
            Total Paid: <strong className="text-white text-sm">{formatCurrency(totalPaid)}</strong>
          </div>
        )}

        {/* Generate Procurement Path Button */}
        {pendingItems.length > 0 && (
          <button
            type="button"
            onClick={() => setIsRouteModalOpen(true)}
            className="w-full mt-2.5 py-2.5 px-3 rounded-xl bg-amber-200/95 hover:bg-amber-300 active:scale-98 text-[#78350f] text-xs font-black flex items-center justify-center space-x-2 shadow-sm transition-all"
          >
            <Navigation className="w-4 h-4 text-[#78350f]" />
            <span>Generate Procurement Path & Directions ({pendingItems.length} left)</span>
          </button>
        )}
      </div>

      {/* Search & Order Mode Bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plants / materials..."
            className="w-full pl-8 pr-2.5 py-2 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#78350f] shadow-xs"
          />
        </div>

        {/* Order Mode Button */}
        {pendingItems.length > 1 && (
          <button
            onClick={() => {
              if (!isReordering && searchQuery.trim()) {
                setSearchQuery('');
              }
              setIsReordering(!isReordering);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
              isReordering 
                ? 'bg-[#78350f] text-white ring-2 ring-[#78350f]/40' 
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
            title="Order items vertically to procure one after one"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{isReordering ? 'Done Ordering' : 'Order List'}</span>
          </button>
        )}
      </div>

      {/* Reorder Instructions */}
      {isReordering && (
        <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[#78350f] text-xs flex items-center justify-between">
          <span>Tap <strong>▲</strong> and <strong>▼</strong> to arrange procurement order vertically one after one.</span>
          <button
            onClick={() => setIsReordering(false)}
            className="px-2 py-0.5 bg-[#78350f] text-white text-[10px] font-bold rounded-md ml-2"
          >
            Save
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && procurementItems.length === 0 ? (
        <LoadingScreen 
          message="Loading Plants..." 
          submessage="Retrieving your procurement checklist..." 
        />
      ) : filteredItems.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl p-8 text-center border border-stone-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 bg-amber-100 text-[#78350f] rounded-full flex items-center justify-center mx-auto">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-800">No Plants in Checklist</h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
              Add plants and materials you need to buy when visiting Kadiyam.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-[#78350f] hover:bg-[#632c0c] px-4 py-2 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Plant</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 1. TOP SECTION: PENDING (LEFT TO PROCURE) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                To Procure ({pendingItems.length} left)
              </span>
              <span className="text-[10px] text-stone-400 font-medium">
                Procure in order ↓
              </span>
            </div>

            {pendingItems.length === 0 ? (
              <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl p-4 text-center">
                <PackageCheck className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-emerald-800">All plants & materials procured!</p>
                <p className="text-[10px] text-emerald-600 mt-0.5">Procured items are listed below.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl p-3 shadow-xs border border-stone-200/80 hover:border-[#78350f]/50 transition-all flex items-center justify-between gap-3 group"
                  >
                    {/* Checkbox for Done */}
                    <button
                      type="button"
                      onClick={() => toggleProcurementStatus(item.id)}
                      className="flex-shrink-0 text-stone-400 hover:text-emerald-600 transition-colors p-1 -m-1"
                      title="Mark as Done"
                    >
                      <Square className="w-5 h-5 hover:scale-110 transition-transform text-stone-400" />
                    </button>

                    {/* Plant Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded flex-shrink-0">
                          #{index + 1}
                        </span>
                        <h4 className="text-sm font-bold text-stone-900 truncate">
                          {item.plant_name}
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-stone-600 mt-1 pl-6">
                        <span className="bg-amber-100/70 text-[#78350f] px-2 py-0.5 rounded-md font-bold">
                          Qty: {item.quantity}
                        </span>

                        {item.paid_amount ? (
                          <span className="text-emerald-700 font-bold">
                            Paid: {formatCurrency(item.paid_amount)}
                          </span>
                        ) : null}

                        {item.nursery_name && (
                          <span className="text-[11px] text-stone-600 flex items-center gap-0.5 bg-stone-100 px-1.5 py-0.5 rounded">
                            <Store className="w-3 h-3 text-[#78350f]" />
                            <span className="truncate max-w-[120px]">{item.nursery_name}</span>
                          </span>
                        )}

                        {item.location_link && (
                          <a
                            href={item.location_link.startsWith('http') ? item.location_link : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location_link)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded flex items-center gap-0.5 active:scale-95 transition-transform"
                            title="Open in Google Maps"
                          >
                            <MapPin className="w-2.5 h-2.5 text-rose-500" />
                            <span>Maps</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Actions / Order Controls */}
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {isReordering ? (
                        <div className="flex items-center space-x-1.5 bg-stone-100/90 p-1 rounded-lg border border-stone-200/60">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveUp(index);
                            }}
                            disabled={index === 0}
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-amber-50 text-stone-700 hover:text-[#78350f] disabled:opacity-25 disabled:hover:bg-white shadow-2xs active:scale-90 transition-all cursor-pointer disabled:cursor-not-allowed"
                            title="Move Up"
                            aria-label="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveDown(index);
                            }}
                            disabled={index === pendingItems.length - 1}
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-amber-50 text-stone-700 hover:text-[#78350f] disabled:opacity-25 disabled:hover:bg-white shadow-2xs active:scale-90 transition-all cursor-pointer disabled:cursor-not-allowed"
                            title="Move Down"
                            aria-label="Move Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(item);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-[#78350f] hover:bg-stone-100 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.plant_name)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-stone-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. BOTTOM SECTION: DONE (PROCURED) */}
          {doneItems.length > 0 && (
            <div className="pt-2 border-t border-dashed border-stone-300">
              <button
                type="button"
                onClick={() => setShowDoneSection(!showDoneSection)}
                className="w-full flex items-center justify-between py-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
              >
                <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  Done / Procured ({doneItems.length})
                </span>
                {showDoneSection ? (
                  <ChevronUp className="w-4 h-4 text-stone-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                )}
              </button>

              {showDoneSection && (
                <div className="space-y-2 mt-2">
                  {doneItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-stone-50/90 rounded-xl p-2.5 border border-stone-200/60 opacity-75 hover:opacity-100 transition-all flex items-center justify-between gap-3"
                    >
                      {/* Checkbox to uncheck */}
                      <button
                        type="button"
                        onClick={() => toggleProcurementStatus(item.id)}
                        className="flex-shrink-0 text-emerald-600 hover:text-stone-400 transition-colors p-1 -m-1"
                        title="Mark as Not Done"
                      >
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-stone-600 line-through truncate">
                          {item.plant_name}
                        </h4>
                        <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-0.5">
                          <span>Qty: {item.quantity}</span>
                          {item.paid_amount ? (
                            <span className="text-emerald-700 font-semibold">
                              Paid: {formatCurrency(item.paid_amount)}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }}
                          className="p-1 rounded text-stone-400 hover:text-[#78350f]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.plant_name)}
                          className="p-1 rounded text-stone-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <ProcurementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        initialData={editingItem}
      />

      {/* Procurement Route & Path Optimizer Modal */}
      <ProcurementRouteModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        items={pendingItems}
        onToggleItem={toggleProcurementStatus}
      />
    </div>
  );
};
