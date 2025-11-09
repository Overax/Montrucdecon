import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ICONS } from '../constants';
import { Project, Task } from '../types';

// --- Date Helper Functions ---
const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
};
const addDays = (d: Date, days: number) => {
    const date = new Date(d.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};
const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const isSameMonth = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
// --- End Date Helper Functions ---

type CalendarEvent = (Task | Project) & { type: 'task' | 'project'; date: Date };
type ViewType = 'month' | 'week' | 'day';

interface CalendarProps {
    openModal: (type: 'newEvent', payload: any) => void;
}

const EventPill: React.FC<{ event: CalendarEvent, view: ViewType }> = ({ event, view }) => {
    const text = 'name' in event ? event.name : event.text;
    const isProject = event.type === 'project';
    const colorClass = isProject 
      ? 'bg-amber-200/80 border-amber-300 dark:bg-amber-900/70 dark:border-amber-800 text-amber-800 dark:text-amber-200'
      : 'bg-sky-200/80 border-sky-300 dark:bg-sky-900/70 dark:border-sky-800 text-sky-800 dark:text-sky-200';
    
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/json', JSON.stringify(event));
        e.dataTransfer.effectAllowed = 'move';
        (e.target as HTMLElement).style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent) => {
        (e.target as HTMLElement).style.opacity = '1';
    }

    const time = event.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div 
            draggable 
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={`p-1 text-xs font-medium rounded-md truncate cursor-grab active:cursor-grabbing border ${colorClass}`} 
            title={text}>
            {view !== 'month' && <span className="font-bold">{time}</span>} {text}
        </div>
    );
};

