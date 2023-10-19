import { ErrorManager } from '@beyond-js/response/main';

export /*bundle*/ class FirestoreErrorManager extends ErrorManager {
	get is() {
		return 'firestore-collection';
	}
}
