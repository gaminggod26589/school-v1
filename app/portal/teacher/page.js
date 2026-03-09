'use client';
import { useEffect, useState, useRef, Suspense, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';

/* ─── Small reusable label ── */
const Lbl = ({ children }) => (
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{children}</label>
);

/* ─── Input styles ── */
const iCls = "w-full bg-white border-2 border-gray-100 hover:border-gray-200 focus:border-blue-400 text-gray-800 text-sm rounded-2xl px-4 py-3 focus:outline-none transition placeholder-gray-300";

/* ─── Status badge ── */
const StatusBadge = ({ status }) => (
    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full
        ${status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
        {status === 'published' ? '✓ Published' : '✏️ Draft'}
    </span>
);

function DashboardContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'schedule';
    const [msg, setMsg] = useState(null);

    /* ── Schedule ── */
    const [schedule, setSchedule] = useState([]);
    const [loadingSchedule, setLs] = useState(true);

    /* ── Leave ── */
    const [leaves, setLeaves] = useState([]);
    const [leaveForm, setLF] = useState({ startDate: '', endDate: '', reason: '' });

    /* ── Upload: active source tab ── */
    const [uploadType, setUT] = useState('video');
    const [uploadMode, setUM] = useState('link');

    /* ── Video form ── */
    const [videoForm, setVF] = useState({ title: '', description: '', url: '', classGrade: '8' });
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVPreview] = useState('');
    const videoDrop = useRef();

    /* ── Ebook form ── */
    const [bookForm, setBF] = useState({ title: '', author: '', category: 'General', pdfUrl: '', classGrade: '', coverImage: '' });
    const [bookFile, setBookFile] = useState(null);
    const [bookCover, setBookCover] = useState(null); // The actual image file to upload
    const bookDrop = useRef();

    /* ── Upload progress ── */
    const [uploading, setUploading] = useState(false);

    /* ── My Uploads ── */
    const [myVideos, setMyVideos] = useState([]);
    const [myBooks, setMyBooks] = useState([]);
    const [loadingMine, setLoadingMine] = useState(false);
    const [mineFilter, setMineFilter] = useState('all');

    /* ── Edit state ── */
    const [editingItem, setEditingItem] = useState(null); // { item, type }
    const [editForm, setEF] = useState({});
    const [savingEdit, setSavingEdit] = useState(false);
    const [editCoverFile, setEditCoverFile] = useState(null);

    const showMsg = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 4000); };

    const fetchSchedule = async () => {
        setLs(true);
        try { const r = await api.get('/api/schedule'); setSchedule(r.data); }
        catch (e) {} finally { setLs(false); }
    };

    const fetchLeaves = async () => {
        try { const r = await api.get('/api/leave'); setLeaves(r.data); } catch (e) {}
    };

    const fetchMyUploads = useCallback(async () => {
        setLoadingMine(true);
        try {
            const [vr, br] = await Promise.all([
                api.get('/api/videos/mine'),
                api.get('/api/library/mine'),
            ]);
            setMyVideos(vr.data);
            setMyBooks(br.data);
        } catch (e) {} finally { setLoadingMine(false); }
    }, []);

    useEffect(() => {
        if (!user) return;
        if (activeTab === 'schedule') fetchSchedule();
        if (activeTab === 'leave') fetchLeaves();
        if (activeTab === 'my-uploads') fetchMyUploads();
    }, [user, activeTab]);

    /* ── Upload a file to /api/upload ── */
    const uploadFile = async (file) => {
        const form = new FormData();
        form.append('file', file);
        const token = localStorage.getItem('school_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: form,
        });
        if (!res.ok) throw new Error('Upload failed');
        return (await res.json()).url;
    };

    /* ── Submit Video ── */
    const handleVideoSubmit = async (e, saveAsDraft = false) => {
        e.preventDefault();
        setUploading(true);
        try {
            let finalUrl = videoForm.url;
            if (uploadMode === 'file' && videoFile) finalUrl = await uploadFile(videoFile);
            if (!finalUrl) { showMsg('Please provide a URL or upload a file.', false); return; }
            await api.post('/api/videos', {
                ...videoForm,
                url: finalUrl,
                classGrade: Number(videoForm.classGrade),
                status: saveAsDraft ? 'draft' : 'published',
            });
            showMsg(saveAsDraft ? 'Saved as draft!' : 'Video published to students!');
            setVF({ title: '', description: '', url: '', classGrade: '8' });
            setVideoFile(null); setVPreview('');
        } catch (e) { showMsg(e.message || 'Upload failed', false); }
        finally { setUploading(false); }
    };

    /* ── Submit Ebook ── */
    const handleBookSubmit = async (e, saveAsDraft = false) => {
        e.preventDefault();
        setUploading(true);
        try {
            let finalPdf = bookForm.pdfUrl;
            let finalCoverUrl = bookForm.coverImage;

            if (bookFile) finalPdf = await uploadFile(bookFile);
            if (bookCover) finalCoverUrl = await uploadFile(bookCover);

            await api.post('/api/library', {
                ...bookForm,
                pdfUrl: finalPdf,
                coverImage: finalCoverUrl,
                classGrade: bookForm.classGrade || null,
                status: saveAsDraft ? 'draft' : 'published',
            });
            showMsg(saveAsDraft ? 'Saved as draft!' : 'Book added to library!');
            setBF({ title: '', author: '', category: 'General', pdfUrl: '', classGrade: '', coverImage: '' });
            setBookFile(null);
            setBookCover(null);
        } catch (e) { showMsg(e.message || 'Upload failed', false); }
        finally { setUploading(false); }
    };

    /* ── Leave submit ── */
    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/leave', leaveForm);
            showMsg('Leave application submitted!');
            setLF({ startDate: '', endDate: '', reason: '' });
            fetchLeaves();
        } catch (e) { showMsg(e.response?.data?.message || 'Error', false); }
    };

    /* ── Publish draft ── */
    const publishVideo = async (id) => {
        try { await api.patch(`/api/videos/${id}/publish`); showMsg('Video published!'); fetchMyUploads(); }
        catch (e) { showMsg('Failed to publish', false); }
    };
    const publishBook = async (id) => {
        try { await api.patch(`/api/library/${id}/publish`); showMsg('Book published!'); fetchMyUploads(); }
        catch (e) { showMsg('Failed to publish', false); }
    };

    /* ── Delete ── */
    const deleteItem = async (item) => {
        if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
        try {
            if (item._type === 'video') await api.delete(`/api/videos/${item._id}`);
            else await api.delete(`/api/library/${item._id}`);
            showMsg('Deleted successfully.');
            fetchMyUploads();
        } catch (e) { showMsg(e.response?.data?.message || 'Delete failed', false); }
    };

    /* ── Open / Save Edit ── */
    const openEdit = (item) => {
        setEditingItem(item);
        if (item._type === 'video') {
            setEF({ title: item.title, description: item.description || '', url: item.url, classGrade: String(item.classGrade) });
        } else {
            setEF({ title: item.title, author: item.author || '', category: item.category || 'General', pdfUrl: item.pdfUrl || '', classGrade: item.classGrade ? String(item.classGrade) : '' });
        }
    };
    const closeEdit = () => { setEditingItem(null); setEF({}); };

    const saveEdit = async () => {
        setSavingEdit(true);
        try {
            const payload = { ...editForm };
            if (editingItem._type === 'video') {
                payload.classGrade = Number(payload.classGrade);
                await api.put(`/api/videos/${editingItem._id}`, payload);
            } else {
                payload.classGrade = payload.classGrade === '' ? null : Number(payload.classGrade);
                await api.put(`/api/library/${editingItem._id}`, payload);
            }
            showMsg('Changes saved!');
            closeEdit();
            fetchMyUploads();
        } catch (e) { showMsg(e.response?.data?.message || 'Save failed', false); }
        finally { setSavingEdit(false); }
    };

    /* ── Drag & drop helpers ── */
    const handleDrop = (e, setter) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) setter(file);
    };

    const getYTThumb = (url) => {
        const m = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i);
        return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Sunday'];

    /* ── My Uploads merged & filtered list ── */
    const allUploads = [
        ...myVideos.map(v => ({ ...v, _type: 'video' })),
        ...myBooks.map(b => ({ ...b, _type: 'ebook' })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const filteredUploads = mineFilter === 'all' ? allUploads
        : allUploads.filter(u => u._type === mineFilter);

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-6">

            {/* Toast */}
            {msg && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold text-white transition-all
                    ${msg.ok ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {msg.text}
                </div>
            )}

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Teacher Workspace</h1>
                <p className="text-gray-400 mt-1 text-sm">Manage your classes, apply for leave, and publish learning materials.</p>
            </div>

            {/* ══ SCHEDULE ══ */}
            {activeTab === 'schedule' && (
                <div className="space-y-4">
                    <h2 className="text-base font-black text-gray-800 flex items-center gap-2">
                        <span className="w-1 h-5 bg-blue-500 rounded-full inline-block"/> Weekly Timetable
                    </h2>
                    {loadingSchedule ? (
                        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-28 bg-gray-100 rounded-3xl animate-pulse"/>)}</div>
                    ) : schedule.length === 0 ? (
                        <div className="bg-white border border-dashed border-gray-200 rounded-3xl py-16 text-center text-gray-400">
                            <div className="text-4xl mb-3">🏖️</div>
                            <p className="font-semibold text-sm">No classes scheduled yet.</p>
                            <p className="text-xs mt-1">Contact your principal to set up your timetable.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {days.map(day => {
                                const dc = schedule.filter(s => s.dayOfWeek === day);
                                if (!dc.length) return null;
                                return (
                                    <div key={day} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                                        <div className="bg-gray-900 text-white text-sm font-black px-5 py-3 flex items-center justify-between">
                                            <span>{day}</span>
                                            <span className="bg-white/15 rounded-full px-2.5 py-0.5 text-[10px]">{dc.length} periods</span>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            {dc.map(cls => (
                                                <div key={cls._id} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center shrink-0">{cls.period}</div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm">{cls.subject}</p>
                                                        <p className="text-xs text-gray-400">Class {cls.classGrade} — Sec {cls.section}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ══ LEAVE ══ */}
            {activeTab === 'leave' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <h2 className="text-base font-black text-gray-800 flex items-center gap-2 mb-5">
                            <span className="bg-amber-100 rounded-xl w-8 h-8 flex items-center justify-center">📝</span>
                            Apply for Leave
                        </h2>
                        <form onSubmit={handleLeaveSubmit} className="space-y-4">
                            <div><Lbl>Start Date</Lbl><input type="date" required value={leaveForm.startDate} onChange={e=>setLF({...leaveForm,startDate:e.target.value})} className={iCls}/></div>
                            <div><Lbl>End Date</Lbl><input type="date" required value={leaveForm.endDate} onChange={e=>setLF({...leaveForm,endDate:e.target.value})} className={iCls}/></div>
                            <div><Lbl>Reason</Lbl><textarea required rows={4} placeholder="Describe your reason..." value={leaveForm.reason} onChange={e=>setLF({...leaveForm,reason:e.target.value})} className={iCls+' resize-none'}/></div>
                            <button type="submit" className="w-full bg-gray-900 hover:bg-gray-700 text-white font-bold text-sm py-3.5 rounded-2xl transition-colors">Submit Request</button>
                        </form>
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-base font-black text-gray-800 flex items-center gap-2">
                            <span className="w-1 h-5 bg-amber-400 rounded-full inline-block"/> Leave History
                        </h2>
                        {leaves.length === 0 ? (
                            <div className="bg-white border border-dashed border-gray-200 rounded-3xl py-10 text-center text-gray-400">
                                <p className="text-3xl mb-2">📋</p><p className="text-sm">No applications yet.</p>
                            </div>
                        ) : leaves.map(l => {
                            const sc = { approved:'bg-emerald-50 text-emerald-700 border-emerald-200', rejected:'bg-red-50 text-red-700 border-red-200', pending:'bg-amber-50 text-amber-700 border-amber-200' };
                            const ic = { approved:'✓', rejected:'✗', pending:'⏳' };
                            return (
                                <div key={l._id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-800 text-sm">{new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}</p>
                                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{l.reason}</p>
                                    </div>
                                    <span className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border ${sc[l.status]}`}>{ic[l.status]} {l.status}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ══ UPLOAD CENTER ══ */}
            {activeTab === 'upload' && (
                <div className="space-y-6">
                    {/* Top-level type toggle */}
                    <div className="flex gap-3">
                        {[['video','🎥','Practical Video'],['ebook','📚','e-Book / PDF']].map(([t,ic,lb])=>(
                            <button key={t} onClick={()=>setUT(t)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all border-2
                                    ${uploadType===t?'bg-gray-900 text-white border-gray-900 shadow-md':'bg-white text-gray-600 border-gray-100 hover:border-gray-300'}`}>
                                {ic} {lb}
                            </button>
                        ))}
                    </div>

                    {/* ── VIDEO FORM ── */}
                    {uploadType === 'video' && (
                        <form onSubmit={handleVideoSubmit}
                            className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-6 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl">🎥</div>
                                    <div>
                                        <h2 className="font-black text-xl">Upload Practical Video</h2>
                                        <p className="text-white/70 text-xs mt-0.5">Share lab demos, experiments, and lessons with students</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Source mode toggle */}
                                <div>
                                    <Lbl>Upload Method</Lbl>
                                    <div className="flex gap-2">
                                        {[['link','🔗 Paste a URL'],['file','📂 Upload from Device']].map(([m,l])=>(
                                            <button key={m} type="button" onClick={()=>setUM(m)}
                                                className={`flex-1 py-2.5 px-4 rounded-2xl text-sm font-bold border-2 transition-all
                                                    ${uploadMode===m?'border-violet-500 bg-violet-50 text-violet-700':'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}>
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* URL input */}
                                {uploadMode === 'link' && (
                                    <div>
                                        <Lbl>YouTube or Google Drive URL</Lbl>
                                        <input type="url" placeholder="https://www.youtube.com/watch?v=..." value={videoForm.url}
                                            onChange={e=>{setVF({...videoForm,url:e.target.value}); setVPreview(getYTThumb(e.target.value)||'');}}
                                            className={iCls}/>
                                        {videoPreview && (
                                            <div className="mt-3 relative rounded-2xl overflow-hidden aspect-video max-w-xs shadow-md">
                                                <img src={videoPreview} alt="preview" className="w-full h-full object-cover"/>
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center pl-1 shadow-lg"><span className="text-violet-600">▶</span></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* File drag & drop */}
                                {uploadMode === 'file' && (
                                    <div>
                                        <Lbl>Video File</Lbl>
                                        <div ref={videoDrop}
                                            onDragOver={e=>e.preventDefault()}
                                            onDrop={e=>handleDrop(e, setVideoFile)}
                                            onClick={()=>document.getElementById('videoFileInput').click()}
                                            className="border-2 border-dashed border-violet-200 hover:border-violet-400 bg-violet-50/40 hover:bg-violet-50 rounded-2xl p-8 text-center cursor-pointer transition-all">
                                            <input id="videoFileInput" type="file" accept="video/*" className="hidden"
                                                onChange={e=>setVideoFile(e.target.files[0])}/>
                                            {videoFile ? (
                                                <div className="flex items-center justify-center gap-3 text-violet-700">
                                                    <span className="text-2xl">🎬</span>
                                                    <div className="text-left">
                                                        <p className="font-bold text-sm">{videoFile.name}</p>
                                                        <p className="text-xs opacity-70">{(videoFile.size/1024/1024).toFixed(1)} MB</p>
                                                    </div>
                                                    <button type="button" onClick={e=>{e.stopPropagation();setVideoFile(null);}} className="ml-4 text-xs text-red-500 hover:text-red-700">Remove</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="text-4xl mb-3">🎞️</div>
                                                    <p className="font-bold text-violet-700 text-sm">Drop a video file here</p>
                                                    <p className="text-xs text-gray-400 mt-1">or click to browse from device · MP4, MOV, MKV</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Lbl>Video Title</Lbl>
                                    <input type="text" required placeholder="e.g., Cell Division Lab Demonstration" value={videoForm.title}
                                        onChange={e=>setVF({...videoForm,title:e.target.value})} className={iCls}/>
                                </div>
                                <div>
                                    <Lbl>Description (optional)</Lbl>
                                    <textarea rows={3} placeholder="What does this video cover? What should students focus on?" value={videoForm.description}
                                        onChange={e=>setVF({...videoForm,description:e.target.value})} className={iCls+' resize-none'}/>
                                </div>
                                <div>
                                    <Lbl>Target Class</Lbl>
                                    <select value={videoForm.classGrade} onChange={e=>setVF({...videoForm,classGrade:e.target.value})} className={iCls}>
                                        <option value="8">Class 8</option>
                                        <option value="9">Class 9</option>
                                        <option value="10">Class 10</option>
                                    </select>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-3">
                                    <button type="submit" disabled={uploading}
                                        className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-black text-sm py-4 rounded-2xl transition-colors shadow-md flex items-center justify-center gap-2">
                                        {uploading ? <><span className="animate-spin">⏳</span> Uploading…</> : '⬆️  Publish Video to Students'}
                                    </button>
                                    <button type="button" disabled={uploading}
                                        onClick={(e) => handleVideoSubmit(e, true)}
                                        className="px-5 py-4 rounded-2xl border-2 border-violet-200 bg-violet-50 text-violet-700 font-bold text-sm hover:bg-violet-100 disabled:opacity-50 transition-colors whitespace-nowrap">
                                        💾 Save Draft
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* ── EBOOK FORM ── */}
                    {uploadType === 'ebook' && (
                        <form onSubmit={handleBookSubmit}
                            className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl">📚</div>
                                    <div>
                                        <h2 className="font-black text-xl">Add e-Book to Library</h2>
                                        <p className="text-white/70 text-xs mt-0.5">Students can read PDFs directly in their browser</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div><Lbl>Book Title</Lbl><input type="text" required placeholder="e.g., Biology Class 10" value={bookForm.title} onChange={e=>setBF({...bookForm,title:e.target.value})} className={iCls}/></div>
                                    <div><Lbl>Author</Lbl><input type="text" required placeholder="Author name" value={bookForm.author} onChange={e=>setBF({...bookForm,author:e.target.value})} className={iCls}/></div>
                                </div>
                                
                                {/* Cover Image upload */}
                                <div>
                                    <Lbl>Cover Image (Optional)</Lbl>
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                                            {bookCover ? (
                                                <img src={URL.createObjectURL(bookCover)} alt="Cover preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-2xl opacity-50">🖼️</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input type="file" accept="image/*" onChange={e => setBookCover(e.target.files[0])}
                                                className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-xl file:border-0
                                                file:text-xs file:font-semibold
                                                file:bg-emerald-50 file:text-emerald-700
                                                hover:file:bg-emerald-100 cursor-pointer" />
                                            <p className="text-[10px] text-gray-400 mt-1">Image will be automatically optimized and resized.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PDF source */}
                                <div>
                                    <Lbl>PDF Source</Lbl>
                                    <div className="flex gap-2 mb-3">
                                        {[['link','🔗 Google Drive Link'],['file','📂 Upload PDF from Device']].map(([m,l])=>(
                                            <button key={m} type="button" onClick={()=>{ setUM(m); setBookFile(null); setBF({...bookForm,pdfUrl:''}); }}
                                                className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold border-2 transition-all
                                                    ${uploadMode===m?'border-emerald-500 bg-emerald-50 text-emerald-700':'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}>
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                    {uploadMode === 'link' ? (
                                        <>
                                            <input type="url" placeholder="https://drive.google.com/file/..." value={bookForm.pdfUrl}
                                                onChange={e=>setBF({...bookForm,pdfUrl:e.target.value})} className={iCls}/>
                                            <p className="text-[11px] text-gray-400 mt-2">Make sure the Drive file is set to "Anyone with the link can view".</p>
                                        </>
                                    ) : (
                                        <div ref={bookDrop}
                                            onDragOver={e=>e.preventDefault()}
                                            onDrop={e=>handleDrop(e, setBookFile)}
                                            onClick={()=>document.getElementById('pdfFileInput').click()}
                                            className="border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50 rounded-2xl p-8 text-center cursor-pointer transition-all">
                                            <input id="pdfFileInput" type="file" accept=".pdf" className="hidden"
                                                onChange={e=>setBookFile(e.target.files[0])}/>
                                            {bookFile ? (
                                                <div className="flex items-center justify-center gap-3 text-emerald-700">
                                                    <span className="text-2xl">📄</span>
                                                    <div className="text-left">
                                                        <p className="font-bold text-sm">{bookFile.name}</p>
                                                        <p className="text-xs opacity-70">{(bookFile.size/1024/1024).toFixed(1)} MB</p>
                                                    </div>
                                                    <button type="button" onClick={e=>{e.stopPropagation();setBookFile(null);}} className="ml-4 text-xs text-red-500">Remove</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="text-4xl mb-3">📄</div>
                                                    <p className="font-bold text-emerald-700 text-sm">Drop a PDF file here</p>
                                                    <p className="text-xs text-gray-400 mt-1">or click to browse · PDF only · Max 50 MB</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <Lbl>Category</Lbl>
                                        <select value={bookForm.category} onChange={e=>setBF({...bookForm,category:e.target.value})} className={iCls}>
                                            {['General','Science','Mathematics','Literature','History','Geography','Health','Technology','Economics'].map(c=>(
                                                <option key={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Lbl>Restrict to Class</Lbl>
                                        <select value={bookForm.classGrade} onChange={e=>setBF({...bookForm,classGrade:e.target.value})} className={iCls}>
                                            <option value="">All Classes (Public)</option>
                                            <option value="8">Class 8 Only</option>
                                            <option value="9">Class 9 Only</option>
                                            <option value="10">Class 10 Only</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-3">
                                    <button type="submit" disabled={uploading}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm py-4 rounded-2xl transition-colors shadow-md flex items-center justify-center gap-2">
                                        {uploading ? <><span className="animate-spin">⏳</span> Uploading…</> : '📚  Add Book to Library'}
                                    </button>
                                    <button type="button" disabled={uploading}
                                        onClick={(e) => handleBookSubmit(e, true)}
                                        className="px-5 py-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-sm hover:bg-emerald-100 disabled:opacity-50 transition-colors whitespace-nowrap">
                                        💾 Save Draft
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* ══ MY UPLOADS ══ */}
            {activeTab === 'my-uploads' && (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Uploads</h1>
                            <p className="text-gray-400 text-sm mt-1">All videos and books you have uploaded — publish drafts when ready.</p>
                        </div>
                        <button onClick={fetchMyUploads}
                            className="self-start sm:self-auto flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                            🔄 Refresh
                        </button>
                    </div>

                    {/* Filter pills */}
                    <div className="flex gap-2 flex-wrap">
                        {[['all','🗂️ All'],['video','🎥 Videos'],['ebook','📚 Books']].map(([v,l])=>(
                            <button key={v} onClick={()=>setMineFilter(v)}
                                className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${mineFilter===v?'bg-gray-900 text-white shadow-sm':'bg-white border border-gray-100 text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                                {l}
                            </button>
                        ))}
                        <span className="ml-auto text-xs text-gray-300 self-center">{filteredUploads.length} item{filteredUploads.length!==1?'s':''}</span>
                    </div>

                    {/* List */}
                    {loadingMine ? (
                        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-20 bg-gray-100 rounded-3xl animate-pulse"/>)}</div>
                    ) : filteredUploads.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl py-16 text-center">
                            <div className="text-5xl mb-3">📭</div>
                            <p className="font-bold text-gray-500 text-sm">Nothing uploaded yet.</p>
                            <p className="text-gray-400 text-xs mt-1">Head to Upload Center to add your first resource.</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-50">
                                {filteredUploads.map(item => (
                                    <div key={item._id} className="divide-y divide-gray-100">
                                        <div className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                                            {/* Type icon */}
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0
                                                ${item._type==='video'?'bg-violet-100':'bg-emerald-100'}`}>
                                                {item._type === 'video' ? '🎥' : '📚'}
                                            </div>
                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold text-gray-800 text-sm truncate">{item.title}</p>
                                                    <StatusBadge status={item.status}/>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item._type==='video'?'bg-violet-50 text-violet-600':'bg-emerald-50 text-emerald-600'}`}>
                                                        {item._type === 'video' ? 'Video' : 'Book'}
                                                    </span>
                                                    {item.classGrade && (
                                                        <span className="text-[10px] text-gray-400 font-medium">Class {item.classGrade}</span>
                                                    )}
                                                    {item._type === 'ebook' && item.category && (
                                                        <span className="text-[10px] text-gray-400 font-medium">{item.category}</span>
                                                    )}
                                                    <span className="text-[10px] text-gray-300">
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Actions */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                {item.status === 'draft' && (
                                                    <button onClick={() => item._type === 'video' ? publishVideo(item._id) : publishBook(item._id)}
                                                        className="text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors">
                                                        🚀 Publish
                                                    </button>
                                                )}
                                                <button onClick={() => openEdit(item)}
                                                    className="text-[11px] font-bold bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-700 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-blue-200 transition-colors">
                                                    ✏️ Edit
                                                </button>
                                                <button onClick={() => deleteItem(item)}
                                                    className="text-[11px] font-bold bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-red-200 transition-colors">
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>

                                        {/* Inline Edit Form */}
                                        {editingItem?._id === item._id && (
                                            <div className="p-5 bg-blue-50/30 border-t border-gray-100">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block" />
                                                    <h3 className="font-bold text-sm text-gray-800">Editing {item._type === 'video' ? 'Video' : 'Book'}</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div><Lbl>Title</Lbl><input type="text" required value={editForm.title} onChange={e=>setEF({...editForm,title:e.target.value})} className={iCls}/></div>
                                                        <div>
                                                            <Lbl>Target Class</Lbl>
                                                            <select value={editForm.classGrade} onChange={e=>setEF({...editForm,classGrade:e.target.value})} className={iCls}>
                                                                {item._type === 'ebook' && <option value="">All Classes (Public)</option>}
                                                                <option value="8">Class 8</option>
                                                                <option value="9">Class 9</option>
                                                                <option value="10">Class 10</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    
                                                    {item._type === 'video' ? (
                                                        <>
                                                            <div><Lbl>YouTube/Drive URL</Lbl><input type="url" required value={editForm.url} onChange={e=>setEF({...editForm,url:e.target.value})} className={iCls}/></div>
                                                            <div><Lbl>Description</Lbl><textarea rows={2} value={editForm.description} onChange={e=>setEF({...editForm,description:e.target.value})} className={iCls+' resize-none'}/></div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div><Lbl>Author</Lbl><input type="text" required value={editForm.author} onChange={e=>setEF({...editForm,author:e.target.value})} className={iCls}/></div>
                                                                <div>
                                                                    <Lbl>Category</Lbl>
                                                                    <select value={editForm.category} onChange={e=>setEF({...editForm,category:e.target.value})} className={iCls}>
                                                                        {['General','Science','Mathematics','Literature','History','Geography','Health','Technology','Economics'].map(c=><option key={c}>{c}</option>)}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div><Lbl>PDF External URL (optional if uploaded file)</Lbl><input type="url" value={editForm.pdfUrl} onChange={e=>setEF({...editForm,pdfUrl:e.target.value})} className={iCls}/></div>
                                                            <div className="mt-4">
                                                                <Lbl>Cover Image</Lbl>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="h-16 w-16 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                                                                        {editCoverFile ? (
                                                                            <img src={URL.createObjectURL(editCoverFile)} className="h-full w-full object-cover" />
                                                                        ) : editForm.coverImage ? (
                                                                            <img src={editForm.coverImage} className="h-full w-full object-cover" />
                                                                        ) : (
                                                                            <div className="h-full w-full flex items-center justify-center opacity-50">🖼️</div>
                                                                        )}
                                                                    </div>
                                                                    <input type="file" accept="image/*" onChange={e => setEditCoverFile(e.target.files[0])}
                                                                        className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}

                                                    <div className="flex gap-2 justify-end mt-2">
                                                        <button onClick={closeEdit} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">Cancel</button>
                                                        <button onClick={saveEdit} disabled={savingEdit} className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
                                                            {savingEdit ? 'Saving...' : 'Save Changes'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function TeacherDashboard() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500 font-bold">Loading dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