const Calendar: React.FC<CalendarProps> = ({ openModal }) => {
    const { projects, tasks, updateTask, updateProject } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<ViewType>('month');

    const events: CalendarEvent[] = useMemo(() => [
        ...projects.map(p => ({ ...p, type: 'project' as const, date: new Date(p.deadline) })),
        ...tasks.filter(t => !t.completed).map(t => ({ ...t, type: 'task' as const, date: new Date(t.dueDate) })),
    ].sort((a,b) => a.date.getTime() - b.date.getTime()), [projects, tasks]);

    const handleDrop = (date: Date, e: React.DragEvent) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement).classList.remove('bg-primary-500/10');
        const eventJSON = e.dataTransfer.getData('application/json');
        if (!eventJSON) return;

        try {
            const draggedItem: CalendarEvent = JSON.parse(eventJSON);
            
            const originalEventDate = new Date(draggedItem.date);
            const newDropDate = new Date(date);

            // When dropping in month or week view, the date is at midnight. Preserve the event's original time.
            // When dropping in day view, the date has the correct hour. Preserve the event's original minutes.
            if (view === 'day') {
                newDropDate.setMinutes(originalEventDate.getMinutes());
            } else {
                newDropDate.setHours(originalEventDate.getHours());
                newDropDate.setMinutes(originalEventDate.getMinutes());
            }

            const newDateISO = newDropDate.toISOString();

            if (draggedItem.type === 'task') {
                updateTask(draggedItem.id, { dueDate: newDateISO });
            } else if (draggedItem.type === 'project') {
                updateProject(draggedItem.id, { deadline: newDateISO });
            }
        } catch (error) {
            console.error("Failed to parse dropped event data", error);
        }
    };
    
    const changeDate = (amount: number, unit: 'day' | 'week' | 'month') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (unit === 'day') newDate.setDate(newDate.getDate() + amount);
            if (unit === 'week') newDate.setDate(newDate.getDate() + amount * 7);
            if (unit === 'month') newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };
    
    const handleDoubleClick = (date: Date, hour?: number) => {
        const targetDate = new Date(date);
        if(hour !== undefined) {
          targetDate.setHours(hour);
        }
        openModal('newEvent', { date: targetDate.toISOString().split('T')[0] });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement).classList.add('bg-primary-500/10');
    };
    
    const handleDragLeave = (e: React.DragEvent) => {
        (e.currentTarget as HTMLElement).classList.remove('bg-primary-500/10');
    };

    const renderHeader = () => {
        let title = '';
        const year = currentDate.getFullYear();
        const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long' });

        if (view === 'month') title = `${monthName} ${year}`;
        if (view === 'week') {
             const start = getStartOfWeek(currentDate);
             const end = addDays(start, 6);
             title = `${start.getDate()} ${start.toLocaleDateString('fr-FR', {month: 'short'})} - ${end.getDate()} ${end.toLocaleDateString('fr-FR', {month: 'short'})} ${year}`;
        }
        if (view === 'day') title = currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

        const changeUnit = view === 'day' ? 'day' : view === 'week' ? 'week' : 'month';

        return (
            <div className="flex items-center justify-between pb-4 px-1">
                <div className="flex items-center space-x-2">
                    <div className="flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700 p-0.5">
                        <button onClick={() => changeDate(-1, changeUnit)} className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700"><ICONS.arrowLeft className="w-4 h-4" /></button>
                         <button onClick={() => setCurrentDate(new Date())} className="px-3 text-sm font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 h-full rounded-md py-1">Aujourd'hui</button>
                        <button onClick={() => changeDate(1, changeUnit)} className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700"><ICONS.arrowRight className="w-4 h-4" /></button>
                    </div>
                    <h2 className="text-xl font-bold ml-4">{title}</h2>
                </div>
                <div className="flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700 p-0.5 text-sm font-semibold">
                    {(['month', 'week', 'day'] as ViewType[]).map(v => (
                        <button 
                            key={v} 
                            onClick={() => setView(v)}
                            className={`px-3 py-1 rounded-md transition-colors ${view === v ? 'bg-primary-500 text-white' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
                        >{v.charAt(0).toUpperCase() + v.slice(1)}</button>
                    ))}
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startDate = getStartOfWeek(monthStart);
        const days = [];
        let day = new Date(startDate);

        for (let i = 0; i < 42; i++) {
            days.push(new Date(day));
            day = addDays(day, 1);
        }

        const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        
        return (
            <div className="grid grid-cols-7 grid-rows-6 h-full border-t border-l border-neutral-200 dark:border-neutral-800">
                {dayNames.map(name => <div key={name} className="text-center font-semibold text-xs text-neutral-500 py-2 border-b border-r border-neutral-200 dark:border-neutral-800">{name}</div>)}
                {days.map((d, i) => {
                    const dayEvents = events.filter(e => isSameDay(e.date, d));
                    const isToday = isSameDay(d, new Date());
                    const isCurrentMonth = isSameMonth(d, currentDate);

                    return (
                        <div key={i} 
                             onDoubleClick={() => handleDoubleClick(d)}
                             onDragOver={handleDragOver}
                             onDragLeave={handleDragLeave}
                             onDrop={(e) => handleDrop(d, e)}
                             className={`p-1.5 border-b border-r border-neutral-200 dark:border-neutral-800 flex flex-col relative transition-colors ${isCurrentMonth ? '' : 'bg-neutral-50/50 dark:bg-neutral-900/40'}`}>
                            <span className={`text-xs font-semibold self-start mb-1 ${isToday ? 'bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center' : ''} ${isCurrentMonth ? '' : 'text-neutral-400'}`}>{d.getDate()}</span>
                            <div className="space-y-1 overflow-y-auto">
                                {dayEvents.slice(0, 3).map(event => <EventPill key={event.id} event={event} view="month" />)}
                                {dayEvents.length > 3 && <div className="text-xs text-neutral-500 mt-1">+{dayEvents.length - 3} de plus</div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };
    
    const renderWeekView = () => {
        const weekStart = getStartOfWeek(currentDate);
        const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
        
        return (
            <div className="flex flex-col h-full">
                <div className="grid grid-cols-7 border-l border-t border-neutral-200 dark:border-neutral-800">
                    {days.map(d => (
                         <div key={d.toISOString()} className="text-center font-semibold text-xs text-neutral-500 py-2 border-b border-r border-neutral-200 dark:border-neutral-800">
                            <span>{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                            <span className={`ml-2 text-base ${isSameDay(d, new Date()) ? 'text-primary-500' : ''}`}>{d.getDate()}</span>
                         </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 flex-1 border-l border-neutral-200 dark:border-neutral-800">
                    {days.map(d => {
                        const dayEvents = events.filter(e => isSameDay(e.date, d));
                        return (
                            <div key={d.toISOString()}
                                onDoubleClick={() => handleDoubleClick(d)}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(d, e)}
                                className="p-1.5 border-b border-r border-neutral-200 dark:border-neutral-800 flex flex-col relative transition-colors"
                            >
                                <div className="space-y-1 overflow-y-auto">
                                    {dayEvents.map(event => <EventPill key={event.id} event={event} view="week" />)}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const renderDayView = () => {
        const hours = Array.from({length: 16}, (_, i) => i + 7); // 7am to 10pm
        const dayEvents = events.filter(e => isSameDay(e.date, currentDate));

        return (
            <div className="flex flex-col h-full border-t border-neutral-200 dark:border-neutral-800">
                 {hours.map(hour => {
                    const hourEvents = dayEvents.filter(e => e.date.getHours() === hour);
                    return (
                        <div key={hour} className="flex border-b border-neutral-200 dark:border-neutral-800 min-h-[60px]">
                            <div className="w-16 text-right pr-2 py-1 text-xs text-neutral-400 border-r border-neutral-200 dark:border-neutral-800">
                                {hour}:00
                            </div>
                            <div 
                                className="flex-1 p-1 transition-colors"
                                onDoubleClick={() => handleDoubleClick(currentDate, hour)}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => {
                                    const d = new Date(currentDate);
                                    d.setHours(hour);
                                    handleDrop(d, e);
                                }}
                            >
                                <div className="space-y-1">
                                    {hourEvents.map(event => <EventPill key={event.id} event={event} view="day" />)}
                                </div>
                            </div>
                        </div>
                    )
                 })}
            </div>
        )
    }


    return (
        <div className="bg-white/60 dark:bg-neutral-900/70 rounded-lg p-4 flex flex-col h-full">
            {renderHeader()}
            <div className="flex-1 overflow-auto -mx-4 -mb-4 px-4 pb-4">
               {view === 'month' && renderMonthView()}
               {view === 'week' && renderWeekView()}
               {view === 'day' && renderDayView()}
            </div>
        </div>
    );
};

export default Calendar;