# BeyondJS Firestore Collection

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

### Authentication and Configuration

During development, the `Collection` class will attempt to authenticate using the credentials specified in a local JSON
file (`credentials/gcloud.json`). Place this file in the root of your project and ensure it contains valid Firebase
credentials. If the file is found, it will be used as the primary method for authentication. If not present, the class
defaults to using the credentials of the associated Google Cloud service account.

**Important:**

-   **Local Development**: We recommend you to use a service account only in local environment. Ensure you include the
    `credentials` path in your `.gitignore` file to prevent uploading sensitive information to version control.
-   **Production Deployment**: When deploying your application, avoid using service account credentials. Instead, rely
    on the identity and access management (IAM) configurations that are native to the environment where your application
    is hosted (e.g., Google Cloud IAM roles).

### Initialization

To include this module in your project, import it as follows:

```typescript
import { Collection } from '@beyond-js/firestore-collection/collection';
```

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
