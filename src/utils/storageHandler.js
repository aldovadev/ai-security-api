import { Storage } from '@google-cloud/storage';

const bucketName = 'asa-file-storage';
const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const storage = new Storage({ keyFilename });

const bucket = storage.bucket(bucketName);

export default bucket;
