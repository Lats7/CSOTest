const axios = require('axios');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request to delete assets.');

    // Retrieve IP addresses from request body
    const ipAddresses = req.body.ipAddresses;

    // Get Key Vault URL from environment variables
    const keyVaultUrl = process.env["KEYVAULT_URL"];

    if (!keyVaultUrl) {
        context.res = {
            status: 400, // Bad Request
            body: "Key Vault URL is not configured in environment variables"
        };
        return;
    }

    const credential = new DefaultAzureCredential();
    const client = new SecretClient(keyVaultUrl, credential);

    // Retrieve Tenable API keys from Azure Key Vault
    const tenableAccessKey = await client.getSecret('TenableAccessKey');
    const tenableSecretKey = await client.getSecret('TenableSecretKey');

    const headers = {
        "accept": "application/json",
        "X-ApiKeys": `accessKey=${tenableAccessKey.value}; secretKey=${tenableSecretKey.value}`
    };

    for (const ip of ipAddresses) {
        try {
            const response = await axios.post(
                "https://cloud.tenable.com/api/v2/assets/bulk-jobs/delete",
                { query: { field: "ipv4", operator: "eq", value: ip } },
                { headers: headers }
            );

            if (response.status === 200) {
                context.log(`Successfully initiated deletion for IP: ${ip}`);
            } else {
                context.log(`The deletion request has been accepted and is being processed. This does not mean the deletion is complete yet: ${ip}, Status Code: ${response.status}`);
            }
        } catch (error) {
            context.log(`Error deleting asset with IP: ${ip}`, error.message);
            context.res = {
                status: 500, // Internal Server Error
                body: `An error occurred while processing IP: ${ip}`
            };
            return;
        }
    }

    context.res = {
        body: "Asset deletion process initiated for all provided IP addresses"
    };
};

