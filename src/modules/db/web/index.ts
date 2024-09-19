import { initializeApp } from 'firebase/app';
import type { FirebaseOptions, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

export /*bundle*/ let db: Firestore;

export /*bundle*/ function initialize(options: FirebaseOptions) {
	// Initialize the Firebase app with the provided options
	const app: FirebaseApp = initializeApp(options);

	// Initialize Firestore using the app instance
	db = getFirestore();
}
