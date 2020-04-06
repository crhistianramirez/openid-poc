const express = require('express')
const app = express()
const port = process.env.PORT || 4451
const parseJwt = require('jwt-decode');
const OrderCloud = require('ordercloud-javascript-sdk');
const { v4: uuidv4 } = require('uuid');

app.use(express.json())

// This endpoint will be called after a user has successfully logged in via their IDP
// but before they are redirected to the application
app.post('/integration-events/createuser', (req, res) => {
    const body = req.body;
    OrderCloud.Tokens.SetAccessToken(body.OrderCloudAccessToken)

    // These are the claims available from parsing the ID token from the IDP
    const claims = parseJwt(body.TokenResponse.id_token);
    console.log(claims)

    // Create a new user to connect the idp login to an ordercloud user
    // You may want to do other things here like assign the user to a group
    // for visibility or pricing
    const newUser = {
        Username: uuidv4(), // can be something else but you're responsible for ensuring uniqueness across seller org
        Email: claims.email,
        FirstName: claims.given_name,
        LastName: claims.family_name,
        Active: true
    }
    return OrderCloud.Users.Create('initBuyer', newUser)
        // on success we only need to reply to the API with Username
        .then(() => res.status(200).send({ErrorMessage: null, Username: newUser.Username}))
        .catch(e => {
            // We can tell the API to display errors to the user, helpful for debugging
            // any unhandled exceptions will be displayed as a raw value
            return res.status(200).send({ErrorMessage: e.message, Username: null})
        })
})

app.use('/', express.static(__dirname));
app.listen(port, () => console.log(`Listening on port ${port} - http://localhost:${port}`))