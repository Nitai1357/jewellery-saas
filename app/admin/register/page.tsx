'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Path check karein
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

// Component name starts with capital letter (e.g., AdminRegister)
const AdminRegister = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // 1. Firebase Auth mein register karein
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Firestore mein user doc create karein aur role 'admin' set karein
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "admin", // <--- YEH ZAROORI HAI
        createdAt: new Date()
      });

      alert("Admin created successfully!");
      router.push('/admin/login');
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Error creating admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#111] border border-white/10 p-8 rounded-3xl shadow-2xl">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tighter text-white">
            Create <span className="text-yellow-500">Admin</span>
          </h1>
          <p className="text-gray-400 mt-2">Register new admin user</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Email Address</label>
            <input 
              type="email" 
              placeholder="admin@jewelry.com" 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-xl p-4 placeholder-gray-600 focus:outline-none focus:border-yellow-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-xl p-4 placeholder-gray-600 focus:outline-none focus:border-yellow-500"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-70"
          >
            {loading ? "Creating..." : "REGISTER ADMIN"}
          </button>
        </form>
      </div>
    </div>
  );
};

// YAHAN HEE ERROR THA: Sahi export default
export default AdminRegister;