import React, { useState } from 'react';
import { Plus, User } from 'lucide-react';

interface ExpenseInputProps {
  onAdd: (expense: { amount: number; description: string; category: string; payer: string }) => void;
  participants: string;
}

export const ExpenseInput: React.FC<ExpenseInputProps> = ({ onAdd, participants }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [payer, setPayer] = useState('Me');
  
  const participantList = ['Me', ...participants.split(',').map(p => p.trim()).filter(p => p)];
  const totalPeople = participantList.length;
  const splitPercentage = (100 / totalPeople).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    onAdd({
      amount: parseFloat(amount),
      description,
      category: 'Other',
      payer
    });

    setAmount('');
    setDescription('');
    setPayer('Me');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 transition-all focus-within:shadow-md focus-within:border-black/10">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-stone-50 border border-black/5 rounded-xl px-4 py-3 text-lg font-mono font-bold outline-none focus:border-stone-900 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Paid By</label>
            <div className="relative">
              <select
                value={payer}
                onChange={(e) => setPayer(e.target.value)}
                className="w-full bg-stone-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold outline-none appearance-none focus:border-stone-900 transition-colors pr-10"
              >
                {participantList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Description</label>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was this for?"
            className="w-full bg-stone-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-stone-900 transition-colors"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Auto-split:</span>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase">
              {splitPercentage}% each ({totalPeople} people)
            </span>
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors shadow-lg shadow-stone-200"
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>
      </form>
    </div>
  );
};
