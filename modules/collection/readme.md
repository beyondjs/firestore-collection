# Collections Module

## Overview

The `Collections` module provides a TypeScript class for simplifying interactions with Firestore collections and
documents. Utilizing the power of TypeScript's strong typing, this class aims to make it easier to handle CRUD
operations in Firestore.

## Features

-   Strongly typed operations via TypeScript.
-   Methods for retrieving a collection or a document.
-   Asynchronous methods for fetching document snapshots.
-   Integrated error handling using the `ModelError` class from the `Errors` module.
-   Uniform API responses using the `Response` class.

## Usage

To include this module in your project, import it as follows:

```typescript
import { Collection } from '@aimpact/ailearn-api/db';
```

### Initialization

Create a new `Collection` object by specifying the Firestore collection name.

```typescript
const users = new Collection<UserType>('Users');
```

### Fetching a Collection

Retrieve a Firestore collection reference.

```typescript
const collection = users.col();
```

### Fetching a Document

Retrieve a Firestore document reference.

```typescript
const doc = users.doc({ id: '...', parent: '...' });
```

### Fetching a Document Snapshot

Get a snapshot of a document asynchronously.

```typescript
const response = await users.snapshot({ id: '...', parent: '...' });
```

### Fetching Document Data

Fetch document data along with additional metadata asynchronously.

```typescript
const response = await users.data({ id: '...', parent: '...' });
```

### Error Handling

The `Collections` class uses `ModelError` for error encapsulation and returns it as part of a `Response` object.

```typescript
const response = await users.data({ id: 'nonexistentId', parent: '...' });
if (response.error) return response.error;
if (!response.data.exists) return response.data.error;
```

## API Reference

-   `Collection<DataType>`: Generic class for managing Firestore collections.
-   `col(params?: { parent?: string })`: Method to get a collection reference.
-   `doc(params: { id: string; parent: string })`: Method to get a document reference.
-   `snapshot(params: { id: string; parent: string })`: Asynchronous method to fetch a document snapshot.
-   `data(params: { id: string; parent: string })`: Asynchronous method to fetch document data along with metadata.
