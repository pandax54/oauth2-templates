# OAUTH 2.0

The OAuth 2.0 authorization framework is a protocol that allows a user to grant a third-party web site or application access to the user’s protected resources, without necessarily revealing their long-term credentials or even their identity.


## OAuth2.0 vs OIDC
The first thing to understand is that OAuth 2.0 is an authorization framework, not an authentication protocol.
From a technical perspective, the big difference between OpenID Connect and OAuth 2.0 is the `id_token`. There is no `id_token` defined in OAuth 2.0 because it is specific to federated authentication.
The `id_token` provides an additional layer of security to user sign in transactions by adding:

— A nonce, which is sent by the client and enables the integrity of the response to be validated.

— A hash of the access token.

— A hash of the code (optional)

## OAuth 2.0 Grant Types

OAuth 2.0 defines four flows to get an access token. These flows are called grant types.

- Authorization Code Flow
- Implicit Flow with Form Post
- Resource Owner Password Flow
- Client Credentials Flow

Lets see in brief about these grants Types. For more details you can read [here](https://auth0.com/docs/get-started/authentication-and-authorization-flow)

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
  scope={SCOPES} // you need to check the scopes you want to use in each documentation
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

## Client Credentials Flow

This flow is used when the application needs to access its own resources, not on behalf of a user. For example, a cron job that needs to access a database to perform some maintenance.

The client credentials flow is a server-to-server flow. There is no user authentication involved in the process. Instead, the system authenticates itself with the authorization server so the client can access the resources it needs.


The type of application you will need for this type of flow usually is a machine-to-machine ou service account type of option.
If no one of this options are available at least chose one that will provide to you a `client_id` and `client_secret`.

In order to get an access token, you'll be making a POST request to the token endpoint with the following parameters: `grant_type=client_credentials`

If you're requesting a down-scoped token, then you'll also include `scope` with the scopes you need.

The only thing to look out for now is how to include the client credentials in the request. The authorization server may either want the client credentials in the post body or in an HTTP header as Basic Auth, and this is going to depend on the server you're working with.

Once you make this request to the token endpoint, if everything works out, then the response looks the same as every other access token response.

You probably won't get back a refresh tokens since there isn't really any benefit the refresh token can provide.
Refresh tokens give the application a way to get new access tokens without the user being present. So if there's no user involved in the flow, then there's no need to have a way to avoid interrupting them.

So once you've got the access token, you are ready to use it to make API requests.

This access token might still have an expiration date. It's again up to the server to decide how long these access tokens last.
And if it does expire, you don't have a refresh token, but that's fine because you just make the same request again and get back a new access token.

```
curl -X POST https://example/oauth/token \
  -d grant_type=client_credentials \
  -d client_id={YOUR_CLIENT_ID} \
  -d client_secret={YOUR_CLIENT_SECRET}
```

## Hybrid Flow

In hybrids flow you can combine response_type values. For example, you can combine `code` and `id_token` to get both an authorization code and an ID token in the same response.

```
https://example.com/callback?code={CODE}&state={STATE}&id_token={ID_TOKEN}
```

Now that ID Token is coming in the front channel in that response, so it's not trusted yet. So now we do have to do JSON Web Token validation and validate all the claims.

And if you do use the response_type=code_id_token, it's actually also going to include another claim in the ID Token, which you can use to validate the authorization code.

That claim is called c_hash, and it's going to be essentially a hash of the authorization code itself which you can use to verify that that code wasn't swapped out in that response.

To check that you must decoded the `id_token` and see the payload:
```
{
  "iss": "https://example.com",
  "sub": "1234567890",
  "aud": "s6BhdRkqt3",
  "nonce": "n-0S6_WzA2Mj",
  "exp": 1311281970,
  "iat": 1311280970,
  "auth_time": 1311280969,
  "c_hash": "xyfdpXtU3XG1kQ3jS1g1PQ" // ---> HERE
}
```


And then you can go and exchange that code for an access token.

But why might you use this?

Well, it does mean that you do get the ID Token data back sooner than you get the access token. So if it's important for performance reasons or for other reasons to get access to the user identifier or their name before you go and do the access token exchange, that's one possible reason. However, it does mean that you do need to do a lot more steps of actually validating that ID Token in order to actually use it safely.

From the perspective of the authorization server it cannot be sure if the client is doing the security check from code injentions attacks, that's why it is recommended to use PKCE for an additional protection, that's actually what PKCE provides.

PKCE provides that authorization code injection protection, but from the point of view of the OAuth server. The server is then sure that the authorization code wasn't injected because the request would fail.

So the more secure way and the guidance coming out of the OAuth group is leaning towards using PKCE even with OpenID Connect, and getting the ID Token and access token using the authorization code flow protected by PKCE.

And this is true for confidential or public clients, whether or not you have a client secret. This provides the simplest implementation for clients and it's also the most secure.

The OAuth group recommends the use of the authorization code flow protected by PKCE. And this is true for confidential or public clients, whether or not you have a client secret. This provides the simplest implementation for clients and it's also the most secure way to get an ID Token and an access token.


## OPENID Connect

OpenID Connect (OIDC) is an identity layer built on top of the OAuth 2.0 framework.
It allows third-party applications to verify the identity of the end-user and to obtain basic user profile information.


OpenID Connect is an extension of OAuth, so they do actually share a lot in common. OpenID Connect adds a few things into the mix, though.

The main goal of OpenID Connect is to communicate information about users to applications. While OAuth is always about applications accessing APIs, OpenID Connect is about applications learning information about users.

The main thing that OpenID Connect adds into the picture is an ID Token. The ID Token is the way that the authorization server communicates information about the user that just logged in to the application.

ID Tokens are always JSON Web tokens. The application is meant to look inside the ID token, validate the signature, validate the
claims, and then learn about the user.


Now, if the application is already getting an access token using the authorization code flow, then by far the easiest way to get an ID token is to add the scope "openid" to the request, and you'll get back in ID token and an access token.

So what this looks like is you take the normal authorization request using the authorization code flow, that's going to include response_type=code and your normal scopes that you would need in order to get the appropriate access token. And then you just add a new scope into the list and the scope is called `openid`. So what that does is it tells the OAuth server that you also want an ID token.



```
https://example/authorize?
  response_type=code&
  client_id={YOUR_CLIENT_ID}&
  state={RANDOM_STRING}&
  redirect_uri={REDIRECT_URI}&
  code_challenge={YOUR_CODE_CHALLENGE}&
  code_challenge_method=S256&
  scope=openid
```

So far the flow is the same as the Authorization Code Flow for Web Apps, but now we will receove an `id_token` to the response. 
At the end the token response would be

```
{
	"access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFDZWRack1lMW5UdDhERkVob1dGciJ9....",
	"id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFDZWRack1lMW5UdDhERkVob1dGciJ9.eyJnaXZlbl9uYW1lIjoiRmVybmFuZGEiLCJmYW1pbHlfbmFtZSI6IlBlbm5hIiwibmlja25hbWUiOiJmZXJuYW5kYS5wYW5kYSIsIm5hbWUiOi...",
	"scope": "openid",
	"expires_in": 86400,
	"token_type": "Bearer"
}
```

You can use the `id_token` to get the user information.
You access this information using any base64url tool https://example-app.com/base64


Other possibility is using `response_type=id_token`. That's telling the authorization server that you actually don't want an access token at all. And that will give you just an ID token. And in that mode, response_type=id_token, that actually returns the ID token in the redirect instead of the authorization code.

```
https://example/redirect?id_token={YOUR_ID_TOKEN}
```

Now, if you only include the scope "openid" in the request, then the ID token you receive will have very little information in it aside from the metadata about the token, like the expiration date, it'll only have the subject or the user ID of the user.
If you want other information about the user like their name or their email address, you need to add new scopes to the request. for example `profile`, `email`, `phone` and `address`. But that totally depends on the server you're using.
So it's best to go look up the documentation for the particular OpenID Connect server to see what it says about how to access that information.

You can pratice this authentication flow in [here](https://oauth.school/exercise/openid/)

## Validation of an id_token

There's a whole bunch of claims inside the ID Token that still need to be validated. Otherwise somebody might take a valid ID Token from one application or from one user and drop it into a different application, or swap it into a different user's flow. So you need to make sure that the ID Token you're about to use was actually intended for your application and part of the same flow.

So there's a handful of claims in here that are part of a JSON Web token.

`iss`: The issuer of the token. This is the URL of the authorization server that issued the token. That makes sure that the ID Token that you are looking at actually is coming from the server you think it's coming from.
`aud`: The audience of the token. This is the client ID of the application that the ID Token was issued to. So that makes sure that the ID Token was actually intended for your application.

`iat` and `exp`: The issued at and expiration time of the token. So that makes sure that the ID Token is still valid.

`nonce`: The nonce that was sent in the request. So that makes sure that the ID Token was actually intended for this particular request. 
If you're using a front channel flow, your request for an ID Token actually has to contain a nonce value.
By the client generating a random value and the authorization server including it back in the response, that lets the client match it up and ensure that that ID Token was bound to the original request the client made.

`amr`: The authentication method reference. This is a list of the authentication methods that were used to authenticate the user. So that makes sure that the user was actually authenticated in the way that you think they were.
```
"amr": [
  "pwd"
]
```

`auth_time`: The time that the user was authenticated. So that makes sure that the user was authenticated recently enough for your application's purposes.


It's just important to validate the ID Token signature and claims if you get the ID Token over an untrusted channel like the front channel.

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
- https://github.com/panva/node-openid-client/blob/main/docs/README.md#client-authentication-methods
- https://medium.com/@nitesh_17214/oauth-2-0-authorization-server-using-nodejs-and-expressjs-cf65860fed1e
- https://medium.com/@nitesh_17214/how-to-create-oidc-client-in-nodejs-b8ea779e0c64
- https://oidcdebugger.com/
- https://github.com/panva/node-oidc-provider
