
## Getting Started

First you need to create a developer account on [Auth0](https://auth0.com/) or in any service you want to connect to your app.

Then you need to create a new application on the website. You can follow the [tutorial](https://auth0.com/docs/get-started/create-apps) to do that.

Before any other step, you need to get your credentials from the application you just created (`client_id` and `client_secret`). You can find them in the settings of your application. Also, dont forget to configure the `Allowed Callback URLs` field (this field needs to be the same as the `redirect_uri` used in the authorization url). For some situations you also going to need `Allowed Logout URLs` field.

To get `issuer` and `jwks_uri` fields you need to look in OpenID Configuration URL. You can find it in the settings of your application.

Then you need to create a `.env` file in the root of the project and add the following variables:

```env
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
OAUTH_ISSUER=
OAUTH_APP_NAME=MY APP
OAUTH_REDIRECT_URI=
```

`Authorization Endpoint` and `Token Endpoint` can be found in the OpenID Configuration URL.

## Authorization Code Flow for Web Apps


Authorization Request
```
https://example/authorize?
  response_type=code&
  client_id={YOUR_CLIENT_ID}&
  state={RANDOM_STRING}&
  redirect_uri={REDIRECT_URI}&
  code_challenge={YOUR_CODE_CHALLENGE}&
  code_challenge_method=S256
```

In some situation to get access to specific scopes you need to add `scope` parameter to the request.
```
https://example/authorize?
  response_type=code&
  client_id={YOUR_CLIENT_ID}&
  state={RANDOM_STRING}&
  redirect_uri={REDIRECT_URI}&
  code_challenge={YOUR_CODE_CHALLENGE}&
  code_challenge_method=S256&
  scope=openid profile email // you need to check the scopes you want to use in each documentation
```

From this request you will get an url with the following format:
```
{REDIRECT_URI}?code={YOUR_AUTHORIZATION_CODE}&state={RANDOM_STRING}
```

Use this code to get the access token.

Create token request
```
curl -X POST https://example/oauth/token \
  -d grant_type=authorization_code \
  -d redirect_uri={REDIRECT_URI} \
  -d client_id={YOUR_CLIENT_ID} \
  -d client_secret={YOUR_CLIENT_SECRET} \
  -d code_verifier={YOUR_CODE_VERIFIER} \
  -d code={YOUR_AUTHORIZATION_CODE}
```

the response of this request will be access_token, its expiration date, its type and refresh_token. (some API wont return refresh_token)
```
{
	"access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFDZWRack1lMW5UdDhERkVob1dGciJ9...",
  "refresh_token": "ogvRRTh0628exarvChil4pK3XVLQWC2WoLR31xxtY-1mP",
	"scope": "offline_access",
	"expires_in": 86400,
	"token_type": "Bearer"
}
```

For refresh token you need to use the following request format:
```
curl -X POST https://example/oauth/token \
  -d grant_type=refresh_token \
  -d client_id={YOUR_CLIENT_ID} \ 
  -d client_secret={YOUR_CLIENT_SECRET} \
  -d refresh_token={REFRESH_TOKEN}
```

## OpenID Connect flow

So far the flow is the same as the Authorization Code Flow for Web Apps, but now we need to add `id_token` to the response. And for that we need to add `openid` to the scope parameter. You can also add `profile` and `email` to get more information about the user.

At the end the token response would be
```
{
	"access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFDZWRack1lMW5UdDhERkVob1dGciJ9....",
	"id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFDZWRack1lMW5UdDhERkVob1dGciJ9.eyJnaXZlbl9uYW1lIjoiRmVybmFuZGEiLCJmYW1pbHlfbmFtZSI6IlBlbm5hIiwibmlja25hbWUiOiJmZXJuYW5kYS5wYW5kYSIsIm5hbWUiOi...",
	"scope": "openid profile email",
	"expires_in": 86400,
	"token_type": "Bearer"
}
```

You can use the `id_token` to get the user information.
You access this information using any base64url tool https://example-app.com/base64


## PKCE (Proof Key for Code Exchange)

is an essential security enhancement to the OAuth 2.0 authorization flow, designed to prevent certain types of attacks and protect sensitive user data. It was introduced to address a specific vulnerability in the authorization code flow known as the "Authorization Code Interception" attack.

In the traditional OAuth 2.0 authorization code flow, the client (application) redirects the user to the authorization server to grant permissions. The authorization server then returns an authorization code to the client, which is exchanged for an access token to access the protected resources on behalf of the user.

However, the initial OAuth 2.0 authorization code flow has a potential security weakness when used in public clients (such as mobile apps or single-page web applications) due to the fact that the client secret is not securely stored in these environments. This could allow malicious actors to intercept the authorization code during the redirection process from the authorization server to the client and use it to request access tokens, posing a security risk.

PKCE addresses this vulnerability by adding an extra step to the OAuth 2.0 authorization code flow. The client generates a random value called the "code verifier" and computes its SHA-256 hash, creating the "code challenge." The code challenge is sent to the authorization server along with the initial authorization request. The authorization server stores this code challenge temporarily.

To create `code_verifier` you need to create a random string with 43 characters. You can use the following code 

https://tonyxu-io.github.io/pkce-generator/

The `state` parameter was originally used for CSRF protection, but PKCE provides that. Therefore, Because of PCKE you don't need to worry about state parameter anymore. Nowadays you can use it for storing application-specific state, such as which page to redirect the user to after they log in, cart or checkout.

If the server doesn't support PKCE, then you will still need to make the state a random value for each request.

You also need to include the `code_challenge_method` parameters in the authorization request. 

The `code_challenge_method` parameter is optional and defaults to `plain`. The `code_challenge` parameter is required and must be a Base64 URL-encoded string of the SHA-256 hash of the `code_verifier` string.


[further readings](https://pazel.dev/teach-me-pkce-proof-key-for-code-exchange-in-5-minutes)



## What's next?
We put together a few examples of how to use Express OpenID Connect in more advanced use cases:

- [Route customization](https://github.com/auth0/express-openid-connect/blob/master/EXAMPLES.md#2-route-customization)
- [Custom user session handling](https://github.com/auth0/express-openid-connect/blob/master/EXAMPLES.md#4-custom-user-session-handling)
- [Obtaining access tokens for external APIs](https://github.com/auth0/express-openid-connect/blob/master/EXAMPLES.md#5-obtaining-and-storing-access-tokens-to-call-external-apis)
- [Require auth for specific routes](https://github.com/auth0/express-openid-connect/blob/master/EXAMPLES.md#2-require-authentication-for-specific-routes)


## Materials

- https://auth0.com/docs/get-started/authentication-and-authorization-flow
- https://oauth.school/
- https://oauth.net/code/nodejs/
- https://fusionauth.io/articles/oauth/modern-guide-to-oauth
- https://www.oauth.com/playground/
- https://developers.google.com/oauthplayground/
- https://developer.pingidentity.com/en/tools.html
- https://github.com/auth0/express-openid-connect/blob/master/EXAMPLES.md#2-route-customization