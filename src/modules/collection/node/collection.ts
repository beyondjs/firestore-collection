import { CollectionReference, DocumentReference, DocumentSnapshot, Transaction } from 'firebase-admin/firestore';
import type { PartialWithFieldValue } from 'firebase-admin/firestore';
import { Response } from '@beyond-js/firestore-collection/response';
import { ErrorGenerator } from '@beyond-js/firestore-collection/errors';
import { db } from '@beyond-js/firestore-collection/db';
import { CollectionBatch } from './batch';
import type { FirestoreErrorManager } from '@beyond-js/firestore-collection/errors';

export /*bundle*/ interface ICollectionDataResponse<DataType> {
	doc?: DocumentReference<DataType>;
	snapshot?: DocumentSnapshot<DataType>;
	exists?: boolean;
	data?: DataType;
	error?: FirestoreErrorManager;
}

export /*bundle*/ type CollectionResponseType<DataType> = Response<ICollectionDataResponse<DataType>>;
export /*bundle*/ type CollectionDatasetResponseType<DataType> = Response<ICollectionDataResponse<DataType>>[];

interface IDataParams {
	id: string;
	parents?: Record<string, string>;
	transaction?: Transaction;
}

interface IDatasetParams {
	records: {
		id: string;
		parents?: Record<string, string>;
	}[];
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
	get parent() {
		return this.#parent;
	}

	constructor(name: string, parent?: Collection<any>) {
		this.#name = name;
		this.#parent = parent;
	}

