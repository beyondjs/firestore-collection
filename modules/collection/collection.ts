import { CollectionReference, DocumentReference, DocumentSnapshot, Transaction } from 'firebase-admin/firestore';
import { DataResponse } from '@aimpact/ailearn-api/data/response';
import { ErrorGenerator, DataErrorManager } from '@aimpact/ailearn-api/data/errors';
import { db } from '@aimpact/ailearn-api/data/firestore-db';
import { CollectionBatch } from './batch';

export /*bundle*/ interface ICollectionDataResponse<DataType> {
	doc?: DocumentReference<DataType>;
	snapshot?: DocumentSnapshot<DataType>;
	exists?: boolean;
	data?: DataType;
	error?: DataErrorManager;
}

export /*bundle*/ type CollectionDataResponseType<DataType> = DataResponse<ICollectionDataResponse<DataType>>;
export /*bundle*/ type CollectionDatasetResponseType<DataType> = DataResponse<ICollectionDataResponse<DataType>>[];

interface IDataParams {
	id: string;
	parent?: string;
	transaction?: Transaction;
}

interface IDatasetParams {
	ids: string[];
	parent?: string;
	transaction?: Transaction;
}

/**
 * Generic class to handle Firestore collections and subcollections
 */
export /*bundle*/ class Collection<DataType> {
	#name: string;
	get name() {
		return this.#name;
	}

	#batch: CollectionBatch<DataType> = new CollectionBatch(this);
	get batch() {
		return this.#batch;
	}

	#parent?: Collection<any>;

	constructor(name: string, parent?: Collection<any>) {
		this.#name = name;
		this.#parent = parent;
	}

	/**
	 * 	Method to get a CollectionReference, optionally in the context of a parent
	 * @param params
	 * @returns
	 */
	col(params?: { parent?: string }): CollectionReference<DataType> {
		params = params ? params : {};
		const { parent } = this.#params(params);
		if (!parent) return <CollectionReference<DataType>>db.collection(this.#name);

		return <CollectionReference<DataType>>this.#parent!.col({ parent }).doc(parent).collection(this.#name);
	}

	/**
	 * Validates and returns the 'id' and 'parent' parameters.
	 *
	 * This method ensures the 'parent' parameter is correctly provided based on whether the collection is intended
	 * to be a sub-collection.
	 *
	 * - Throws an error if 'parent' is provided but the collection is not a sub-collection.
	 * - Throws an error if 'parent' is not provided but the collection is a sub-collection.
	 *
	 * @param params Object containing optional 'id' and 'parent' fields.
	 * @returns An object containing the validated 'id' and 'parent' fields.
	 */
	#params(params: { id?: string; parent?: string }) {
		const { id, parent } = params;

		if (!id) throw new Error('Parameter "id" was expected but not received.');

		// If 'parent' is provided but the collection isn't a sub-collection, throw an error.
		// This ensures that 'parent' is only provided for sub-collections.
		if (parent && !this.#parent) {
			throw new Error(
				'The parameter "parent" was received, but it should only be provided if the collection is a subcollection.'
			);
		}

		// If 'parent' is not provided but the collection is a sub-collection, throw an error.
		// This ensures that 'parent' must be provided when the collection is a sub-collection.
		if (!parent && this.#parent) {
			throw new Error(
				'The parameter "parent" was not received, but it should only be provided if the collection is not a subcollection.'
			);
		}
		return { id, parent };
	}

	doc(params: { id: string; parent?: string }): DocumentReference<DataType> {
		const { id } = this.#params(params);
		return this.col(params).doc(id!);
	}

	async snapshot(params: {
		id: string;
		parent?: string;
		transaction?: Transaction;
	}): Promise<DataResponse<{ doc?: DocumentReference<DataType>; snapshot?: DocumentSnapshot<DataType> }>> {
		const { transaction } = params;

		try {
			const doc = this.doc(params);
			const snapshot = await (transaction ? transaction.get(doc) : await doc.get());

			return new DataResponse({ data: { doc, snapshot } });
		} catch (exc) {
			const error = ErrorGenerator.documentNotFound(this.#name, params.id, exc);
			return new DataResponse({ error });
		}
	}

	/**
	 * Process a single data document
	 *
	 * @param params
	 * @returns
	 */
	async data(params: IDataParams): Promise<CollectionDataResponseType<DataType>> {
		const response = await this.snapshot(params);
		if (response.error) return response;

		const { doc, snapshot } = response.data;
		const exists = snapshot!.exists;
		const data = exists ? snapshot!.data() : void 0;
		const error = exists ? void 0 : ErrorGenerator.documentNotFound(this.#name, params.id);

		return new DataResponse({ data: { doc, snapshot, exists, data, error } });
	}

	async dataset(params: IDatasetParams): Promise<CollectionDatasetResponseType<DataType>> {
		const { ids, parent, transaction } = params;

		const promises: Promise<DataResponse<ICollectionDataResponse<DataType>>>[] = [];
		ids.forEach(id => promises.push(this.data({ id, parent, transaction })));
		return await Promise.all(promises);
	}

	async set(params: {
		id?: string;
		parent?: string;
		data: DataType;
		transaction?: Transaction;
	}): Promise<DataResponse<{ stored: boolean }>> {
		const { transaction, parent, data } = params;
		const id = params.id ? params.id : (<any>params.data)?.id;
		this.#params({ id, parent });

		const doc = this.doc({ id, parent });

		try {
			await (transaction ? transaction.set(doc, data) : doc.set(data));
			return new DataResponse({ data: { stored: true } });
		} catch (exc) {
			const error = ErrorGenerator.documentNotSaved(this.#name, id);
			return new DataResponse({ error });
		}
	}

	async merge(params: {
		id?: string;
		parent?: string;
		data: Partial<DataType>;
		transaction?: Transaction;
	}): Promise<DataResponse<{ stored: boolean }>> {
		const { transaction, parent, data } = params;
		const id = params.id ? params.id : (<any>params.data)?.id;
		this.#params({ id, parent });

		const doc = this.doc({ id, parent });

		try {
			await (transaction ? transaction.set(doc, data, { merge: true }) : doc.set(data, { merge: true }));
			return new DataResponse({ data: { stored: true } });
		} catch (exc) {
			const error = ErrorGenerator.documentNotSaved(this.#name, id);
			return new DataResponse({ error });
		}
	}
}

export /*bundle*/ class SubCollection<DataType> extends Collection<DataType> {
	col(params: { parent: string }) {
		return super.col(params);
	}

	doc(params: { id: string; parent: string; transaction?: Transaction }) {
		return super.doc(params);
	}

	async snapshot(params: { id: string; parent: string; transaction?: Transaction }) {
		return super.snapshot(params);
	}

	async data(params: { id: string; parent: string; transaction?: Transaction }) {
		return await super.data(params);
	}
}
