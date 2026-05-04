/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Cliente {
  id?: string;
  nombre: string;
  telefono: string;
  notas: string;
  createdAt: any; // Using any for Firestore Timestamp
  createdBy: string;
  creatorEmail: string;
}

export interface UserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
}