	/**
	 * 	Method to get a CollectionReference, optionally in the context of a parent
	 * @param params
	 * @returns
	 */
	col(params?: { parents?: Record<string, string> }): CollectionReference<DataType> {
		params = params ? params : {};
		const { parents } = this.#params(Object.assign({ col: true }, params));
		if (!this.#parent) return <CollectionReference<DataType>>db.collection(this.#name);

		const docId = parents[this.#parent.#name];
		return <CollectionReference<DataType>>this.#parent!.col({ parents }).doc(docId).collection(this.#name);
	}

	/**
	 * Validates and returns the 'id' and 'parents' parameters.
	 *
	 * This method ensures the 'parents' parameter is correctly provided based on whether the collection is intended
	 * to be a sub-collection.
	 *
	 * - Throws an error if 'parents' is provided but the collection is not a sub-collection.
	 * - Throws an error if 'parents' is not provided but the collection is a sub-collection.
	 *
	 * @param params Object containing optional 'id' and 'parents' fields.
	 * @returns An object containing the validated 'id' and 'parents' fields.
	 */
	#params(params: { id?: string; parents?: Record<string, string>; col?: boolean }) {
		const { id, parents, col } = params;

		if (!col && !id) throw new Error('Parameter "id" was expected but not received.');

		// Check the parents are correctly set if current collection is a subcollection
		if (this.#parent) {
			let parent: Collection<any> = this;

			// If 'parents' is not provided but the collection is a sub-collection, throw an error.
			// This ensures that 'parents' must be provided when the collection is a sub-collection.
			if (!parents) {
				throw new Error(
					'The parameter "parents" was not received, but it should only be provided if the collection is not a subcollection.'
				);
			}

			while (true) {
				parent = parent.parent;
				if (!parent) break;
				if (!parents.hasOwnProperty(parent.name) || typeof parents[parent.name] !== 'string') {
					throw new Error(`Id of parent collection "${parent.name}" not set`);
				}
			}
		}

		return { id, parents };
	}

	doc(params: { id: string; parents?: Record<string, string> }): DocumentReference<DataType> {
		const { id, parents } = this.#params(params);
		return this.col({ parents }).doc(id!);
	}

	/**
	 * Fetches the document snapshot from Firestore.
	 *
	 * If a transaction is provided, this method uses the transaction context to fetch the document,
	 * allowing it to be part of an ongoing transaction managed by the caller. This is particularly useful
	 * when multiple read/write operations need to be atomic.
	 *
	 * - If `transaction` is provided, it calls `transaction.get(docRef)` to retrieve the document within the transaction.
	 * - If `transaction` is not provided, it simply fetches the document using `.doc(docRef)`.
	 *
	 * This method is designed to work within the context of a transaction created and managed by the caller.
	 * The caller is expected to have started the transaction using `runTransaction` and pass the transaction object
	 * to this method. If the transaction is not provided, the method defaults to a regular document fetch.
	 *
	 * @param params - An object containing:
	 *  - `id`: The document ID to fetch.
	 *  - `parents`: An optional object mapping parent collection names to their IDs (used for subcollections).
	 *  - `transaction`: An optional transaction object, which should be part of a `runTransaction` context if provided.
	 * @returns A `Response` object containing either the document reference and snapshot data or an error if the document is not found.
	 */
	async snapshot(params: {
		id: string;
		parents?: Record<string, string>;
		transaction?: Transaction;
	}): Promise<Response<{ doc?: DocumentReference<DataType>; snapshot?: DocumentSnapshot<DataType> }>> {
		const { transaction } = params;

		try {
			const doc = this.doc(params);
			const snapshot = await (transaction ? transaction.get(doc) : await doc.get());

			return new Response({ data: { doc, snapshot } });
		} catch (exc) {
			const error = ErrorGenerator.documentNotFound(this.#name, params.id, exc);
			return new Response({ error });
		}
	}

	/**
	 * Process a single data document
	 *
	 * @param params
	 * @returns
	 */
	async data(params: IDataParams): Promise<CollectionResponseType<DataType>> {
		const response = await this.snapshot(params);
		if (response.error) return response;

		const { doc, snapshot } = response.data;
		const exists = snapshot!.exists;
		const data = exists ? snapshot!.data() : void 0;
		const error = exists ? void 0 : ErrorGenerator.documentNotFound(this.#name, params.id);

		return new Response({ data: { doc, snapshot, exists, data, error } });
	}

	async dataset(params: IDatasetParams): Promise<CollectionDatasetResponseType<DataType>> {
		const { records, transaction } = params;

		const promises: Promise<Response<ICollectionDataResponse<DataType>>>[] = [];
		records.forEach(({ id, parents }) => promises.push(this.data({ id, parents, transaction })));
		return await Promise.all(promises);
	}

	async set(params: {
		id?: string;
		parents?: Record<string, string>;
		data: DataType;
		transaction?: Transaction;
	}): Promise<Response<{ stored: boolean }>> {
		const { transaction, parents, data } = params;
		const id = params.id ? params.id : (<any>params.data)?.id;
		this.#params({ id, parents });

		const doc = this.doc({ id, parents });

		try {
			await (transaction ? transaction.set(doc, data) : doc.set(data));
			return new Response({ data: { stored: true } });
		} catch (exc) {
			const error = ErrorGenerator.documentNotSaved(this.#name, id);
			return new Response({ error });
		}
	}

	async merge(params: {
		id?: string;
		parents?: Record<string, string>;
		data: PartialWithFieldValue<DataType>;
		transaction?: Transaction;
	}): Promise<Response<{ stored: boolean }>> {
		const { transaction, parents, data } = params;
		const id = params.id ? params.id : (<any>params.data)?.id;
		this.#params({ id, parents });

		const doc = this.doc({ id, parents });

		try {
			await (transaction ? transaction.set(doc, data, { merge: true }) : doc.set(data, { merge: true }));
			return new Response({ data: { stored: true } });
		} catch (exc) {
			const error = ErrorGenerator.documentNotSaved(this.#name, id);
			return new Response({ error });
		}
	}

	async delete(params: {
		id: string;
		parents?: Record<string, string>;
		transaction?: Transaction;
	}): Promise<Response<{ deleted: boolean }>> {
		const { transaction, parents } = params;
		const id = params.id;

		const error = id ? void 0 : ErrorGenerator.invalidParameters(['id']);
		if (error) return new Response({ error });

		this.#params({ id, parents });
		const doc = this.doc({ id, parents });

		try {
			await (transaction ? transaction.delete(doc) : doc.delete());
			return new Response({ data: { deleted: true } });
		} catch (exc) {
			const error = ErrorGenerator.documentNotDeleted(this.#name, id);
			return new Response({ error });
		}
	}
}

export /*bundle*/ class SubCollection<DataType> extends Collection<DataType> {
	constructor(name: string, parent: Collection<any>) {
		super(name, parent);
	}

	col(params: { parents: Record<string, string> }) {
		return super.col(params);
	}

	doc(params: { id: string; parents: Record<string, string>; transaction?: Transaction }) {
		return super.doc(params);
	}

	async snapshot(params: { id: string; parents: Record<string, string>; transaction?: Transaction }) {
		return super.snapshot(params);
	}

	async data(params: { id: string; parents: Record<string, string>; transaction?: Transaction }) {
		return await super.data(params);
	}

	async delete(params: { id: string; parents: Record<string, string>; transaction?: Transaction }) {
		return await super.delete(params);
	}
}
