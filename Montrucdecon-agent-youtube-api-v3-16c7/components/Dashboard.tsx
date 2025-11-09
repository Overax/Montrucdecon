
import React from 'react';
import Card from './ui/Card';
import { useAppContext } from '../contexts/AppContext';
import { PROJECT_STATUS_COLORS, ICONS } from '../constants';
import type { View, Project } from '../types';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
    <Card className="flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
            <p className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">{value}</p>
        </div>
        <div className="p-3 bg-primary-100 dark:bg-primary-500/20 rounded-full text-primary-600 dark:text-primary-300">
           {icon}
        </div>
    </Card>
);

const RevenueChart: React.FC<{ projects: Project[] }> = ({ projects }) => {
    const monthlyRevenue: { [key: string]: number } = {};
    const monthLabels: string[] = [];

    // Get last 4 months including current
    for (let i = 3; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = d.toLocaleDateString('fr-FR', { month: 'short' });
        monthlyRevenue[monthKey] = 0;
        if (!monthLabels.includes(monthLabel)) {
            monthLabels.push(monthLabel);
        }
    }

    projects.forEach(p => {
        const deadline = new Date(p.deadline);
        const monthKey = `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyRevenue.hasOwnProperty(monthKey)) {
            monthlyRevenue[monthKey] += p.estimatedRevenue;
        }
    });

    const maxRevenue = Math.max(...Object.values(monthlyRevenue), 1); // Avoid division by zero

    return (
        <Card>
            <h2 className="text-lg font-semibold mb-4 text-neutral-700 dark:text-neutral-200">Revenus Estimés (4 derniers mois)</h2>
            <div className="flex justify-around items-end h-48 space-x-4 p-4">
                {Object.entries(monthlyRevenue).map(([monthKey, revenue], index) => {
                    const heightPercentage = (revenue / maxRevenue) * 100;
                    return (
                        <div key={monthKey} className="flex flex-col items-center flex-1">
                            <div className="w-full flex items-end h-full">
                                <div 
                                    className="w-full bg-primary-200 dark:bg-primary-800/70 rounded-t-md hover:bg-primary-300 dark:hover:bg-primary-700 transition-all duration-300" 
                                    style={{ height: `${heightPercentage}%` }}
                                    title={`${revenue.toLocaleString('fr-FR')}€`}
                                ></div>
                            </div>
                            <span className="text-xs font-medium text-neutral-500 mt-2 capitalize">{monthLabels[index]}</span>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};


const Dashboard: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
  const { stats, projects, getClientById } = useAppContext();

  const upcomingDeadlines = projects
    .filter(p => p.status !== 'Terminé' && new Date(p.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Clients" value={stats.clientCount} icon={<ICONS.clients className="w-6 h-6"/>} />
        <StatCard title="Projets Actifs" value={stats.activeProjects} icon={<ICONS.projects className="w-6 h-6"/>}/>
        <StatCard title="Revenus Estimés" value={`${stats.estimatedRevenue.toLocaleString('fr-FR')}€`} icon={<span className="text-2xl font-semibold w-6 h-6 flex items-center justify-center">€</span>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-neutral-700 dark:text-neutral-200">Échéances à venir</h2>
            {upcomingDeadlines.length > 0 ? (
                 <div className="space-y-3">
                 {upcomingDeadlines.map(project => {
                     const client = getClientById(project.clientId);
                     return (
                         <div key={project.id} className="flex items-center justify-between p-3 bg-neutral-100/50 dark:bg-neutral-800/60 rounded-lg">
                             <div>
                                 <p className="font-semibold">{project.name}</p>
                                 <p className="text-sm text-neutral-500 dark:text-neutral-400">{client?.name}</p>
                             </div>
                             <div className="text-right flex-shrink-0 ml-4">
                                <p className="font-medium text-sm">{new Date(project.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                                <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${PROJECT_STATUS_COLORS[project.status]}`}>{project.status}</span>
                             </div>
                         </div>
                     );
                 })}
             </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-neutral-500 dark:text-neutral-400 p-8">
                    <span className="text-4xl mb-4">🎉</span>
                    <p>Aucune échéance à venir. <br/> C'est le moment de se détendre !</p>
                </div>
            )}
        </Card>
        <RevenueChart projects={projects} />
      </div>
    </div>
  );
};

export default Dashboard;