/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { Cliente } from '../types';
import { Download, Users, Calendar, Phone, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CustomerList() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const path = 'clientes';
    const q = query(
      collection(db, path),
      where('createdBy', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Cliente[];
      setClientes(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, []);

  const exportToJSON = () => {
    const dataStr = JSON.stringify(clientes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `clientes_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setImporting(true);
    setImportStatus(null);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        const list = Array.isArray(data) ? data : [data];
        
        let successCount = 0;
        const path = 'clientes';

        for (const item of list) {
          if (item.nombre && item.telefono) {
            await addDoc(collection(db, path), {
              nombre: item.nombre,
              telefono: item.telefono,
              notas: item.notas || '',
              createdAt: serverTimestamp(),
              createdBy: auth.currentUser!.uid,
              creatorEmail: auth.currentUser!.email,
            });
            successCount++;
          }
        }

        setImportStatus({ 
          type: 'success', 
          message: `Se han importado ${successCount} clientes correctamente.` 
        });
      } catch (error) {
        console.error("Error importing JSON:", error);
        setImportStatus({ 
          type: 'error', 
          message: 'Error al procesar el archivo JSON. Asegúrate de que el formato sea correcto.' 
        });
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <h2 className="text-xl font-semibold text-white">Listado de Clientes</h2>
        
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />
          
          <button
            onClick={handleImportClick}
            disabled={importing}
            className="text-[10px] font-bold bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all uppercase tracking-widest disabled:opacity-50"
          >
            {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Importar JSON
          </button>

          {clientes.length > 0 && (
            <button
              onClick={exportToJSON}
              className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all uppercase tracking-widest"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar JSON
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {importStatus && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
              importStatus.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {importStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span className="text-sm font-medium">{importStatus.message}</span>
            <button 
              onClick={() => setImportStatus(null)}
              className="ml-auto text-xs uppercase font-bold opacity-60 hover:opacity-100"
            >
              Cerrar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex-grow flex flex-col">
        {clientes.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-slate-600 py-20 px-6 text-center">
            <Users className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">No hay clientes registrados aún.</p>
            <p className="text-xs text-slate-700 mt-1 uppercase tracking-tighter">Utiliza el formulario lateral para añadir uno</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Teléfono</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Creado</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <AnimatePresence>
                  {clientes.map((cliente) => (
                    <motion.tr
                      key={cliente.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-800/30 group transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-white group-hover:text-indigo-400 transition-colors">{cliente.nombre}</div>
                        {cliente.notas && (
                          <div className="text-xs text-slate-500 line-clamp-1 italic mt-0.5">Note: {cliente.notas}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          {cliente.telefono}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[10px] text-slate-500 font-mono">
                        {cliente.createdAt?.toDate().toLocaleString() || 'Pendiente...'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[10px] text-slate-500 font-mono lowercase">{cliente.creatorEmail}</span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
