import React, { useState, useEffect } from 'react';
import { Wallet, LayoutGrid, Plus, ChevronLeft, Users, Trash2, ChevronDown, ArrowUpRight, Info, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ExpenseInput } from './components/ExpenseInput';
import { Timeline } from './components/Timeline';
import { Expense, Group } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { localData } from './services/localData';
import { exportToExcel, exportToPDF } from './services/export';

function AppContent() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showBalances, setShowBalances] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupParticipants, setNewGroupParticipants] = useState('');

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      const savedGroups = await localData.getGroups();
      setGroups(savedGroups);
      setLoading(false);
    };
    loadData();
  }, []);

  // Fetch expenses for selected group
  useEffect(() => {
    if (!selectedGroup) {
      setExpenses([]);
      return;
    }
    const loadExpenses = async () => {
      const savedExpenses = await localData.getExpenses(selectedGroup.id);
      setExpenses(savedExpenses);
    };
    loadExpenses();
  }, [selectedGroup]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName || !newGroupParticipants) return;
    
    const newGroup: Group = {
      id: Math.random().toString(36).substr(2, 9),
      name: newGroupName,
      participants: newGroupParticipants,
      ownerId: 'local-user',
      createdAt: new Date().toISOString()
    };

    const updatedGroups = [newGroup, ...groups];
    setGroups(updatedGroups);
    await localData.saveGroups(updatedGroups);
    
    setNewGroupName('');
    setNewGroupParticipants('');
    setShowCreateGroup(false);
  };

  const handleAddExpense = async (newExp: Pick<Expense, 'amount' | 'description' | 'category' | 'payer'>) => {
    if (!selectedGroup) return;
    
    const expense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      ...newExp,
      groupId: selectedGroup.id,
      createdBy: 'local-user',
      date: new Date().toISOString()
    };

    const updatedExpenses = [expense, ...expenses];
    setExpenses(updatedExpenses);
    await localData.saveExpenses(selectedGroup.id, updatedExpenses);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!selectedGroup) return;
    const updatedExpenses = expenses.filter(e => e.id !== id);
    setExpenses(updatedExpenses);
    await localData.saveExpenses(selectedGroup.id, updatedExpenses);
  };

  const handleDeleteGroup = async (id: string) => {
    if (!window.confirm("Are you sure? This will delete the group and all its expenses locally.")) return;
    await localData.deleteGroup(id);
    setGroups(groups.filter(g => g.id !== id));
    if (selectedGroup?.id === id) setSelectedGroup(null);
  };

  const participantList = selectedGroup?.participants.split(',').map(p => p.trim()).filter(p => p) || [];
  const totalPeople = participantList.length + 1;
  const totalSpent = Number(expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2));
  const totalOwedToYou = Number((totalSpent * (participantList.length / totalPeople)).toFixed(2));

  if (!selectedGroup) {
    return (
      <div className="min-h-screen bg-[#F8F8F7] text-stone-900 font-sans p-6">
        <div className="max-w-2xl mx-auto">
          <header className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-white">
                <LayoutGrid size={18} />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Simple Split</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                Local Mode
              </div>
              <button 
                onClick={() => setShowCreateGroup(true)}
                className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
              >
                <Plus size={20} />
              </button>
            </div>
          </header>

          <AnimatePresence>
            {showCreateGroup && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mb-12 bg-white rounded-3xl p-6 shadow-xl border border-black/5"
              >
                <h2 className="text-lg font-bold mb-4">Create New Group</h2>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Group Name</label>
                    <input 
                      type="text" 
                      value={newGroupName}
                      onChange={e => setNewGroupName(e.target.value)}
                      placeholder="e.g. Roommates, Trip to Paris"
                      className="w-full bg-stone-50 border-none rounded-xl p-3 outline-none focus:ring-2 ring-stone-200 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Splitting with (Names separated by commas)</label>
                    <input 
                      type="text" 
                      value={newGroupParticipants}
                      onChange={e => setNewGroupParticipants(e.target.value)}
                      placeholder="e.g. Alice, Bob, Charlie"
                      className="w-full bg-stone-50 border-none rounded-xl p-3 outline-none focus:ring-2 ring-stone-200 transition-all"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-stone-900 text-white rounded-xl py-3 font-bold text-sm">Create Group</button>
                    <button type="button" onClick={() => setShowCreateGroup(false)} className="px-6 bg-stone-100 text-stone-600 rounded-xl py-3 font-bold text-sm">Cancel</button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 gap-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">My Groups</h3>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
                <Users className="mx-auto text-stone-200 mb-4" size={48} />
                <p className="text-stone-400 font-medium">Create your first group to start splitting!</p>
              </div>
            ) : (
              groups.map(group => (
                <div key={group.id} className="group relative">
                  <button
                    onClick={() => setSelectedGroup(group)}
                    className="w-full bg-white rounded-2xl p-6 shadow-sm border border-black/5 hover:border-black/10 transition-all text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Users size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{group.name}</h4>
                        <p className="text-xs text-stone-400 font-medium">{group.participants.split(',').length} people splitting</p>
                      </div>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleDeleteGroup(group.id)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-stone-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F7] text-stone-900 font-sans selection:bg-emerald-100">
      <header className="sticky top-0 z-10 bg-[#F8F8F7]/80 backdrop-blur-md border-b border-stone-200/50">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => setSelectedGroup(null)}
              className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors"
            >
              <ChevronLeft size={20} />
              <span className="text-sm font-bold uppercase tracking-wider">Back</span>
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold tracking-tight">{selectedGroup.name}</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{totalPeople} people total</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors shadow-sm"
                  title="Export Summary"
                >
                  <Download size={18} />
                </button>
                
                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-black/5 p-2 z-20"
                    >
                      <button 
                        onClick={() => {
                          exportToExcel(selectedGroup, expenses);
                          setShowExportMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-stone-600 hover:bg-stone-50 rounded-xl transition-colors"
                      >
                        <FileSpreadsheet size={18} className="text-emerald-500" />
                        Export Excel
                      </button>
                      <button 
                        onClick={() => {
                          exportToPDF(selectedGroup, expenses);
                          setShowExportMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-stone-600 hover:bg-stone-50 rounded-xl transition-colors"
                      >
                        <FileText size={18} className="text-red-500" />
                        Export PDF
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                ME
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
              <div className="flex items-center gap-2 text-stone-400 mb-1">
                <Wallet size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Group Spent</span>
              </div>
              <div className="text-xl font-mono font-medium">${totalSpent.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
              <div className="flex items-center gap-2 text-emerald-500 mb-1">
                <ArrowUpRight size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Owed to You</span>
              </div>
              <div className="text-xl font-mono font-medium text-emerald-600">${totalOwedToYou.toFixed(2)}</div>
            </div>
          </div>

          {participantList.length > 0 && (
            <div className="mt-6 bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
              <button 
                onClick={() => setShowBalances(!showBalances)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Individual Balances</h3>
                  <div className="px-2 py-0.5 bg-indigo-50 rounded text-[10px] font-bold text-indigo-600 uppercase">
                    {totalPeople} Way Split
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: showBalances ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "backOut" }}
                  className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:text-stone-900 transition-colors"
                >
                  <ChevronDown size={18} />
                </motion.div>
              </button>

              <AnimatePresence>
                {showBalances && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Detailed Breakdown</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => exportToExcel(selectedGroup, expenses)}
                            className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-tight hover:bg-emerald-100 transition-colors"
                          >
                            <FileSpreadsheet size={12} />
                            Excel
                          </button>
                          <button 
                            onClick={() => exportToPDF(selectedGroup, expenses)}
                            className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-tight hover:bg-red-100 transition-colors"
                          >
                            <FileText size={12} />
                            PDF
                          </button>
                        </div>
                      </div>
                      {['Me', ...participantList].map((name, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-stone-50/50 rounded-2xl border border-black/[0.02]">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-900 text-sm font-bold border border-black/5">
                              {name === 'Me' ? 'ME' : name[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-stone-900">{name}</div>
                              <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Total Debt</div>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-4">
                            <div className="flex flex-col items-end">
                              <div className="font-mono font-bold text-lg text-emerald-600">
                                ${(totalSpent / totalPeople).toFixed(2)}
                              </div>
                              <div className="flex gap-2 mt-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    exportToExcel(selectedGroup, expenses, name);
                                  }}
                                  className="p-1.5 hover:bg-emerald-50 text-stone-300 hover:text-emerald-600 rounded-lg transition-colors"
                                  title={`Export Excel for ${name}`}
                                >
                                  <FileSpreadsheet size={14} />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    exportToPDF(selectedGroup, expenses, name);
                                  }}
                                  className="p-1.5 hover:bg-red-50 text-stone-300 hover:text-red-600 rounded-lg transition-colors"
                                  title={`Export PDF for ${name}`}
                                >
                                  <FileText size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-12">
          <ExpenseInput onAdd={handleAddExpense} participants={selectedGroup.participants} />
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
            <Wallet className="mx-auto text-stone-200 mb-4" size={48} />
            <p className="text-stone-400 font-medium">No expenses yet. Add one above!</p>
          </div>
        ) : (
          <Timeline expenses={expenses} onDelete={handleDeleteExpense} participants={selectedGroup.participants} />
        )}
      </main>

      <footer className="max-w-2xl mx-auto px-6 py-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-full text-[10px] font-bold text-stone-400 uppercase tracking-widest">
          <Info size={12} />
          Local Storage Mode • Fully Offline
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
