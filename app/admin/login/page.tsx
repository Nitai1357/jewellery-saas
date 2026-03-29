'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link'; // <--- Link import kiya navigation ke liye

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // 1. Firebase Auth se login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Firestore se Role check karein
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        router.push('/admin/master');
      } else {
        setError("Access Denied: Aap Admin nahi hain");
        auth.signOut();
      }
    } catch (error) {
      console.error(error);
      setError("Invalid Email or Password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center p-4">
      {/* Elite Card Container */}
      <div className="w-full max-w-md bg-[#111] border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-sm">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4 border border-yellow-500/20">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-white">
            Admin <span className="text-yellow-500">Panel</span>
          </h1>
          <p className="text-gray-400 mt-2">Sign in to manage jewelry shops</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Email Address</label>
            <input 
              type="email" 
              placeholder="admin@jewelry.com" 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-xl p-4 placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-xl p-4 placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-colors"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70"
          >
            {loading ? "Authorizing..." : "SIGN IN"}
          </button>
        </form>

        {/* --- ADDED: CREATE PROFILE LINK --- */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Link 
              href="/admin/register" 
              className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
            >
              Create Admin Profile
            </Link>
          </p>
        </div>
        {/* --------------------------------- */}
        
        <p className="text-center text-gray-600 text-xs mt-8">
          Jewelry Management System v1.0
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;