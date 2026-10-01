import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Users,
  Edit
} from 'lucide-react';
import { useStudioData } from '../context/StudioDataContext';
import { formatDate } from '../utils/calculations';
import { StatusBadge } from '../components/common/StatusBadge';

interface CalendarPageProps {
  navigate: (path: string) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ navigate }) => {
  const { events, daySchedules, clients, teamAssignments, teamMembers } = useStudioData();

  // Current year & month for calendar
  const [currentDate, setCurrentDate] = useState(new Date('2026-10-01'));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Map calendar cells
  const calendarDays: Array<{ dayNumber: number; dateStr: string } | null> = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const monthFormatted = String(month + 1).padStart(2, '0');
    const dayFormatted = String(d).padStart(2, '0');
    const dateStr = `${year}-${monthFormatted}-${dayFormatted}`;
    calendarDays.push({ dayNumber: d, dateStr });
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Studio Master Calendar</h2>
          <p className="text-xs text-gray-500">
            Interactive visual schedule of single-day & multi-day wedding shoots and crew deployments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 min-w-36 text-center shadow-xs">
            {monthName}
          </div>
          <button
            onClick={nextMonth}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-200">
          {calendarDays.map((cell, index) => {
            if (!cell) {
              return <div key={`empty-${index}`} className="min-h-28 bg-gray-50/40 p-2" />;
            }

            // Events on this date (either main event date or multi-day schedule date)
            const matchedEvents = events.filter(e => {
              if (e.eventDate === cell.dateStr && e.status !== 'Cancelled') return true;
              return daySchedules.some(d => d.eventId === e.id && d.date === cell.dateStr);
            });

            // Day schedules on this date
            const matchedDaySchedules = daySchedules.filter(d => d.date === cell.dateStr);

            return (
              <div
                key={cell.dateStr}
                className="min-h-28 p-2 flex flex-col justify-between hover:bg-amber-50/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-700">{cell.dayNumber}</span>
                  {matchedEvents.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>

                <div className="mt-1 space-y-1 flex-1">
                  {matchedDaySchedules.map(day => {
                    const parentEvent = events.find(e => e.id === day.eventId);
                    return (
                      <div
                        key={day.id}
                        className="p-1.5 bg-amber-100/90 border border-amber-300 rounded text-[10px] hover:bg-amber-200 transition-colors shadow-xs group/card relative"
                      >
                        <div onClick={() => navigate(`/events/${day.eventId}`)} className="cursor-pointer">
                          <div className="font-bold text-amber-950 truncate">
                            Day {day.dayNumber}: {day.eventType}
                          </div>
                          <div className="text-amber-800 truncate text-[9px]">{day.venue}</div>
                        </div>
                        <div className="mt-1 flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/events/${day.eventId}/edit`);
                            }}
                            className="px-1.5 py-0.5 rounded bg-amber-200 hover:bg-amber-300 text-amber-950 text-[9px] font-bold inline-flex items-center gap-0.5 cursor-pointer shadow-2xs"
                            title="Edit Event Parameters"
                          >
                            <Edit className="w-2.5 h-2.5 text-amber-700" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {matchedEvents.map(evt => {
                    // if event is already listed via day schedule, skip duplicate
                    if (matchedDaySchedules.some(d => d.eventId === evt.id)) return null;

                    const client = clients.find(c => c.id === evt.clientId);
                    return (
                      <div
                        key={evt.id}
                        className="p-1.5 bg-slate-900 text-white rounded text-[10px] hover:bg-slate-800 transition-colors shadow-xs group/card relative"
                      >
                        <div onClick={() => navigate(`/events/${evt.id}`)} className="cursor-pointer">
                          <div className="font-bold truncate">{evt.title}</div>
                          <div className="text-slate-300 truncate text-[9px]">{client?.name}</div>
                        </div>
                        <div className="mt-1 flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/events/${evt.id}/edit`);
                            }}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-[9px] font-bold inline-flex items-center gap-0.5 transition-colors cursor-pointer shadow-2xs"
                            title="Edit Event Parameters"
                          >
                            <Edit className="w-2.5 h-2.5 text-amber-400 group-hover:text-slate-950" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
