const test = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');

// Mock external modules used by the handler
const mocks = {
  axios: { post: async () => ({ status: 200 }) },
  '@azure/identity': { DefaultAzureCredential: function() {} },
  '@azure/keyvault-secrets': {
    SecretClient: class {
      async getSecret() { return { value: 'dummy' }; }
    }
  }
};

const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (mocks[request]) {
    return mocks[request];
  }
  return originalLoad(request, parent, isMain);
};

const handler = require('./index');
Module._load = originalLoad;

process.env.KEYVAULT_URL = 'https://example.com';

test('returns a response body when ipAddresses are provided', async () => {
  const context = { log: () => {}, res: null };
  const req = { body: { ipAddresses: ['1.1.1.1'] } };

  await handler(context, req);

  assert.ok(context.res, 'context.res should be defined');
  assert.ok(context.res.body, 'response body should be defined');
});
