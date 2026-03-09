'use client';
import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';

/* ─── Config ─────────────────────────────────────────────────────────────── */
const ALL_SUB_ROLES = [
    { id: 'vice-principal',    label: 'Vice Principal',    icon: '🏛️' },
    { id: 'head-teacher',      label: 'Head Teacher',      icon: '📚' },
    { id: 'subject-teacher',   label: 'Subject Teacher',   icon: '🧪' },
    { id: 'class-teacher',     label: 'Class Teacher',     icon: '🏫' },
    { id: 'exam-coordinator',  label: 'Exam Coordinator',  icon: '📝' },
    { id: 'accountant',        label: 'Accountant',        icon: '💰' },
    { id: 'librarian',         label: 'Librarian',         icon: '📖' },
];
const ROLE_COLORS = {
    'vice-principal':   'bg-purple-100 text-purple-700',
    'head-teacher':     'bg-blue-100 text-blue-700',
    'subject-teacher':  'bg-indigo-100 text-indigo-700',
    'class-teacher':    'bg-teal-100 text-teal-700',
    'exam-coordinator': 'bg-rose-100 text-rose-700',
    'accountant':       'bg-amber-100 text-amber-700',
    'librarian':        'bg-emerald-100 text-emerald-700',
};
const inputCls = "w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition placeholder-gray-400";
const labelCls = "text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block";

/* ─── Modal helper ────────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children }) {
    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Blurred backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            {/* Panel */}
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between z-10">
                    <h2 className="font-black text-gray-900 text-lg">{title}</h2>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors text-sm">
                        ✕
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}

