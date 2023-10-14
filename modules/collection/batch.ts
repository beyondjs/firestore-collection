import type { WriteBatch } from 'firebase-admin/firestore';
import type { Collection } from './collection';

export class CollectionBatch<DataType> {
	#collection: Collection<DataType>;

	constructor(collection: Collection<DataType>) {
		this.#collection = collection;
	}

	#doc(params: { id?: string; parent?: string; batch: WriteBatch; data: DataType }) {
		const { parent, data } = params;
		const id = params.id ? params.id : (<any>data).id;
		return this.#collection.doc({ id, parent });
	}

	create(params: { id?: string; parent?: string; batch: WriteBatch; data: DataType }) {
		const doc = this.#doc(params);
		params.batch.create(doc, params.data);
	}

	set(params: { id?: string; parent?: string; batch: WriteBatch; data: DataType }) {
		const doc = this.#doc(params);
		params.batch.set(doc, params.data);
	}
}
