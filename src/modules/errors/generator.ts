import { FirestoreErrorManager } from './manager';

export /*bundle*/ enum ErrorCodes {
	internalError = 1,
	documentNotSaved,
	documentNotDeleted,
	invalidParameters,
	documentNotFound = 404
}

export /*bundle*/ class ErrorGenerator {
	static internalError(exc?: Error) {
		return new FirestoreErrorManager(ErrorCodes.internalError, 'Internal server error', exc);
	}

	static documentNotFound(collectionName: string, documentId: string, exc?: Error) {
		return new FirestoreErrorManager(
			ErrorCodes.documentNotFound,
			`Error getting document id "${documentId}" from "${collectionName}" collection`,
			exc
		);
	}

	static documentNotSaved(collectionName: string, documentId: string, exc?: Error) {
		return new FirestoreErrorManager(
			ErrorCodes.documentNotSaved,
			`Error storing document id "${documentId}" on "${collectionName}" collection`,
			exc
		);
	}

	static documentNotDeleted(collectionName: string, documentId: string, exc?: Error) {
		return new FirestoreErrorManager(
			ErrorCodes.documentNotDeleted,
			`Error deleting document id "${documentId}" on "${collectionName}" collection`,
			exc
		);
	}

	static invalidParameters(parameters: string[]) {
		return new FirestoreErrorManager(
			ErrorCodes.invalidParameters,
			`Invalid parameters: ${JSON.stringify(parameters)}`
		);
	}
}
