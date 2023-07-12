import { jest } from '@jest/globals';
import { njkToPdf } from '../src';
import { AWS } from 'aws-sdk';

describe('index', () => {
  describe('njkToPdf', () => {
    it('should return a string containing the message', async () => {
      AWS.config.update({
        accessKeyId: 'AKIAZKIZH2JYYV42XI7V',
        secretAccessKey: '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',
        region: 'us-east-1',
      });

      const s3 = new AWS.S3();

      // Generate a signed URL for uploading a file
      const signedUrlParams = {
        Bucket: 'cerebruminc-dev',
        Key: 'generated-pdfs/test-file.pdf',
        Expires: 3600, // URL expiration time in seconds
        ContentType: 'text/plain', // Set the appropriate content type for your file
      };

      const uploadUrl = await s3.getSignedUrlPromise(
        'putObject',
        signedUrlParams
      );

      const result = await njkToPdf({
        apiKey: '4cf63c63-acf3-4fc5-9387-73c4741f9a66',
        njkTemplate:
          '<!DOCTYPE html> <html> <head> <title>{{ title }}</title> </head> <body> <h1>{{ greeting }}</h1> <ul> {% for item in items %} <li>{{ item }}</li> {% endfor %} </ul> </body> </html> ',
        jsonData: {
          title: 'My Web Page',
          greeting: 'Welcome!',
          items: ['Item 1', 'Item 2', 'Item 3'],
        },
        fileName: 'test.pdf',
        presignedUploadUrl: `${uploadUrl}`,
      });

      expect(result).toBeTruthy;
    });
  });
});
