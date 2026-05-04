/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { PlusCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function CustomerForm() {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    const path = 'clientes';
    try {
      await addDoc(collection(db, path), {
        nombre,
        telefono,
        notas,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid,
        creatorEmail: auth.currentUser.email,
      });
      setNombre('');
      setTelefono('');
      setNotas('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl"
    >
      <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
        Nuevo Cliente
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-xs font-bold text-slate-500 uppercase tracking-tighter mb-1">Nombre Completo</label>
          <input
            id="nombre"
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-700"
            placeholder="Ej. Maria Garcia"
          />
        </div>
        <div>
          <label htmlFor="telefono" className="block text-xs font-bold text-slate-500 uppercase tracking-tighter mb-1">Teléfono</label>
          <input
            id="telefono"
            type="tel"
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-700"
            placeholder="+34 600 000 000"
          />
        </div>
        <div>
          <label htmlFor="notas" className="block text-xs font-bold text-slate-500 uppercase tracking-tighter mb-1">Notas</label>
          <textarea
            id="notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all h-24 resize-none placeholder:text-slate-700"
            placeholder="Detalles adicionales..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Cliente'}
        </button>
      </form>
    </motion.div>
  );
}
