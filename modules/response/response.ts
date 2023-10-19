import { FirestoreErrorManager } from '@beyond-js/firestore-collection/errors';
import { Response as ResponseBase } from '@beyond-js/response/main';

export /*bundle*/ class Response<DataType> extends ResponseBase<DataType> {
	#error: FirestoreErrorManager;
	get error() {
		return this.#error;
	}

	constructor(params: { error?: FirestoreErrorManager; data?: DataType }) {
		super(params);
	}
}
