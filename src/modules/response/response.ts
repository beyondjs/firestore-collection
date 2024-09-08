import { FirestoreErrorManager } from '@beyond-js/firestore-collection/errors';
import { Response as ResponseBase } from '@beyond-js/response/main';

export /*bundle*/ class Response<DATA> extends ResponseBase<DATA, FirestoreErrorManager> {
	constructor(params: { error?: FirestoreErrorManager; data?: DATA }) {
		super(params);
	}
}
