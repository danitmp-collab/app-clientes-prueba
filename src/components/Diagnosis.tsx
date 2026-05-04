/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getCountFromServer, doc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ShieldCheck, User, Mail, Database, Activity, Lock, Unlock } from 'lucide-react';
import { motion } from 'motion/react';

export default function Diagnosis() {
  const [clientCount, setClientCount] = useState<number | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const fetchCount = async () => {
      const path = 'clientes';
      try {
        const q = query(collection(db, path), where('createdBy', '==', user.uid));
        const snapshot = await getCountFromServer(q);
        setClientCount(snapshot.data().count);
      } catch (error) {
        // This might fail if not authorized, catch silently for diagnosis
        console.warn("Could not fetch client count for diagnosis");
      }
    };

    const checkAuth = async () => {
      if (!user.email) return;
      try {
        const docRef = doc(db, 'authorizedUsers', user.email);
        const docSnap = await getDoc(docRef);
        setIsAuthorized(docSnap.exists());
      } catch (error) {
        setIsAuthorized(false);
      }
    };

    fetchCount();
    checkAuth();
  }, [user]);

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl"
    >
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
        Diagnóstico de Firebase
        {isAuthorized ? (
          <Unlock className="w-3 h-3 text-emerald-500" />
        ) : (
          <Lock className="w-3 h-3 text-red-500" />
        )}
      </h2>
      
      <div className="space-y-3">
        <div className="flex justify-between border-b border-slate-800/50 pb-2">
          <span className="text-sm text-slate-400">Usuario (Email)</span>
          <span className="text-sm text-white truncate max-w-[150px]">{user.email}</span>
        </div>
        
        <div className="flex justify-between border-b border-slate-800/50 pb-2">
          <span className="text-sm text-slate-400">UID</span>
          <span className="text-sm font-mono text-indigo-300 truncate max-w-[120px]" title={user.uid}>{user.uid}</span>
        </div>

        <div className="flex justify-between border-b border-slate-800/50 pb-2">
          <span className="text-sm text-slate-400">Project ID</span>
          <span className="text-sm text-slate-200 truncate max-w-[150px]">{firebaseConfig.projectId}</span>
        </div>

        <div className="flex justify-between border-b border-slate-800/50 pb-2">
          <span className="text-sm text-slate-400">Autorizado</span>
          <span className={`text-sm font-bold ${isAuthorized ? 'text-emerald-400' : 'text-red-400'}`}>
            {isAuthorized === null ? '...' : isAuthorized ? 'SÍ' : 'NO'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Clientes Visibles</span>
          <span className="text-sm font-bold text-emerald-400 underline underline-offset-4 decoration-emerald-500/30">
            {clientCount !== null ? clientCount.toString().padStart(2, '0') : '--'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
