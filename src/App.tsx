/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { auth, db, loginWithGoogle, logout, testConnection } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import CustomerForm from './components/CustomerForm';
import CustomerList from './components/CustomerList';
import Diagnosis from './components/Diagnosis';
import { LogOut, LayoutDashboard, Database, Info, LogIn, ShieldAlert, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'nuevo-cliente' | 'consultar-clientes' | 'diagnosis'>('home');

  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && u.email) {
        try {
          const docRef = doc(db, 'authorizedUsers', u.email);
          const docSnap = await getDoc(docRef);
          setIsAuthorized(docSnap.exists());
        } catch (error) {
          console.error("Error checking authorization:", error);
          setIsAuthorized(false);
        }
      } else {
        setIsAuthorized(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl p-8 text-center border border-slate-800"
        >
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">App Prueba Clientes</h1>
          <p className="text-slate-400 mb-8">Gestión de clientes simple y segura con Firebase</p>
          
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-6 rounded-xl transition-all shadow-sm group"
          >
            <LogIn className="w-5 h-5 text-indigo-600 transition-transform group-hover:scale-110" />
            Iniciar sesión con Google
          </button>
        </motion.div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl p-8 text-center border border-red-900/30"
        >
          <div className="w-16 h-16 bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-900/50">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Acceso no autorizado</h1>
          <p className="text-slate-400 mb-8">Lo sentimos, no tienes permisos para acceder a esta aplicación. Contacta con el administrador.</p>
          
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 mb-8 text-left">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Tu Email</p>
            <p className="text-sm font-mono text-indigo-400 truncate">{user.email}</p>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col selection:bg-indigo-500/30">
      {/* Navbar */}
      <header className="max-w-7xl mx-auto w-full px-4 md:px-8 py-6 mb-8 border-b border-slate-800 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setActiveTab('home')}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white group-hover:text-indigo-400 transition-colors">Prueba Clientes</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Sesión Iniciada</p>
            <p className="text-sm font-medium text-indigo-400">{user.email}</p>
          </div>
          <div className="relative group">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
              className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 p-0.5" 
              alt="Avatar"
            />
            <button
              onClick={logout}
              className="absolute -top-1 -right-1 bg-slate-800 text-slate-400 hover:text-red-400 p-1 rounded-full border border-slate-700 transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
              title="Cerrar sesión"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 pb-12">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto py-12"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Bienvenido al Gestor</h2>
                <p className="text-slate-400">¿Qué te gustaría hacer hoy?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setActiveTab('nuevo-cliente')}
                  className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:bg-slate-800/50 hover:border-indigo-500 transition-all group flex flex-col items-center text-center gap-4"
                >
                  <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-300">
                    <Database className="w-8 h-8 text-indigo-500 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Nuevo Cliente</h3>
                    <p className="text-slate-500 text-sm">Registra un nuevo contacto en el sistema rápidamente.</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('consultar-clientes')}
                  className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:bg-slate-800/50 hover:border-indigo-500 transition-all group flex flex-col items-center text-center gap-4"
                >
                  <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-all duration-300">
                    <LayoutDashboard className="w-8 h-8 text-blue-500 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Consultar Clientes</h3>
                    <p className="text-slate-500 text-sm">Visualiza, filtra y exporta tu listado actual de clientes.</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('diagnosis')}
                  className="md:col-span-2 bg-slate-950 border border-slate-800 p-4 rounded-2xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3 text-slate-500 hover:text-slate-300"
                >
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Ver Información de Diagnóstico</span>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'nuevo-cliente' && (
            <motion.div 
              key="nuevo-cliente"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setActiveTab('home')}
                    className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-lg"
                  >
                    <Home className="w-5 h-5" />
                  </button>
                  <h2 className="text-2xl font-bold text-white">Registrar Cliente</h2>
                </div>
              </div>
              <CustomerForm />
            </motion.div>
          )}

          {activeTab === 'consultar-clientes' && (
            <motion.div 
              key="consultar-clientes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setActiveTab('home')}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-lg"
                >
                  <Home className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-white">Listado</h2>
              </div>
              <CustomerList />
            </motion.div>
          )}

          {activeTab === 'diagnosis' && (
            <motion.div 
              key="diagnosis"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl mx-auto"
            >
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setActiveTab('home')}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-lg"
                >
                  <Home className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-white">Estado del Sistema</h2>
              </div>
              <Diagnosis />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Conectado a Firestore Realtime</span>
        </div>
        <div className="text-[10px] text-slate-600 uppercase tracking-widest font-medium">
          &copy; {new Date().getFullYear()} v1.0.2-stable
        </div>
      </footer>
    </div>
  );
}
