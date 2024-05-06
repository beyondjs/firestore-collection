import { myCollection } from './collection';
import { FirestoreErrorManager } from '@beyond-js/firestore-collection/errors';

console.log(11);

export /*bundle*/ class MyModel {
	static async data(id: string) {
		const response = await myCollection.data({ id });

		if (response.error) {
			return response;
		}
		if (!response.data.exists) {
			return { error: response.data.error };
		}
		return { data: response.data.data };
	}

	static async save(params) {
		try {
			const specs = { data: params };

			console.log(1, specs, specs.data);

			const response = await myCollection.set(specs);

			console.log(1, response);
			if (response.error) return new FirestoreErrorManager(response.error.code, response.error.text);

			return await myCollection.data({ id: params.id });
		} catch (exc) {
			return exc;
		}
	}

	static async delete(id: string) {
		console.log(8, { id });
		const response = await myCollection.delete({ id });
		if (response.error) {
			return response;
		}
		return { data: response.data.deleted };
	}
}
