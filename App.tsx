
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Notice, ReadStatus, RoleCategory, Attachment, AppNotification } from './types';
import { ALL_USERS, DEFAULT_PASSWORD } from './constants';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Plus, 
  CheckCircle2,
  Flag,
  AlertCircle,
  X,
  Clock,
  MapPin,
  Tag,
  Users,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Download,
  Bell,
  Search as SearchIcon,
  Check,
  CalendarDays,
  Columns,
  LayoutGrid,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { 
  format, 
  addDays, 
  endOfMonth, 
  eachDayOfInterval, 
  endOfISOWeek,
  addWeeks,
  addMonths,
  isSameMonth,
  isToday as isTodayFn,
  startOfMonth,
  startOfWeek,
  startOfISOWeek
} from 'date-fns';

const STORAGE_KEY = 'hksy_app_v5_resilient';
type ViewType = 'Day' | 'Week' | 'Month';

const getDisplayName = (user?: User) => {
  if (!user) return 'Unknown User';
  return user.englishName;
};

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [readStatus, setReadStatus] = useState<ReadStatus>({});
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loginError, setLoginError] = useState('');
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<ViewType>('Week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  // Load Initial Data
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotices(parsed.notices || []);
        setReadStatus(parsed.readStatus || {});
        setNotifications(parsed.notifications || []);
      }
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
    }
    
    const savedUser = sessionStorage.getItem('hksy_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        sessionStorage.removeItem('hksy_user');
      }
    }
  }, []);

  // Persist State with Quota Handling
  useEffect(() => {
    try {
      const stateString = JSON.stringify({ notices, readStatus, notifications });
      localStorage.setItem(STORAGE_KEY, stateString);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn("LocalStorage quota exceeded. Data is current in memory but won't persist across sessions.");
      }
    }
  }, [notices, readStatus, notifications]);

  // Tab Sync
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setNotices(parsed.notices || []);
          setReadStatus(parsed.readStatus || {});
          setNotifications(parsed.notifications || []);
        } catch (err) {
          console.error("Sync error", err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (e) {
      // Audio fails are common and should never crash the app
    }
  };

  const checkAndNotify = (notice: Notice) => {
    if (!currentUser || notice.senderId === currentUser.id) return;
    
    const isTagged = (notice.taggedUserIds || []).includes(currentUser.id);
    const isRelevantCategory = notice.category === currentUser.category;

    if (isTagged || isRelevantCategory) {
      const newNotif: AppNotification = {
        id: Math.random().toString(36).substr(2, 9),
        noticeId: notice.id,
        message: `New notice from ${ALL_USERS.find(u => u.id === notice.senderId)?.englishName || 'Staff'}`,
        timestamp: Date.now(),
        isRead: false,
        isPriority: isTagged
      };
      setNotifications(prev => [newNotif, ...prev]);
      setActiveToast(newNotif);
      playNotificationSound();
      setTimeout(() => setActiveToast(null), 5000);
    }
  };

  const isRead = (userId: string, noticeId: string) => !!readStatus[`${userId}_${noticeId}`];

  const markAsRead = (noticeId: string) => {
    if (!currentUser) return;
    const key = `${currentUser.id}_${noticeId}`;
    setReadStatus(prev => ({ ...prev, [key]: true }));
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('englishName')?.toString().trim().toLowerCase();
    const pw = formData.get('password')?.toString();

    if (pw !== DEFAULT_PASSWORD) {
      setLoginError('Incorrect password.');
      return;
    }

    const user = ALL_USERS.find(u => u.englishName.toLowerCase() === name);
    if (user) {
      setCurrentUser(user);
      sessionStorage.setItem('hksy_user', JSON.stringify(user));
    } else {
      setLoginError('User not found.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('hksy_user');
  };

  const createNotice = (content: string, category: RoleCategory, taggedIds: string[], date: string, attachments: Attachment[]) => {
    if (!currentUser) return;
    
    // Default to all members if none selected
    const finalTaggedIds = taggedIds.length > 0 ? taggedIds : ALL_USERS.map(u => u.id);

    const newNotice: Notice = {
      id: Math.random().toString(36).substr(2, 9),
      content: content.trim(),
      senderId: currentUser.id,
      category,
      date: date || format(new Date(), 'yyyy-MM-dd'),
      taggedUserIds: finalTaggedIds,
      attachments: attachments || [],
      createdAt: Date.now()
    };

    setNotices(prev => [newNotice, ...prev]);
    setShowNoticeForm(false);
    
    setTimeout(() => checkAndNotify(newNotice), 100);
  };

  const viewLabel = useMemo(() => {
    try {
      if (viewType === 'Day') return format(currentDate, 'MMMM d, yyyy');
      if (viewType === 'Week') {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = addDays(start, 6);
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
      }
      return format(currentDate, 'MMMM yyyy');
    } catch (e) {
      return "Select Date";
    }
  }, [currentDate, viewType]);

  const calendarDays = useMemo(() => {
    try {
      if (viewType === 'Day') return [currentDate];
      if (viewType === 'Week') {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        return Array.from({ length: 7 }, (_, i) => addDays(start, i));
      }
      const start = startOfISOWeek(startOfMonth(currentDate));
      const end = endOfISOWeek(endOfMonth(currentDate));
      return eachDayOfInterval({ start, end });
    } catch (e) {
      return [new Date()];
    }
  }, [currentDate, viewType]);

  const filteredNoticesList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return notices.filter(n => n.content.toLowerCase().includes(q));
  }, [notices, searchQuery]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-sm px-4">
          <div className="bg-white rounded-[40px] shadow-2xl p-10 space-y-8 animate-in fade-in zoom-in duration-500 max-w-sm mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-indigo-100">
                <CalendarIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Hankai Portal</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Staff Administration</p>
              </div>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input name="englishName" placeholder="English Name" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-sm text-slate-900" required autoComplete="username" />
              <input name="password" type="password" placeholder="Password" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-sm text-slate-900" required autoComplete="current-password" />
              {loginError && <p className="text-rose-500 text-[10px] font-bold uppercase text-center">{loginError}</p>}
              <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-100">Sign In</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Real-time Toast */}
      {activeToast && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right duration-500 ease-out">
          <div className="bg-white p-5 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4 max-w-xs ring-1 ring-black/5">
            <div className={`p-2.5 rounded-2xl ${activeToast.isPriority ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notification</p>
              <p className="text-xs font-bold mt-0.5 line-clamp-1">{activeToast.message}</p>
            </div>
            <button onClick={() => setActiveToast(null)} className="p-2 text-slate-300 hover:text-slate-600 transition-all"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-20 bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-[1600px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black uppercase tracking-tight leading-none text-slate-900">Hankai Academy</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Intl. Department</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-3 rounded-2xl transition-all relative ${showNotifications ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inbox</span>
                    <button onClick={() => setNotifications([])} className="text-[9px] font-black uppercase text-indigo-600 hover:underline transition-all">Clear</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center text-slate-300">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-10" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">All clear</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
                          onClick={() => {
                            const found = notices.find(f => f.id === n.noticeId);
                            if (found) setSelectedNotice(found);
                            setShowNotifications(false);
                          }}
                        >
                          <p className="text-xs font-bold text-slate-700">{n.message}</p>
                          <p className="text-[9px] font-medium text-slate-400 mt-1">{format(n.timestamp, 'MMM d, HH:mm')}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowNoticeForm(true)}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Post Notice
            </button>

            <div className="w-px h-8 bg-slate-100 mx-2 hidden sm:block" />

            <div className="flex items-center gap-3 bg-slate-50 pr-4 pl-1.5 py-1.5 rounded-2xl border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-xs font-black shadow-sm text-indigo-600">
                {currentUser.englishName.charAt(0)}
              </div>
              <div className="hidden lg:block">
                <p className="text-[10px] font-black uppercase tracking-tight leading-none text-slate-900">{currentUser.englishName}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{currentUser.category}</p>
              </div>
              <button onClick={handleLogout} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto w-full p-6 flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
            <button onClick={() => setCurrentDate(addDays(currentDate, -1))} className="p-2 hover:bg-slate-50 rounded-xl transition-all"><ChevronLeft className="w-4 h-4" /></button>
            <h2 className="text-xs font-black uppercase tracking-widest px-4 min-w-[180px] text-center">{viewLabel}</h2>
            <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 hover:bg-slate-50 rounded-xl transition-all"><ChevronRight className="w-4 h-4" /></button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-50 focus:border-indigo-600 transition-all w-48 sm:w-64 text-slate-900" 
              />
            </div>
            
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
              {(['Day', 'Week', 'Month'] as ViewType[]).map(v => (
                <button 
                  key={v}
                  onClick={() => setViewType(v)}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewType === v ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`flex-1 grid gap-4 overflow-y-auto pb-10 scrollbar-hide ${
          viewType === 'Day' ? 'grid-cols-1 max-w-2xl mx-auto w-full' : 
          viewType === 'Week' ? 'grid-cols-1 md:grid-cols-7' : 
          'grid-cols-2 sm:grid-cols-4 md:grid-cols-7'
        }`}>
          {calendarDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayNotices = filteredNoticesList.filter(n => n.date === dateStr);
            const isToday = isTodayFn(day);
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div 
                key={dateStr} 
                className={`flex flex-col bg-white rounded-3xl border transition-all ${isToday ? 'border-indigo-600 ring-4 ring-indigo-50 shadow-xl' : 'border-slate-100 shadow-sm'} ${!isCurrentMonth && viewType === 'Month' ? 'opacity-30' : ''}`}
              >
                <div className={`p-4 flex justify-between items-center ${isToday ? 'bg-indigo-600 text-white rounded-t-[22px]' : 'text-slate-400'}`}>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest">{format(day, 'EEE')}</span>
                    <span className="text-lg font-black leading-none">{format(day, 'd')}</span>
                  </div>
                  {dayNotices.length > 0 && <span className={`text-[8px] font-black px-2 py-1 rounded-full ${isToday ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{dayNotices.length}</span>}
                </div>
                <div className="p-3 space-y-3 flex-1 overflow-y-auto scrollbar-hide min-h-[120px]">
                  {dayNotices.map(notice => (
                    <NoticeItem 
                      key={notice.id} 
                      notice={notice} 
                      isRead={isRead(currentUser.id, notice.id)}
                      readStatus={readStatus}
                      onOpen={() => setSelectedNotice(notice)}
                      currentUserId={currentUser.id}
                      compact={viewType === 'Month'}
                    />
                  ))}
                  {dayNotices.length === 0 && viewType !== 'Month' && (
                    <div className="h-full flex flex-col items-center justify-center opacity-5 py-10">
                      <CalendarIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {showNoticeForm && <NoticeForm onClose={() => setShowNoticeForm(false)} onSubmit={createNotice} currentUser={currentUser} />}
      {selectedNotice && (
        <NoticeDetailModal 
          notice={selectedNotice} 
          readStatus={readStatus} 
          isRead={isRead(currentUser.id, selectedNotice.id)} 
          onClose={() => setSelectedNotice(null)} 
          onMarkRead={() => markAsRead(selectedNotice.id)} 
        />
      )}
    </div>
  );
};

/* --- SUBCOMPONENTS --- */

const AttachmentPreview: React.FC<{ file: Attachment }> = ({ file }) => {
  const [showPreview, setShowPreview] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const isImage = file.type?.startsWith('image/');
  const isPdf = file.type === 'application/pdf';

  const togglePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreview(!showPreview);
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const PreviewContent = ({ full = false }) => (
    <>
      {isImage && (
        <div className={`flex items-center justify-center bg-slate-800 ${full ? 'h-full w-full p-4' : 'p-4 min-h-[300px]'}`}>
          <div className={`relative border-[12px] border-slate-700 shadow-2xl rounded-sm transform transition-transform ${full ? 'max-h-full max-w-full overflow-auto' : ''}`}>
            <img src={file.data} alt={file.name} className={`${full ? 'max-h-full max-w-full' : 'max-w-full h-auto'} object-contain block`} />
          </div>
        </div>
      )}
      {isPdf && (
        <div className={`bg-slate-200 ${full ? 'h-full w-full' : 'w-full h-[500px]'}`}>
           <iframe 
             src={`${file.data}#toolbar=0&navpanes=0&scrollbar=1`} 
             className="w-full h-full border-none" 
             title={file.name}
           />
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-3 w-full">
      <div className={`flex items-center gap-4 p-4 bg-white rounded-2xl border transition-all ${showPreview ? 'border-indigo-600 ring-2 ring-indigo-50 shadow-md' : 'border-slate-100 hover:border-indigo-100 hover:shadow-md'} group`}>
        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shadow-sm transition-transform group-hover:scale-105">
          {isImage ? <ImageIcon className="w-5 h-5" /> : (isPdf ? <FileText className="w-5 h-5" /> : <Paperclip className="w-5 h-5" />)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-tight truncate text-slate-700">{file.name || 'File'}</p>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{file.type?.split('/')[1]?.toUpperCase() || 'UNKNOWN'}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {(isImage || isPdf) && (
            <>
              <button 
                onClick={toggleExpand}
                className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                title="Full Screen"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button 
                onClick={togglePreview}
                className={`p-2 rounded-lg transition-all ${showPreview ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50'}`}
                title={showPreview ? "Hide Preview" : "Show Preview"}
              >
                {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </>
          )}
          <a 
            href={file.data} 
            download={file.name || 'download'}
            className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            onClick={(e) => e.stopPropagation()}
            title="Download"
          >
            <Download className="w-5 h-5" />
          </a>
        </div>
      </div>

      {showPreview && (
        <div className="w-full animate-in slide-in-from-top-2 duration-300 overflow-hidden bg-slate-900 rounded-[32px] border-4 border-slate-100 shadow-inner group/viewer">
          <PreviewContent />
        </div>
      )}

      {/* FULL SCREEN OVERLAY */}
      {isExpanded && (
        <div className="fixed inset-0 z-[150] bg-slate-950 flex flex-col animate-in fade-in duration-300">
          <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
             <div className="flex items-center gap-4">
               <div className="p-2 bg-indigo-600 rounded-lg text-white">
                 {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
               </div>
               <span className="text-xs font-black uppercase tracking-widest text-white truncate max-w-sm">{file.name}</span>
             </div>
             <button 
               onClick={() => setIsExpanded(false)}
               className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
             >
               <Minimize2 className="w-4 h-4" /> Close Full Screen
             </button>
          </div>
          <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-4">
             <PreviewContent full />
          </div>
        </div>
      )}
    </div>
  );
};

const NoticeItem: React.FC<{ 
  notice: Notice; 
  isRead: boolean; 
  readStatus: ReadStatus;
  onOpen: () => void;
  currentUserId: string;
  compact: boolean;
}> = ({ notice, isRead, readStatus, onOpen, currentUserId, compact }) => {
  const sender = ALL_USERS.find(u => u.id === notice.senderId);
  const taggedUserIds = notice.taggedUserIds || [];
  const totalTagged = taggedUserIds.length;
  const acknowledgedCount = taggedUserIds.filter(uid => readStatus[`${uid}_${notice.id}`]).length;
  const progress = totalTagged > 0 ? (acknowledgedCount / totalTagged) * 100 : 0;
  const isTagged = taggedUserIds.includes(currentUserId);

  if (compact) {
    return (
      <div 
        onClick={onOpen}
        className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold cursor-pointer truncate transition-all ${isRead ? 'bg-slate-50 border-transparent text-slate-400' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}
      >
        <span className="truncate">{notice.content}</span>
      </div>
    );
  }

  return (
    <div 
      onClick={onOpen}
      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-lg active:scale-95 ${isRead ? 'bg-white border-slate-50 opacity-60' : 'bg-white border-indigo-100 shadow-md'}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">
            {sender?.englishName.charAt(0) || '?'}
          </div>
          <span className="text-[9px] font-black uppercase text-slate-400 truncate">{sender?.englishName || 'Staff'}</span>
        </div>
        {!isRead && (isTagged ? <Flag className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> : <div className="w-2 h-2 bg-indigo-500 rounded-full" />)}
      </div>
      <p className="text-[11px] font-bold text-slate-800 line-clamp-3 leading-tight mb-3">{notice.content}</p>
      {totalTagged > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-400">
            <span>Progress</span>
            <span>{acknowledgedCount}/{totalTagged}</span>
          </div>
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
};

const NoticeDetailModal: React.FC<{
  notice: Notice;
  onClose: () => void;
  isRead: boolean;
  readStatus: ReadStatus;
  onMarkRead: () => void;
}> = ({ notice, onClose, isRead, readStatus, onMarkRead }) => {
  const sender = ALL_USERS.find(u => u.id === notice.senderId);
  const taggedUserIds = notice.taggedUserIds || [];
  const taggedUsers = ALL_USERS.filter(u => taggedUserIds.includes(u.id));
  const acknowledgedCount = taggedUsers.filter(u => readStatus[`${u.id}_${notice.id}`]).length;
  const totalTagged = taggedUsers.length;
  const [showConfirmations, setShowConfirmations] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-indigo-100">
               {sender?.englishName.charAt(0) || '?'}
             </div>
             <div>
               <h3 className="text-lg font-black uppercase tracking-tight leading-none text-slate-900">{sender?.englishName || 'Staff'}</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{sender?.post || 'Staff'}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-900 transition-all hover:bg-slate-100 rounded-full"><X /></button>
        </div>
        
        <div className="flex-1 p-8 space-y-8 overflow-y-auto scrollbar-hide text-slate-800">
          <p className="text-lg font-medium leading-relaxed whitespace-pre-wrap">{notice.content}</p>
          
          {/* ATTACHMENTS FIRST */}
          {notice.attachments && notice.attachments.length > 0 && (
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Attachments & Previews</h5>
              <div className="flex flex-col gap-4">
                {notice.attachments.map((f, i) => <AttachmentPreview key={i} file={f} />)}
              </div>
            </div>
          )}

          {/* STAFF CONFIRMATION DROPDOWN */}
          {totalTagged > 0 && (
            <div className="space-y-4">
              <button 
                onClick={() => setShowConfirmations(!showConfirmations)}
                className={`w-full flex justify-between items-center p-6 rounded-3xl border transition-all ${showConfirmations ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
              >
                 <div className="flex items-center gap-3">
                   <Users className={`w-4 h-4 ${showConfirmations ? 'text-indigo-600' : 'text-slate-400'}`} />
                   <h5 className={`text-[10px] font-black uppercase tracking-widest ${showConfirmations ? 'text-indigo-700' : 'text-slate-500'}`}>Staff Confirmation</h5>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className={`text-[10px] font-black px-3 py-1 rounded-full shadow-sm ${showConfirmations ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'}`}>
                     {acknowledgedCount} / {totalTagged} READ
                   </span>
                   {showConfirmations ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                 </div>
              </button>

              {showConfirmations && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 animate-in slide-in-from-top-2 duration-300 bg-slate-50/50 p-4 rounded-[32px] border border-slate-100">
                   {taggedUsers.map(u => {
                     const confirmed = readStatus[`${u.id}_${notice.id}`];
                     return (
                       <div key={u.id} className={`px-4 py-3 rounded-2xl border flex items-center gap-3 transition-all ${confirmed ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-white border-slate-200 text-slate-400 opacity-60'}`}>
                         {confirmed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                         <span className="text-[10px] font-bold uppercase truncate">{u.englishName}</span>
                       </div>
                     );
                   })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-100">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            {format(notice.createdAt || Date.now(), 'MMMM d, yyyy · HH:mm')}
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <button onClick={onClose} className="flex-1 sm:flex-none px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Close</button>
            {!isRead && (
              <button 
                onClick={() => { onMarkRead(); onClose(); }} 
                className="flex-1 sm:flex-none px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all"
              >
                Confirm Receipt
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const NoticeForm: React.FC<{ 
  onClose: () => void; 
  onSubmit: (content: string, category: RoleCategory, tagged: string[], date: string, attachments: Attachment[]) => void;
  currentUser: User;
}> = ({ onClose, onSubmit, currentUser }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<RoleCategory>(RoleCategory.STAFF);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tagged, setTagged] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTag = (userId: string) => {
    setTagged(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const toggleAll = () => {
    if (tagged.length === ALL_USERS.length) {
      setTagged([]);
    } else {
      setTagged(ALL_USERS.map(u => u.id));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsReadingFiles(true);
    const promises = Array.from(files).map((file: File) => {
      return new Promise<Attachment>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          resolve({ 
            name: file.name, 
            type: file.type, 
            data: ev.target?.result as string 
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(newAttachments => {
      setAttachments(prev => [...prev, ...newAttachments]);
      setIsReadingFiles(false);
    });
  };

  const filteredStaff = ALL_USERS.filter(u => u.englishName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">New Notice</h3>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-900 transition-all hover:bg-slate-100 rounded-full"><X /></button>
        </div>
        <div className="p-8 space-y-8 overflow-y-auto scrollbar-hide">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Notice Content</label>
            <textarea 
              className="w-full p-6 bg-slate-50 rounded-3xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all font-bold text-slate-700 placeholder-slate-300 h-32 outline-none resize-none" 
              placeholder="What's the update today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Visibility Level</label>
               <select 
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm outline-none cursor-pointer text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all" 
                  value={category} 
                  onChange={e => setCategory(e.target.value as RoleCategory)}
               >
                 {Object.values(RoleCategory).map(c => <option key={c} value={c}>{c}</option>)}
               </select>
             </div>
             <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Post Date</label>
               <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm outline-none text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all" value={date} onChange={e => setDate(e.target.value)} />
             </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tag Staff to Notify</label>
              <div className="flex items-center gap-4">
                <button 
                  type="button" 
                  onClick={toggleAll}
                  className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all flex items-center gap-2 ${tagged.length === ALL_USERS.length ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  <Users className="w-3 h-3" />
                  {tagged.length === ALL_USERS.length ? 'Untag All' : 'Tag All Members'}
                </button>
                <span className={`text-[9px] font-black px-3 py-1.5 rounded-full ${tagged.length === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
                  {tagged.length === 0 ? 'All Members (Default)' : `${tagged.length} Selected`}
                </span>
              </div>
            </div>
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                placeholder="Search staff members..." 
                className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-none font-bold text-sm outline-none text-slate-700 focus:ring-2 focus:ring-indigo-100 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-[32px] p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50/30">
              {filteredStaff.map(u => {
                const isSelected = tagged.includes(u.id);
                return (
                  <button 
                    key={u.id} 
                    type="button"
                    onClick={() => toggleTag(u.id)} 
                    className={`p-3 rounded-xl text-[10px] font-black uppercase tracking-tight text-left transition-all flex items-center justify-between border-2 ${isSelected ? 'bg-white border-indigo-600 text-indigo-700 shadow-md' : 'bg-white border-transparent text-slate-500 hover:border-slate-200 shadow-sm'}`}
                  >
                    <span className="truncate">{u.englishName}</span>
                    {isSelected && <Check className="w-3 h-3 shrink-0 ml-2 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Attachments</label>
               <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 hover:underline"><Paperclip className="w-4 h-4" /> Add Files</button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
            <div className="flex flex-wrap gap-2">
              {attachments.map((a, i) => (
                <div key={i} className="flex items-center gap-2 pl-3 pr-2 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[9px] font-black text-indigo-700 shadow-sm animate-in fade-in zoom-in duration-200">
                  <span className="truncate max-w-[120px]">{a.name}</span>
                  <button type="button" onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="p-1 hover:text-rose-500 transition-colors"><X className="w-3 h-3" /></button>
                </div>
              ))}
              {isReadingFiles && <div className="p-2 text-[9px] font-bold text-slate-400 animate-pulse uppercase tracking-widest">Reading files...</div>}
            </div>
          </div>
        </div>
        <div className="p-8 bg-slate-50 flex justify-end gap-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Discard</button>
          <button 
            type="button"
            onClick={() => onSubmit(content, category, tagged, date, attachments)} 
            disabled={!content.trim() || isReadingFiles}
            className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            {isReadingFiles ? 'Processing...' : 'Post Notice'}
          </button>
        </div>
      </div>
    </div>
  );
};
