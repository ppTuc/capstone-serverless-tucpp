// DONE: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'vmcaxuh86b'
export const apiEndpoint = `https://${apiId}.execute-api.eu-west-2.amazonaws.com/dev`

export const authConfig = {
  // DONE: reate an Auth0 application and copy values from it into this map
  domain: 'dev-r35epbqy.us.auth0.com',  // Auth0 domain
  clientId: 'HRbRU3KPwgMGJfgmdA09r5oVvqcyJuO8',  // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
