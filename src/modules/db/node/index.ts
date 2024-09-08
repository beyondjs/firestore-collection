import type { Credential } from 'firebase-admin/app';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import { join } from 'path';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config();
const { PROJECT_ID } = process.env;

const file = join(process.cwd(), './credentials/gcloud.json');

const specs: { credential?: Credential; projectId?: string } = {};
specs.credential = fs.existsSync(file) ? admin.credential.cert(file) : void 0;
specs.projectId = PROJECT_ID ? PROJECT_ID : void 0;

initializeApp(specs.credential || specs.projectId ? specs : void 0);

export /*bundle*/ const db = getFirestore();
