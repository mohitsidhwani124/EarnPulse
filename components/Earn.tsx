
import React, { useState, useEffect } from 'react';
import { Task, TaskCategory } from '../types';
import { api } from '../services/api';

interface EarnProps {
  onCompleteTask: (task: Task) => void;
}

const Earn: React.FC<EarnProps> = ({ onCompleteTask }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      const data = await api.tasks.getAll();
      setTasks(data);
      setLoading(false);
    };
    fetchTasks();
  }, []);

  const filteredTasks = filter === 'All' 
    ? tasks 
    : tasks.filter(t => t.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Available Tasks</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {['All', ...Object.values(TaskCategory)].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === cat ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white p-6 rounded-3xl animate-pulse h-40 border border-gray-100"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white p-5 rounded-3xl border border-gray-100 hover:border-green-200 transition-all flex flex-col justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-xl">
                  <i className={`fa-solid ${task.icon}`}></i>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800 text-sm">{task.title}</h3>
                    <span className="text-green-600 font-bold text-sm">+${task.reward.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{task.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                 <div className="flex gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <span>{task.estimatedTime}</span>
                    <span>{task.difficulty}</span>
                 </div>
                 <button 
                  onClick={() => onCompleteTask(task)}
                  className="px-4 py-2 bg-gray-50 hover:bg-green-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                >
                  Start Task
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Earn;
