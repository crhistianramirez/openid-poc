# OpenID Connect with OrderCloud & Google

This proof of concept shows you how you can use OrderCloud's OpenAPI feature to log in with google and get a valid OrderCloud token.

To get started, follow [google's instructions](https://developers.google.com/identity/protocols/oauth2/openid-connect) for setting up openid connect on their side and then follow the steps below. We'll need the `clientID` and `clientSecret` which OrderCloud will refer to as `ConnectClientID` and `ConnectClientSecret` respectively. On google's side you'll also need to set the authorized redirect URI to `https://auth.ordercloud.io/ocrpcode`

1. In the API create a new Open ID Connect

    ```http
    POST https://api.ordercloud.io/v1/openidconnects HTTP/1.1
    Authentication: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
    Content-Type: application/json; charset=UTF-8

    {
        "ID": "google",
        "OrderCloudApiClientID": "PUT_CLIENT_ID_HERE",
        "ConnectClientID": "PUT_GOOGLE_CLIENT_ID_HERE",
        "ConnectClientSecret": "PUT_GOOGLE_CLIENT_SECRET_HERE",
        "AppStartUrl": "http://localhost:5000?token={0}",
        "AuthorizationEndpoint": "https://accounts.google.com/o/oauth2/v2/auth",
        "TokenEndpoint": "https://oauth2.googleapis.com/token",
        "UrlEncoded": false
    }
    ```

    | OrderCloud Property     | Description                                                                                                                                                                                                                  |
    |-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | `ID`                    | Unique identifier for the connect client config                                                                                                                                                                              |
    | `OrderCloudApiClientID` | This is the clientID (on OrderCloud) that wants to authenticate via OpenID Connect                                                                                                                                           |
    | `ConnectClientID`       | This is the clientID of the identify provider (in this case Google)                                                                                                                                                          |
    | `ConnectClientSecret`   | This is the clientSecret of the identity provider (in this case Google)                                                                                                                                                              |
    | `AppStartUrl`           | This is where the user will be redirected to after successful authentication via OpenID Connect. The parameter `{0}` represents the token                                                                                      |
    | `AuthorizationEndpoint` | Defined by the OpenID provider (in this case Google). It is the endpoint OrderCloud will redirect user to in order to validate credentials.                                                                                  |
    | `TokenEndpoint`         | Defined by the OpenID provider (in this case Google). It is the endpoint OrderCloud will call out to get a token from the provider.                                                                                          |
    | `UrlEncoded`            | How to post information to the OpenID provider (in this case Google). It is sent with either Basic Auth if UrlEncoded is `false`, otherwise it posts a Url encoded body. Most providers (such as Google) will accept both. |

2. Create a new user. It can be any type of user that your clientID defines, in this example we'll assume we have a clientID that allows seller users so we'll create a seller user. You'll need to make sure that the `Username` field is set to the email address that you use to sign in to google. You'll notice we're not setting a password, we won't need one since we're not authenticating via login.

    ```http
    POST https://api.ordercloud.io/v1/adminusers HTTP/1.1
    Authentication: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
    Content-Type: application/json; charset=UTF-8

    {
        "ID": "my-admin-user",
        "Username": "myuser@gmail.com",
        "Password": null,
        "FirstName": "Test",
        "LastName": "Test",
        "Email": "myuser@gmail.com",
        "Active": true
    }
    ```

3. Create a security profile for your user with whatever roles you desire. In our example we'll just create a security profile with the role `Shopper`

    ```http
    POST https://api.ordercloud.io/v1/securityprofiles HTTP/1.1
    Authentication: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
    Content-Type: application/json; charset=UTF-8

    {
        "ID": "my-security-profile",
        "Name": "my-security-profile",
        "Roles": [
            "Shopper"
        ]
    }
    ```

4. Assign the security profile to your user

    ```http
    POST https://api.ordercloud.io/v1/securityprofiles/assignments HTTP/1.1
    Authentication: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
    Content-Type: application/json; charset=UTF-8

    {
        "SecurityProfileID": "my-security-profile",
        "UserID": "my-admin-user"
    }
    ```

    Note: We're assigning it to an admin user. If you are assigning it to a buyer user you'll need define `BuyerID` and likewise if you're assigning it to a supplier user you will need to define `SupplierID`.

5. Set the following values in the index.html
    - `OPEN_ID_CONNECT_ID` - the ID to the Open ID Connect configuration you created on OrderCloud
    - `ORDERCLOUD_CLIENT_ID` - the clientID that wants to authenticate via OpenID connect
    - `ORDERCLOUD_ROLES` - the roles to request, only roles that are also part of the security profile will be granted

6. run `npm install` to download the dependencies and then run `npm run start` at the root of the project. Open your app. If everything went right you should be redirected to google's sign in page. After successfully signing in, you'll be redirected back to the app and you should see an alert with your new OrderCloud token.