/* ─── Multi-role checkbox picker ─────────────────────────────────────────── */
function RolePicker({ selected = [], onChange, excludeVP = false }) {
    const roles = excludeVP ? ALL_SUB_ROLES.filter(r => r.id !== 'vice-principal') : ALL_SUB_ROLES;
    const toggle = (id) => {
        const next = selected.includes(id) ? selected.filter(r => r !== id) : [...selected, id];
        onChange(next);
    };
    return (
        <div className="flex flex-wrap gap-2">
            {roles.map(({ id, label, icon }) => {
                const active = selected.includes(id);
                return (
                    <button key={id} type="button" onClick={() => toggle(id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border-2 transition-all
                            ${active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-400'}`}>
                        {icon} {label}
                    </button>
                );
            })}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════ */
function DashboardContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'students';
    const [msg, setMsg] = useState(null);
    const isVP = user?.subRoles?.includes('vice-principal') && user?.role !== 'principal';

    /* ── Students ── */
    const [students, setStudents]       = useState([]);
    const [loadingStudents, setLS]      = useState(true);
    const [searchName, setSearchName]   = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [selectedStudent, setSel]     = useState(null);
    const [borrowedBooks, setBorrows]   = useState([]);
    const [loadingBooks, setLB]         = useState(false);
    const [panelOpen, setPanelOpen]     = useState(false);

    /* ── Staff ── */
    const [staff, setStaff]           = useState([]);
    const [loadingStaff, setLSt]      = useState(false);
    const [editingStaff, setES]       = useState(null);   // staff member being edited
    const [editRoles, setEditRoles]   = useState([]);
    const [editDept, setEditDept]     = useState('');
    const [editTutor, setEditTutor]   = useState('');
    const [showRegister, setShowReg]  = useState(false);
    const [regForm, setReg]           = useState({ name:'', email:'', password:'', subRoles:[], department:'', classTutorOf:'' });

    /* ── School Board (notices) ── */
    const [notices, setNotices]           = useState([]);
    const [loadingNotices, setLN]         = useState(false);
    const [noticeFilter, setNF]           = useState('');
    const [showNoticeModal, setShowNM]    = useState(false);
    const [editingNotice, setEN]          = useState(null);
    const [noticeForm, setNForm]          = useState({ title:'', body:'', category:'notice', date:'', eventDate:'', isPinned:false });

    /* ── Uploads (admin view) ── */
    const [allVideos, setAllVideos]       = useState([]);
    const [allBooks,  setAllBooks]        = useState([]);
    const [loadingUploads, setLU]         = useState(false);
    const [uploadsTypeFilter, setUTF]     = useState('all'); // 'all' | 'video' | 'ebook'
    const [uploadsStatusFilter, setUSF]   = useState('all'); // 'all' | 'published' | 'draft'

    const showMsg = (text, ok=true) => { setMsg({text,ok}); setTimeout(()=>setMsg(null),3500); };

    useEffect(() => {
        if (!user) return;
        if (activeTab==='students') fetchStudents();
        if (activeTab==='staff')    fetchStaff();
        if (activeTab==='school')   fetchNotices();
        if (activeTab==='uploads')  fetchAllUploads();
    }, [user, activeTab, searchName, filterClass]);

    useEffect(() => { if (activeTab==='school') fetchNotices(); }, [noticeFilter]);

    /* ─── Fetchers ─────────────────────────────────────────────────────── */
    const fetchStudents = async () => {
        setLS(true);
        try {
            let url='/api/students?';
            if(searchName)  url+=`search=${encodeURIComponent(searchName)}&`;
            if(filterClass) url+=`classGrade=${filterClass}&`;
            const res = await api.get(url);
            setStudents(res.data);
        } catch(e){} finally{ setLS(false); }
    };

    const openStudent = async (s) => {
        setSel(s); setPanelOpen(true); setLB(true);
        try { const r=await api.get(`/api/students/${s._id}/books`); setBorrows(r.data); }
        catch(e){} finally{ setLB(false); }
    };

    const fetchStaff = async () => {
        setLSt(true);
        try { const r=await api.get('/api/staff'); setStaff(r.data); }
        catch(e){} finally{ setLSt(false); }
    };

    const openEditStaff = (member) => {
        setES(member);
        setEditRoles(member.subRoles||[]);
        setEditDept(member.department||'');
        setEditTutor(member.classTutorOf||'');
    };

    const saveStaffRoles = async () => {
        try {
            await api.put(`/api/staff/${editingStaff._id}/role`, { subRoles:editRoles, department:editDept, classTutorOf:editTutor });
            showMsg('Roles saved!');
            setES(null);
            fetchStaff();
        } catch(e){ showMsg(e.response?.data?.message||'Error',false); }
    };

    const registerStaff = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/staff/register', regForm);
            showMsg('Teacher registered!');
            setReg({name:'',email:'',password:'',subRoles:[],department:'',classTutorOf:''});
            setShowReg(false);
            fetchStaff();
        } catch(e){ showMsg(e.response?.data?.message||'Error',false); }
    };

    const deactivate = async (id) => {
        if(!confirm('Deactivate this staff member?')) return;
        try { await api.delete(`/api/staff/${id}`); showMsg('Deactivated.'); fetchStaff(); }
        catch(e){ showMsg(e.response?.data?.message||'Error',false); }
    };

    const fetchAllUploads = async () => {
        setLU(true);
        try {
            const [vr, br] = await Promise.all([
                api.get('/api/videos/admin'),
                api.get('/api/library/admin'),
            ]);
            setAllVideos(vr.data);
            setAllBooks(br.data);
        } catch(e){} finally{ setLU(false); }
    };

    const toggleUploadStatus = async (item) => {
        try {
            const endpoint = item._type === 'video' ? `/api/videos/${item._id}/status` : `/api/library/${item._id}/status`;
            await api.patch(endpoint);
            showMsg('Status updated.');
            fetchAllUploads();
        } catch(e) { showMsg('Failed to update status', false); }
    };

    const makeBookPublic = async (item) => {
        if (item._type !== 'ebook') return;
        if (!confirm('Make this book available to ALL classes?')) return;
        try {
            await api.put(`/api/library/${item._id}`, { classGrade: null });
            showMsg('Book is now public.');
            fetchAllUploads();
        } catch(e) { showMsg('Failed to update book', false); }
    };

    const deleteUpload = async (item) => {
        if (!confirm(`Delete "${item.title}" permanently? This cannot be undone.`)) return;
        try {
            const endpoint = item._type === 'video' ? `/api/videos/${item._id}` : `/api/library/${item._id}`;
            await api.delete(endpoint);
            showMsg('Deleted successfully.');
            fetchAllUploads();
        } catch(e) { showMsg(e.response?.data?.message || 'Delete failed', false); }
    };

    const fetchNotices = async () => {
        setLN(true);
        try {
            const url = noticeFilter ? `/api/notices?category=${noticeFilter}` : '/api/notices';
            const r = await api.get(url);
            setNotices(r.data);
        } catch(e){} finally{ setLN(false); }
    };

    const openNewNotice = () => {
        setEN(null);
        setNForm({title:'',body:'',category:'notice',date:'',eventDate:'',isPinned:false});
        setShowNM(true);
    };
    const openEditNotice = (n) => {
        setEN(n);
        setNForm({title:n.title,body:n.body,category:n.category,date:n.date,eventDate:n.eventDate?n.eventDate.substring(0,10):'',isPinned:n.isPinned});
        setShowNM(true);
    };

    const submitNotice = async (e) => {
        e.preventDefault();
        try {
            const payload={...noticeForm};
            if(!payload.date) payload.date=new Date().toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'});
            if(!payload.eventDate) delete payload.eventDate;
            if(editingNotice) await api.put(`/api/notices/${editingNotice._id}`, payload);
            else              await api.post('/api/notices', payload);
            showMsg(editingNotice?'Updated!':'Published to school website!');
            setShowNM(false);
            fetchNotices();
        } catch(e){ showMsg(e.response?.data?.message||'Error',false); }
    };

    const deleteNotice = async (id) => {
        if(!confirm('Delete this post?')) return;
        try { await api.delete(`/api/notices/${id}`); showMsg('Deleted.'); fetchNotices(); }
        catch(e){ showMsg(e.response?.data?.message||'Error',false); }
    };

    /* ── Uploads merged & filtered ── */
    const allUploads = [
        ...allVideos.map(v => ({ ...v, _type: 'video' })),
        ...allBooks.map(b  => ({ ...b,  _type: 'ebook' })),
    ].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    const filteredUploads = allUploads
        .filter(u => uploadsTypeFilter === 'all' || u._type === uploadsTypeFilter)
        .filter(u => uploadsStatusFilter === 'all' || u.status === uploadsStatusFilter);

    /* ─── Nav items ─────────────────────────────────────────────────────── */
    const NAV = [
        { id:'students', label:'Students',    icon:'👥', count: students.length },
        { id:'staff',    label:'Staff',       icon:'🏫', count: staff.length },
        { id:'school',   label:'School Board',icon:'📋', count: notices.length },
        { id:'uploads',  label:'Uploads',     icon:'📤', count: allUploads.length },
    ];

    const classColors = { 8:'bg-blue-50 text-blue-700', 9:'bg-violet-50 text-violet-700', 10:'bg-rose-50 text-rose-700' };

    return (
        <div className="max-w-7xl mx-auto pb-20">

            {/* Toast */}
            {msg && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold text-white ${msg.ok?'bg-emerald-500':'bg-red-500'} transition-all`}>
                    {msg.text}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        {isVP ? 'Vice-Principal Dashboard' : 'Principal Dashboard'}
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm">Full school management &amp; administration.</p>
                </div>
                <span className="self-start sm:self-auto bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-full">
                    {isVP ? '🎓 Vice-Principal' : '👑 Principal'}
                </span>
            </div>

            {/* Body: Content */}
            <div className="flex gap-6 items-start">

                {/* ── Main Content ── */}
                <div className="flex-1 min-w-0 space-y-5">

                    {/* ══ STUDENTS ══ */}
                    {activeTab==='students' && (
                        <>
                            {/* Filters */}
                            <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
                                    <input type="text" placeholder="Search by student name..."
                                        value={searchName} onChange={e=>setSearchName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 text-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white text-gray-800 placeholder-gray-400 transition" />
                                </div>
                                <select value={filterClass} onChange={e=>setFilterClass(e.target.value)}
                                    className="sm:w-44 px-4 py-3 bg-gray-50 border border-gray-200 text-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 font-semibold cursor-pointer transition">
                                    <option value="">All Classes</option>
                                    <option value="8">Class 8</option>
                                    <option value="9">Class 9</option>
                                    <option value="10">Class 10</option>
                                </select>
                            </div>

                            <div className="flex gap-5 items-start">
                                <div className="flex-1 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                                    <div className="grid grid-cols-12 px-5 py-3.5 bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <div className="col-span-5">Student</div>
                                        <div className="col-span-3 hidden sm:block text-center">Class</div>
                                        <div className="col-span-2 hidden md:block text-center">Joined</div>
                                        <div className="col-span-7 sm:col-span-4 md:col-span-2 text-right">Action</div>
                                    </div>
                                    {loadingStudents ? (
                                        <div className="p-6 space-y-3">{[1,2,3,4].map(i=><div key={i} className="h-14 bg-gray-50 rounded-2xl animate-pulse"/>)}</div>
                                    ) : students.length===0 ? (
                                        <div className="py-16 text-center text-gray-400"><p className="text-4xl mb-3">🔍</p><p className="text-sm">No students found.</p></div>
                                    ) : (
                                        <div className="divide-y divide-gray-50">
                                            {students.map(s=>(
                                                <div key={s._id} onClick={()=>openStudent(s)}
                                                    className={`grid grid-cols-12 px-5 py-4 items-center cursor-pointer transition-colors group
                                                        ${selectedStudent?._id===s._id?'bg-blue-50':'hover:bg-gray-50'}`}>
                                                    <div className="col-span-8 sm:col-span-5 flex items-center gap-3 min-w-0">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-800 font-black text-sm flex items-center justify-center shrink-0 border-2 border-white shadow-sm">{s.name.charAt(0)}</div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-gray-800 text-sm truncate">{s.name}</p>
                                                            <p className="text-[11px] text-gray-400 truncate hidden sm:block">{s.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-3 hidden sm:flex justify-center">
                                                        <span className={`text-xs font-black px-3 py-1 rounded-full ${classColors[s.classGrade]||'bg-gray-100 text-gray-600'}`}>{s.classGrade}-{s.section||'A'}</span>
                                                    </div>
                                                    <div className="col-span-2 hidden md:block text-center">
                                                        <span className="text-sm font-semibold text-gray-500">{s.yearJoined||'—'}</span>
                                                    </div>
                                                    <div className="col-span-4 sm:col-span-2 text-right">
                                                        <button className={`text-[11px] font-bold px-3 py-2 rounded-xl transition-colors ${selectedStudent?._id===s._id?'bg-blue-600 text-white':'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700'}`}>
                                                            {selectedStudent?._id===s._id?'✓ Open':'View'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Desktop student detail */}
                                {selectedStudent && (
                                    <div className="hidden lg:flex flex-col gap-4 w-64 shrink-0">
                                        <div className="bg-gray-900 rounded-3xl p-6 text-white relative overflow-hidden">
                                            <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/5 rounded-full blur-2xl"/>
                                            <button onClick={()=>setSel(null)} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white/60">✕</button>
                                            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-xl font-black mb-4">{selectedStudent.name.charAt(0)}</div>
                                            <h2 className="font-black text-lg leading-tight">{selectedStudent.name}</h2>
                                            <p className="text-white/50 text-xs mt-1">{selectedStudent.email}</p>
                                            <div className="grid grid-cols-2 gap-2 mt-4">
                                                {[['Class',`${selectedStudent.classGrade}–${selectedStudent.section||'A'}`],['Joined',selectedStudent.yearJoined||'—']].map(([k,v])=>(
                                                    <div key={k} className="bg-white/10 rounded-2xl p-3">
                                                        <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">{k}</p>
                                                        <p className="font-black text-sm">{v}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
                                            <h3 className="font-black text-gray-800 text-sm mb-3">📚 Library Holds</h3>
                                            {loadingBooks ? <div className="h-12 bg-gray-100 rounded-2xl animate-pulse"/> :
                                            borrowedBooks.length===0 ? <p className="text-xs text-gray-400 text-center py-5">No active borrows.</p> :
                                            borrowedBooks.map(b=>(
                                                <div key={b._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl mb-2">
                                                    <div className="w-8 h-10 rounded-lg bg-gray-800 text-white/40 text-[9px] font-bold flex items-center justify-center shrink-0">{b.category?.substring(0,3).toUpperCase()}</div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-800 line-clamp-1">{b.title}</p>
                                                        <p className="text-[10px] text-red-400 font-semibold">Due: {b.dueDate?new Date(b.dueDate).toLocaleDateString():'—'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* ══ STAFF ══ */}
                    {activeTab==='staff' && (
                        <>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-violet-500 rounded-full"/>
                                    <h2 className="text-lg font-black text-gray-800">All Staff</h2>
                                    <span className="bg-violet-50 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-full">{staff.length}</span>
                                </div>
                                <button onClick={()=>setShowReg(v=>!v)}
                                    className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-bold px-5 py-2.5 rounded-2xl transition-colors shadow-sm">
                                    {showRegister?'✕ Cancel':'+ Add Teacher'}
                                </button>
                            </div>

                            {/* Register modal */}
                            <Modal open={showRegister} onClose={()=>setShowReg(false)} title="Register New Teacher">
                                <form onSubmit={registerStaff} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div><label className={labelCls}>Full Name</label>
                                            <input required type="text" placeholder="e.g., Sunita Sharma" value={regForm.name} onChange={e=>setReg({...regForm,name:e.target.value})} className={inputCls}/></div>
                                        <div><label className={labelCls}>Email</label>
                                            <input required type="email" placeholder="teacher@school.edu.np" value={regForm.email} onChange={e=>setReg({...regForm,email:e.target.value})} className={inputCls}/></div>
                                        <div><label className={labelCls}>Password</label>
                                            <input required type="password" placeholder="Min 6 characters" value={regForm.password} onChange={e=>setReg({...regForm,password:e.target.value})} className={inputCls}/></div>
                                        <div><label className={labelCls}>Department</label>
                                            <input type="text" placeholder="e.g., Science" value={regForm.department} onChange={e=>setReg({...regForm,department:e.target.value})} className={inputCls}/></div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Assign Roles (select multiple)</label>
                                        <RolePicker selected={regForm.subRoles} onChange={v=>setReg({...regForm,subRoles:v})} excludeVP={isVP}/>
                                    </div>
                                    {regForm.subRoles.includes('class-teacher') && (
                                        <div><label className={labelCls}>Class Tutor Of (e.g., 8-A)</label>
                                            <input type="text" placeholder="e.g., 8-A, 9-B" value={regForm.classTutorOf} onChange={e=>setReg({...regForm,classTutorOf:e.target.value})} className={inputCls}/></div>
                                    )}
                                    <button type="submit" className="w-full bg-gray-900 hover:bg-gray-700 text-white font-bold text-sm py-3.5 rounded-2xl transition-colors shadow-sm mt-2">
                                        Register Teacher
                                    </button>
                                </form>
                            </Modal>

                            {/* Edit roles modal */}
                            <Modal open={!!editingStaff} onClose={()=>setES(null)} title={`Edit Roles — ${editingStaff?.name}`}>
                                {editingStaff && (
                                    <div className="space-y-4">
                                        <div><label className={labelCls}>Department</label>
                                            <input type="text" value={editDept} onChange={e=>setEditDept(e.target.value)} placeholder="e.g., Science" className={inputCls}/></div>
                                        <div>
                                            <label className={labelCls}>Assign Roles (select multiple)</label>
                                            <RolePicker selected={editRoles} onChange={setEditRoles} excludeVP={isVP}/>
                                        </div>
                                        {editRoles.includes('class-teacher') && (
                                            <div><label className={labelCls}>Class Tutor Of</label>
                                                <input type="text" placeholder="e.g., 8-A" value={editTutor} onChange={e=>setEditTutor(e.target.value)} className={inputCls}/></div>
                                        )}
                                        <div className="flex gap-3 pt-2">
                                            <button onClick={saveStaffRoles} className="flex-1 bg-gray-900 hover:bg-gray-700 text-white font-bold text-sm py-3.5 rounded-2xl transition-colors">Save Changes</button>
                                            <button onClick={()=>setES(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm py-3.5 rounded-2xl transition-colors">Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </Modal>

                            {/* Staff table */}
                            {loadingStaff ? (
                                <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-20 bg-gray-100 rounded-3xl animate-pulse"/>)}</div>
                            ) : staff.length===0 ? (
                                <div className="bg-white border border-dashed border-gray-200 rounded-3xl py-12 text-center text-gray-400">
                                    <p className="text-3xl mb-2">👥</p><p className="text-sm">No staff yet. Add your first teacher.</p>
                                </div>
                            ) : (
                                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                                    <div className="divide-y divide-gray-50">
                                        {staff.map(m=>(
                                            <div key={m._id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 border-2 border-white shadow-sm ${m.role==='principal'?'bg-amber-100 text-amber-800':'bg-violet-100 text-violet-800'}`}>
                                                    {m.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-bold text-gray-800 text-sm">{m.name}</p>
                                                        {m.role==='principal' && <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">👑 Principal</span>}
                                                    </div>
                                                    <p className="text-[11px] text-gray-400">{m.email}</p>
                                                    {m.department && <p className="text-[11px] text-gray-500 font-medium mt-0.5">Dept: {m.department}</p>}
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {(m.subRoles||[]).length===0 && <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">No roles assigned</span>}
                                                        {(m.subRoles||[]).map(r=>(
                                                            <span key={r} className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${ROLE_COLORS[r]||'bg-gray-100 text-gray-500'}`}>
                                                                {ALL_SUB_ROLES.find(x=>x.id===r)?.label||r}
                                                                {r==='class-teacher'&&m.classTutorOf&&` (${m.classTutorOf})`}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    {m.role!=='principal' && (
                                                        <button onClick={()=>openEditStaff(m)}
                                                            className="text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl transition-colors">
                                                            Edit
                                                        </button>
                                                    )}
                                                    {m.role!=='principal' && !isVP && (
                                                        <button onClick={()=>deactivate(m._id)}
                                                            className="text-[11px] font-bold bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-xl transition-colors">
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ══ SCHOOL BOARD ══ */}
                    {activeTab==='school' && (
                        <>
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">School Board</h2>
                                    <p className="text-sm text-gray-400 mt-1">Published posts appear live on the school website 🌐</p>
                                </div>
                                <button onClick={openNewNotice}
                                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-bold px-6 py-3 rounded-2xl transition-all shadow-md hover:shadow-lg shrink-0 active:scale-95">
                                    <span className="text-base">✏️</span> New Post
                                </button>
                            </div>

                            {/* New / Edit Notice Modal — Redesigned */}
                            <Modal open={showNoticeModal} onClose={()=>setShowNM(false)} title="">
                                <form onSubmit={submitNotice}>
                                    {/* Modal gradient banner */}
                                    <div className={`-mx-6 -mt-5 mb-6 px-6 py-5 rounded-t-2xl ${
                                        noticeForm.category==='notice' ? 'bg-gradient-to-r from-blue-600 to-indigo-700' :
                                        noticeForm.category==='news'   ? 'bg-gradient-to-r from-emerald-600 to-teal-700' :
                                                                          'bg-gradient-to-r from-amber-500 to-orange-600'
                                    } text-white`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                                                {noticeForm.category==='notice'?'📢':noticeForm.category==='news'?'📰':'🗓️'}
                                            </div>
                                            <div>
                                                <h2 className="font-black text-xl">{editingNotice?'Edit Post':'Create New Post'}</h2>
                                                <p className="text-white/70 text-xs mt-0.5">Publishes directly to the school landing page</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Category + Date row */}
                                        <div className="grid grid-cols-3 gap-3">
                                            {[['notice','📢 Notice'],['news','📰 News'],['event','🗓️ Event']].map(([v,l])=>(
                                                <button key={v} type="button"
                                                    onClick={()=>setNForm({...noticeForm,category:v})}
                                                    className={`py-3 px-2 rounded-2xl text-xs font-bold border-2 transition-all text-center
                                                        ${noticeForm.category===v
                                                            ? v==='notice'?'border-blue-500 bg-blue-50 text-blue-700'
                                                              : v==='news'?'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                              : 'border-amber-500 bg-amber-50 text-amber-700'
                                                            : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}>
                                                    {l}
                                                </button>
                                            ))}
                                        </div>

                                        <div>
                                            <label className={labelCls}>Post Title *</label>
                                            <input required type="text" placeholder="e.g., Annual Sports Day 2025"
                                                value={noticeForm.title} onChange={e=>setNForm({...noticeForm,title:e.target.value})}
                                                className={inputCls}/>
                                        </div>

                                        <div>
                                            <label className={labelCls}>Content *</label>
                                            <textarea required rows={6}
                                                placeholder="Write the full content of your notice, news article, or event announcement here..."
                                                value={noticeForm.body} onChange={e=>setNForm({...noticeForm,body:e.target.value})}
                                                className={inputCls+' resize-none leading-relaxed'}/>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className={labelCls}>Display Date</label>
                                                <input type="text" placeholder="Auto if blank"
                                                    value={noticeForm.date} onChange={e=>setNForm({...noticeForm,date:e.target.value})}
                                                    className={inputCls}/>
                                            </div>
                                            {noticeForm.category==='event' && (
                                                <div>
                                                    <label className={labelCls}>Event Date</label>
                                                    <input type="date" value={noticeForm.eventDate}
                                                        onChange={e=>setNForm({...noticeForm,eventDate:e.target.value})} className={inputCls}/>
                                                </div>
                                            )}
                                        </div>

                                        <label className="flex items-center gap-4 cursor-pointer bg-amber-50 border-2 border-amber-200 hover:border-amber-300 rounded-2xl p-4 transition-colors">
                                            <input type="checkbox" checked={noticeForm.isPinned}
                                                onChange={e=>setNForm({...noticeForm,isPinned:e.target.checked})}
                                                className="w-5 h-5 accent-amber-500 cursor-pointer"/>
                                            <div>
                                                <p className="text-sm font-bold text-amber-900">📌 Pin this post to the top</p>
                                                <p className="text-xs text-amber-700/60 mt-0.5">Pinned posts are always shown first on the website.</p>
                                            </div>
                                        </label>

                                        <button type="submit"
                                            className={`w-full text-white font-black text-sm py-4 rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2
                                                ${noticeForm.category==='notice' ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                                                : noticeForm.category==='news'   ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800'
                                                :                                   'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'}`}>
                                            {editingNotice ? '💾 Save Changes' : '🚀 Publish to School Website'}
                                        </button>
                                    </div>
                                </form>
                            </Modal>

                            {/* Filter pills */}
                            <div className="flex gap-2 flex-wrap">
                                {[['','🗂️ All'],['notice','📢 Notices'],['news','📰 News'],['event','🗓️ Events']].map(([v,l])=>(
                                    <button key={v} onClick={()=>setNF(v)}
                                        className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${noticeFilter===v?'bg-gray-900 text-white shadow-sm':'bg-white border border-gray-100 text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                                        {l}
                                    </button>
                                ))}
                                <span className="ml-auto text-xs text-gray-300 self-center">{notices.length} post{notices.length!==1?'s':''}</span>
                            </div>

                            {/* Notices Wall — Rich Cards */}
                            {loadingNotices ? (
                                <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-36 bg-gray-100 rounded-3xl animate-pulse"/>)}</div>
                            ) : notices.length===0 ? (
                                <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl py-16 text-center">
                                    <div className="text-5xl mb-3">📭</div>
                                    <p className="font-bold text-gray-500 text-sm">No posts yet.</p>
                                    <p className="text-gray-400 text-xs mt-1">Click "New Post" to publish your first announcement.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {notices.map(n=>{
                                        const cfg={
                                            notice:{ bar:'bg-blue-600',   badge:'bg-blue-100 text-blue-700',   lborder:'border-l-blue-500',   icon:'📢' },
                                            news:  { bar:'bg-emerald-600', badge:'bg-emerald-100 text-emerald-700', lborder:'border-l-emerald-500', icon:'📰' },
                                            event: { bar:'bg-amber-500',   badge:'bg-amber-100 text-amber-700',   lborder:'border-l-amber-400',   icon:'🗓️' },
                                        }[n.category] || { bar:'bg-gray-600', badge:'bg-gray-100 text-gray-700', lborder:'border-l-gray-400', icon:'📋' };
                                        return (
                                            <div key={n._id} className={`bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex border-l-4 ${cfg.lborder} hover:shadow-md transition-shadow`}>
                                                {/* Color stripe */}
                                                <div className={`${cfg.bar} w-1 shrink-0 self-stretch`}/>
                                                <div className="flex-1 p-5 min-w-0">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                                <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${cfg.badge}`}>
                                                                    {cfg.icon} {n.category}
                                                                </span>
                                                                {n.isPinned && (
                                                                    <span className="inline-flex items-center text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                                                                        📌 Pinned
                                                                    </span>
                                                                )}
                                                                <span className="text-[11px] text-gray-400 font-medium">{n.date}</span>
                                                            </div>
                                                            <h3 className="font-black text-gray-900 text-base leading-snug">{n.title}</h3>
                                                            <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-3">{n.body}</p>
                                                            {n.postedBy && (
                                                                <p className="text-[11px] text-gray-300 font-medium mt-3">
                                                                    Posted by {n.postedBy.name || 'Admin'}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col gap-2 shrink-0 ml-2">
                                                            <button onClick={()=>openEditNotice(n)}
                                                                className="text-[11px] font-bold bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-700 px-4 py-2 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                                                                ✏️ Edit
                                                            </button>
                                                            <button onClick={()=>deleteNotice(n._id)}
                                                                className="text-[11px] font-bold bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 px-4 py-2 rounded-xl border border-gray-100 hover:border-red-200 transition-colors">
                                                                🗑️ Del
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                    {/* ══ UPLOADS ══ */}
                    {activeTab==='uploads' && (
                        <>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Teacher Uploads</h2>
                                    <p className="text-sm text-gray-400 mt-1">All videos and books uploaded by teachers — review drafts and published content.</p>
                                </div>
                                <button onClick={fetchAllUploads}
                                    className="self-start sm:self-auto flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                                    🔄 Refresh
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <div className="flex gap-2">
                                    {[['all','🗂️ All'],['video','🎥 Videos'],['ebook','📚 Books']].map(([v,l])=>(
                                        <button key={v} onClick={()=>setUTF(v)}
                                            className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${uploadsTypeFilter===v?'bg-gray-900 text-white shadow-sm':'bg-white border border-gray-100 text-gray-500 hover:border-gray-300'}`}>
                                            {l}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2 ml-auto">
                                    {[['all','All'],['published','✓ Published'],['draft','✏️ Draft']].map(([v,l])=>(
                                        <button key={v} onClick={()=>setUSF(v)}
                                            className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all ${uploadsStatusFilter===v?'bg-gray-900 text-white shadow-sm':'bg-white border border-gray-100 text-gray-500 hover:border-gray-300'}`}>
                                            {l}
                                        </button>
                                    ))}
                                </div>
                                <span className="text-xs text-gray-300 w-full sm:w-auto">{filteredUploads.length} item{filteredUploads.length!==1?'s':''}</span>
                            </div>

                            {/* Table */}
                            {loadingUploads ? (
                                <div className="space-y-3">{[1,2,3,4].map(i=><div key={i} className="h-20 bg-gray-100 rounded-3xl animate-pulse"/>)}</div>
                            ) : filteredUploads.length === 0 ? (
                                <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl py-16 text-center">
                                    <div className="text-5xl mb-3">📭</div>
                                    <p className="font-bold text-gray-500 text-sm">No uploads found.</p>
                                    <p className="text-gray-400 text-xs mt-1">Teachers haven't uploaded any resources yet.</p>
                                </div>
                            ) : (
                                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                                    <div className="grid grid-cols-12 px-5 py-3.5 bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <div className="col-span-1">Type</div>
                                        <div className="col-span-3">Title</div>
                                        <div className="col-span-3">Teacher</div>
                                        <div className="col-span-1 hidden sm:block">Class</div>
                                        <div className="col-span-2">Status</div>
                                        <div className="col-span-2 text-right">Actions</div>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {filteredUploads.map(item => (
                                            <div key={item._id} className="grid grid-cols-12 px-5 py-4 items-center hover:bg-gray-50 transition-colors">
                                                <div className="col-span-1">
                                                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-base ${item._type==='video'?'bg-violet-100':'bg-emerald-100'}`}>
                                                        {item._type === 'video' ? '🎥' : '📚'}
                                                    </span>
                                                </div>
                                                <div className="col-span-3 min-w-0 pr-3">
                                                    <p className="font-bold text-gray-800 text-sm truncate">{item.title}</p>
                                                    {item._type === 'ebook' && item.author && (
                                                        <p className="text-[11px] text-gray-400 truncate">by {item.author}</p>
                                                    )}
                                                </div>
                                                <div className="col-span-3 min-w-0 pr-3">
                                                    <p className="font-semibold text-gray-700 text-sm truncate">{item.uploadedBy?.name || '—'}</p>
                                                    <p className="text-[11px] text-gray-400 truncate hidden sm:block">{item.uploadedBy?.email || ''}</p>
                                                </div>
                                                <div className="col-span-1 hidden sm:block">
                                                    {item.classGrade
                                                        ? <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">Class {item.classGrade}</span>
                                                        : <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-50 px-2 py-1 rounded-full">All (Public)</span>
                                                    }
                                                </div>
                                                <div className="col-span-2">
                                                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full
                                                        ${item.status==='published'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>
                                                        {item.status==='published'?'✓ Live':'✏️ Draft'}
                                                    </span>
                                                    <p className="text-[10px] text-gray-300 mt-1">
                                                        {new Date(item.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}
                                                    </p>
                                                </div>
                                                <div className="col-span-2 flex flex-col gap-1 items-end">
                                                    <button onClick={() => toggleUploadStatus(item)}
                                                        className="text-[10px] font-bold px-3 py-1.5 rounded-xl border border-gray-200 transition-colors w-full text-center hover:bg-gray-100 text-gray-600">
                                                        {item.status === 'published' ? 'Set Offline (Draft)' : 'Set Live (Publish)'}
                                                    </button>
                                                    
                                                    {item._type === 'ebook' && item.classGrade !== null && (
                                                        <button onClick={() => makeBookPublic(item)}
                                                            className="text-[10px] font-bold px-3 py-1.5 rounded-xl border border-blue-200 transition-colors w-full text-center bg-blue-50 hover:bg-blue-100 text-blue-700">
                                                            🌍 Make Public
                                                        </button>
                                                    )}
                                                    
                                                    <button onClick={() => deleteUpload(item)}
                                                        className="text-[10px] font-bold px-3 py-1.5 rounded-xl border border-red-200 transition-colors w-full text-center bg-red-50 hover:bg-red-100 text-red-600">
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>



            {/* Mobile student bottom-sheet */}
            {panelOpen && selectedStudent && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
                    <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={()=>setPanelOpen(false)}/>
                    <div className="bg-white rounded-t-3xl p-6 max-h-[75vh] overflow-y-auto">
                        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4"/>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-900 text-white font-black text-base flex items-center justify-center">{selectedStudent.name.charAt(0)}</div>
                                <div><p className="font-black text-gray-900">{selectedStudent.name}</p><p className="text-xs text-gray-400">Class {selectedStudent.classGrade}-{selectedStudent.section||'A'}</p></div>
                            </div>
                            <button onClick={()=>setPanelOpen(false)} className="text-gray-400 text-xl w-8 h-8 flex items-center justify-center">✕</button>
                        </div>
                        <h4 className="font-black text-sm text-gray-700 mb-3">Library Holds</h4>
                        {loadingBooks ? <div className="h-12 bg-gray-100 rounded-2xl animate-pulse"/> : borrowedBooks.length===0 ?
                            <p className="text-xs text-gray-400 text-center py-6">No active borrows.</p> :
                            borrowedBooks.map(b=>(
                                <div key={b._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 mb-2">
                                    <div className="w-8 h-10 rounded-xl bg-gray-800 text-white/40 text-[9px] font-bold flex items-center justify-center shrink-0">{b.category?.substring(0,3).toUpperCase()}</div>
                                    <div><p className="text-xs font-bold text-gray-800 line-clamp-1">{b.title}</p><p className="text-[10px] text-red-400 font-semibold">Due: {b.dueDate?new Date(b.dueDate).toLocaleDateString():'—'}</p></div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PrincipalDashboard() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500 font-bold">Loading dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
