import { DataErrorManager } from '@beyond-js/firestore-collection/errors';
import { Response as ResponseBase } from '@beyond-js/response/main';

export /*bundle*/ class Response<DataType> extends ResponseBase<DataType> {
	#error: DataErrorManager;
	get error() {
		return this.#error;
	}

	constructor(params: { error?: DataErrorManager; data?: DataType }) {
		super(params);
	}
}
