# Managing Subcollections in Firestore

## Overview

Firestore provides a flexible, hierarchical data model that allows for the structuring of data into collections,
documents, and subcollections. To effectively manage this data model, developers utilize specialized classes that
simplify interactions with different levels of this hierarchy. The `Collection` and `SubCollection` classes are used to
define and manipulate data within Firestore collections and their nested subcollections.

By using `Collection` and `SubCollection` classes and properly structuring data models, Firestore allows developers to
create intuitive and scalable data hierarchies. This structured approach facilitates the organization of related data
and operations on nested subcollections.

## Defining Data Models

The first step in working with Firestore is to define the data models that will be used within the collections. These
are typically represented as interfaces in TypeScript, which provide a clear structure for the data. Here is an example
of data models for a user and order system:

```typescript
// Define the user data model
interface IUserData {
	userId: string; // A unique identifier for the user
	name: string; // The name of the user
}

// Define the order data model
interface IOrderData {
	orderId: string; // A unique identifier for the order
	orderDate: Date; // The date the order was placed
	// ... other relevant order properties
}

// Define the item data model
interface IItemData {
	itemId: string; // A unique identifier for the item
	description: string; // A description of the item
	// ... other relevant item properties
}
```

## Extending Collections with Subcollections

The `Collection` class can be extended to include subcollections. This allows for a structured and intuitive approach to
managing related data. For example, a `Users` collection may contain a subcollection of `Orders`, which in turn could
contain a subcollection of `Items`. Here’s how you can structure this relationship:

```typescript
// Import the Collection and SubCollection classes
import { Collection, SubCollection } from '@beyond-js/firestore-collection/collection';

// Extend the Collection class to create a Users collection
class Users extends Collection<IUserData> {
	#orders: SubCollection<IOrderData>;

	constructor(userId: string) {
		super('users'); // Initialize the top-level collection with the name 'users'
		this.#orders = new SubCollection<IOrderData>('orders', this); // Initialize the orders subcollection
	}

	// Expose the orders subcollection through a getter
	get orders() {
		return this.#orders;
	}
}

// Further extend the SubCollection class to include an Items subcollection
class Orders extends SubCollection<IOrderData> {
	#items: SubCollection<IItemData>;

	constructor(orderId: string, parent: Collection<IUserData>) {
		super('orders', parent); // Initialize the orders subcollection
		this.#items = new SubCollection<IItemData>('items', this); // Initialize the items subcollection
	}

	// Expose the items subcollection through a getter
	get items() {
		return this.#items;
	}
}
```

In this setup, `Users` is a collection with a subcollection `Orders`. The `Orders` class itself is a subcollection that
contains another subcollection `Items`. Each level provides a getter to access its subcollection, maintaining a clear
path from users to orders to items.

## Working with the Hierarchy

To add data to the third-level `Items` subcollection, you would follow these steps:

```typescript
// Instantiate the Users collection
const users = new Users('user123');

// Access the Orders subcollection from the Users instance
const userOrders = users.orders;

// Add a new order to the Orders subcollection
const newOrderData: IOrderData = { orderId: 'order456', orderDate: new Date() /*, ... */ };
await userOrders.set({ id: 'order456', data: newOrderData });

// Access the Items subcollection from the Orders instance
const orderItems = new Orders('order456', users).items;

// Add a new item to the Items subcollection
const newItemData: IItemData = { itemId: 'item789', description: 'A new item' /*, ... */ };
await orderItems.set({ id: 'item789', data: newItemData });
```

This example demonstrates how to add an order to a user and then add an item to that order, using the hierarchical
structure provided by `Collection` and `SubCollection` classes.
