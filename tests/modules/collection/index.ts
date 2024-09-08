import { Collection } from '@beyond-js/firestore-collection/collection';

interface IMyCollection {
	id: string;
	name: string;
}

class MyCollection extends Collection<IMyCollection> {
	constructor() {
		super('MyCollection');
	}
}

export /*bundle*/ const myCollection: Collection<IMyCollection> = new MyCollection();
