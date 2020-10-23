# OpenID Connect with OrderCloud & Google

This proof of concept shows you how you can use OrderCloud's OpenAPI feature to log in with google and get a valid OrderCloud token. The code samples here are written in javascript for simplicity. We're also using the sandbox environment. 

To get started, follow [google's instructions](https://developers.google.com/identity/protocols/oauth2/openid-connect) for setting up openid connect on their side and then follow the steps below. We'll need google's `clientID` and `clientSecret` which OrderCloud will refer to as `ConnectClientID` and `ConnectClientSecret` respectively. On google's side you'll also need to set the authorized redirect URI to `https://sandboxapi.ordercloud.io/ocrpcode`.

1. We'll need a publicly available endpoint for this. Instead of deploying something, we can use [ngrok](https://ngrok.com/). After installing ngrok run `ngrok http 4451`. This tells ngrok to expose our endpoint that lives on http://localhost:4451 to two public endpoints. After running the command copy either one of those urls we'll need it in step 2, keep ngrok running. If you close it you'll need to run it again which will generate a unique endpoint.

2. In the API create a new [Integration Event](https://ordercloud.io/api-reference/seller/integration-events/create).

    ```http
    POST https://sandboxapi.ordercloud.io/v1/openidconnects HTTP/1.1
    Authentication: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
    Content-Type: application/json; charset=UTF-8

    {
        "ID": "openidconnect",
        "Name": "openidconnect",
        "EventType": "OpenIDConnect",
        "CustomImplementationUrl": "{your-ngrok-url}/integration-events",
        "HashKey": "supersecrethash",
        "ElevatedRoles": [
            "FullAccess"
        ]
    }
    ```

3. In the API create a new [Open ID Connect](https://ordercloud.io/api-reference/authentication-and-authorization/open-id-connects/create)

    ```http
    POST https://sandboxapi.ordercloud.io/v1/integrationEvents HTTP/1.1
    Authentication: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

    Content-Type: application/json; charset=UTF-8

    {
        "ID": "google",
        "OrderCloudApiClientID": "PUT_CLIENT_ID_HERE",
        "ConnectClientID": "PUT_GOOGLE_CLIENT_ID_HERE",
        "ConnectClientSecret": "PUT_GOOGLE_CLIENT_SECRET_HERE",
        "AppStartUrl": "http://localhost:4451?token={0}",
        "AuthorizationEndpoint": "https://accounts.google.com/o/oauth2/v2/auth",
        "TokenEndpoint": "https://oauth2.googleapis.com/token",
        "UrlEncoded": false
        "IntegrationEventID": "openidconnect",
        "AdditionalIdpScopes": null
    }
    ```

    | OrderCloud Property     | Description                                                                                                                                                                                                                |
    |-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | `ID`                    | Unique identifier for the connect client config                                                                                                                                                                            |
    | `OrderCloudApiClientID` | This is the clientID (on OrderCloud) that wants to authenticate via OpenID Connect                                                                                                                                         |
    | `ConnectClientID`       | This is the clientID of the identify provider (in this case Google)                                                                                                                                                        |
    | `ConnectClientSecret`   | This is the clientSecret of the identity provider (in this case Google)                                                                                                                                                    |
    | `AppStartUrl`           | This is where the user will be redirected to after successful authentication via OpenID Connect. The parameter `{0}` represents the token                                                                                  |
    | `AuthorizationEndpoint` | Defined by the OpenID provider (in this case Google). It is the endpoint OrderCloud will redirect user to in order to validate credentials.                                                                                |
    | `TokenEndpoint`         | Defined by the OpenID provider (in this case Google). It is the endpoint OrderCloud will call out to get a token from the provider.                                                                                        |
    | `UrlEncoded`            | How to post information to the OpenID provider (in this case Google). It is sent with either Basic Auth if UrlEncoded is `false`, otherwise it posts a Url encoded body. Most providers (such as Google) will accept both. |
    | `IntegrationEventID`    | The ID to the Integration Event created in step 2. This has information about which endoint ordercloud should call out to in order to create the user after the user has successfully logged in.                                                                                                                                   |
    | `AdditionalIdpScopes`   | Any additional scopes (roles) you'd like to request from the IDP at the time of authentication. As an example you could request permissions from google to access user's google drive files, then the access token you get back from the IDP would have permission to do that.                                                                                                                             |

4. Set the following values in the index.html. These
    - `OPEN_ID_CONNECT_ID` - the ID to the Open ID Connect configuration you created on OrderCloud
    - `ORDERCLOUD_CLIENT_ID` - the clientID that wants to authenticate via OpenID connect
    - `ORDERCLOUD_ROLES` - the roles to request, only roles that are also part of the security profile will be granted

5. run `npm install` to download the dependencies and then run `npm run start` at the root of the project. Open your app. If everything went right you should be redirected to google's sign in page. After successfully signing in, you'll be redirected back to the app and you should see an alert with your new OrderCloud token. Check out server.js to see the user create logic that happens.
