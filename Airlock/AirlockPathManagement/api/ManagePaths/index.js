module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    const responseMessage = "This is a test function";

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
}
