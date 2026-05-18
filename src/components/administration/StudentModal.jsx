import { useState, useEffect } from 'react';
import { X, Save, User } from 'lucide-react';
import { studentsAPI } from '../../api';

const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT'];
const YEARS = ['1st', '2nd', '3rd', '4th'];
const BANKS = ['SBI', 'HDFC', 'ICICI', 'PNB', 'Axis', 'BOB', 'Canara'];

const empty = {
    fullName: '', rollNo: '', uniRollNo: '', department: 'CSE', year: '1st', semester: 1,
    email: '', phone: '', hostelRoom: '', isDRCC: false, photo: '👨‍🎓',
    bankAccount: '', ifscCode: '', bankName: 'SBI',
};

const StudentFormModal = ({ isOpen, onClose, student, onSaved }) => {
    const [form, setForm] = useState(empty);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEdit = !!student;

    useEffect(() => {
        if (student) {
            setForm({ ...empty, ...student, hostelRoom: student.hostelRoom || '' });
        } else {
            setForm(empty);
        }
        setError('');
    }, [student, isOpen]);

    const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async () => {
        // Basic validation
        if (!form.fullName.trim()) return setError('Full name is required');
        if (!form.rollNo.trim()) return setError('Roll number is required');
        if (!form.uniRollNo.trim()) return setError('University roll number is required');
        if (!form.email.trim()) return setError('Email is required');

        setLoading(true);
        setError('');
        try {
            const payload = { ...form, hostelRoom: form.hostelRoom || null };
            if (isEdit) {
                await studentsAPI.update(student.id, payload);
            } else {
                await studentsAPI.create(payload);
            }
            onSaved();
            onClose();
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="text-blue-600" size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{isEdit ? 'Edit Student' : 'Add New Student'}</h2>
                            <p className="text-sm text-gray-500">{isEdit ? `Editing ${student.fullName}` : 'Fill in the student details below'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 p-6 space-y-6">

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Personal Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="e.g. Rahul Sharma"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number *</label>
                                <input value={form.rollNo} onChange={e => set('rollNo', e.target.value)} placeholder="e.g. CSE001"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">University Roll No *</label>
                                <input value={form.uniRollNo} onChange={e => set('uniRollNo', e.target.value)} placeholder="e.g. UNI2021001"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="e.g. rahul@college.edu"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="e.g. 9876543210"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
                                <div className="flex space-x-2">
                                    {['👨‍🎓', '👩‍🎓'].map(emoji => (
                                        <button key={emoji} onClick={() => set('photo', emoji)}
                                            className={`text-3xl p-2 rounded-lg border-2 transition-all ${form.photo === emoji ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-400'}`}>
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Academic Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Academic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select value={form.department} onChange={e => set('department', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                <select value={form.year} onChange={e => { set('year', e.target.value); set('semester', parseInt(e.target.value) * 2); }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                    {YEARS.map(y => <option key={y} value={y}>{y} Year</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                <select value={form.semester} onChange={e => set('semester', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Hostel & DRCC */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Hostel & Status</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Room</label>
                                <input value={form.hostelRoom} onChange={e => set('hostelRoom', e.target.value)} placeholder="e.g. A-201 (leave blank if day scholar)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="flex items-center">
                                <label className="flex items-center space-x-3 cursor-pointer mt-5">
                                    <div className="relative">
                                        <input type="checkbox" checked={form.isDRCC} onChange={e => set('isDRCC', e.target.checked)} className="sr-only" />
                                        <div className={`w-12 h-6 rounded-full transition-colors ${form.isDRCC ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isDRCC ? 'translate-x-6' : ''}`}></div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">DRCC Student</span>
                                        <p className="text-xs text-gray-500">Eligible for refund</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Bank Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Bank Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                <select value={form.bankName} onChange={e => set('bankName', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                <input value={form.bankAccount} onChange={e => set('bankAccount', e.target.value)} placeholder="e.g. 1234567890"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                                <input value={form.ifscCode} onChange={e => set('ifscCode', e.target.value.toUpperCase())} placeholder="e.g. SBIN0001234"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-2xl">
                    <button onClick={onClose} className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={loading}
                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg transition-colors font-medium">
                        {loading ? (
                            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>Saving...</span></>
                        ) : (
                            <><Save size={16} /><span>{isEdit ? 'Save Changes' : 'Add Student'}</span></>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default StudentFormModal;