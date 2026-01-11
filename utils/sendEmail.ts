var SibApiV3Sdk = require("sib-api-v3-sdk");
var defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
var apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;
var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendinblue = (sendSmtpEmail: any): Promise<any> => {
  return apiInstance.sendTransacEmail(sendSmtpEmail);
};

export default sendinblue;
