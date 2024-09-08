import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import type { Credential } from 'firebase-admin/app';

export /*bundle*/ let db: Firestore;

export /*bundle*/ function initialize({ credential }: { credential: Credential }) {
	initializeApp({ credential });
	db = getFirestore();
}
