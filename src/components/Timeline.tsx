import React from 'react';
import { Expense } from '../types';
import { motion } from 'motion/react';
import { Trash2, User, Users } from 'lucide-react';

interface TimelineProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  participants: string;
}

export const Timeline: React.FC<TimelineProps> = ({ expenses, onDelete, participants }) => {
  const participantList = participants.split(',').map(p => p.trim()).filter(p => p);
  const totalPeople = participantList.length + 1;
  const sharePerPerson = (amount: number) => Number((amount / totalPeople).toFixed(2));

  const grouped = expenses.reduce((acc, exp) => {
    const date = exp.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(exp);
    return acc;
  }, {} as Record<string, Expense[]>);

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (expenses.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-400 font-medium">No transactions in this group yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {sortedDates.map(date => (
        <div key={date} className="space-y-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
              {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
            <div className="flex-1 h-px bg-stone-100" />
          </div>

          <div className="space-y-3">
            {grouped[date].map((exp, idx) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white rounded-2xl p-4 border border-black/5 hover:border-black/10 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-stone-900 truncate">{exp.description}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-stone-50 rounded text-[10px] font-bold text-stone-400 uppercase tracking-tight">
                        Paid by {exp.payer || 'Me'}
                      </div>
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 rounded text-[10px] font-bold text-indigo-600 uppercase tracking-tight">
                        <Users size={10} />
                        Split with {participantList.length} others
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <div className="font-mono font-medium text-lg text-stone-900">
                      ${exp.amount.toFixed(2)}
                    </div>
                    <div className="text-[10px] font-medium text-emerald-600">
                      Each owes: ${sharePerPerson(exp.amount).toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(exp.id)}
                    className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
