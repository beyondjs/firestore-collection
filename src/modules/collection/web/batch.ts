import type { WriteBatch } from 'firebase/firestore';
import type { Collection } from './collection';

export class CollectionBatch<DataType> {
	#collection: Collection<DataType>;

	constructor(collection: Collection<DataType>) {
		this.#collection = collection;
	}

	#doc(params: { id?: string; parents?: Record<string, string>; batch: WriteBatch; data: DataType }) {
		const { parents, data } = params;
		const id = params.id ? params.id : (<any>data).id;
		return this.#collection.doc({ id, parents });
	}

	// // params.batch.create is not available in web environment
	// create(params: { id?: string; parents?: Record<string, string>; batch: WriteBatch; data: DataType }) {
	// 	const doc = this.#doc(params);
	// 	params.batch.create(doc, params.data);
	// }

	set(params: { id?: string; parents?: Record<string, string>; batch: WriteBatch; data: DataType }) {
		const doc = this.#doc(params);
		params.batch.set(doc, params.data);
	}
}
