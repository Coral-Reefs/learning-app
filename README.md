# Learning Platform - Discussion threads and Quizzes Sharing

A collaborative learning app for connecting, sharing quizzes, and engaging in threaded discussions.

What can this app do:

 1. Sign up with phone number
 2. Send friend requests
 3. Create study groups
 4. Post and answer questions
 5. View questions and answers in a thread
 6. Attach images, videos, documents or voice messages
 7. Create quizzes to share with your friends

# Cloning and setting up

 1.  `git clone https://github.com/Coral-Reefs/chatterbox.git`
 2. go to client folder `cd client`
 3. install client packages `npm i`
 4. go to server folder `cd ../server`
 5. install server packages `npm i`

## Setting up client:

**server .env**
create an .env file in `/server`

| Variable name         | content                         |
|----------------|--------------------------------|
|`DB_URL`|cloud.mongodb.com or local MongoDB URL|
|`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`|Sign up at clerk.com, create an app with phone number verification and get this at the "API Keys" section on the sidebar|
|`CLERK_SECRET_KEY`|**same as above*|
|`CLERK_JWT_KEY`|Click on `Show JWT Key` in the API Keys page and copy the `PEM Public Key`|
|`ORIGIN`|Your client URL e.g. `http://localhost:3000`|
|`ZEGO_APP_ID`|Sign up at zegocloud.com, create an a project and copy the `AppID` on the dashboard |
|`ZEGO_SERVER_ID`| Copy the `ServerSecret` on the dashboard|


**client .env**
create an .env.local file in `/client`
| Variable name         | content                         |
|----------------|--------------------------------|
|`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`|*same as server*|
|`CLERK_SECRET_KEY`|*same as server*|
|`NEXT_PUBLIC_SERVER_URL`|The URL your server is running on `http://localhost:5000`|
|`NEXT_PUBLIC_ZEGO_APP_ID`| *same as server* |
|`NEXT_PUBLIC_ZEGO_SERVER_ID`| *same as server* |

## Clerk webhooks
Next, we will need to create webhooks to sync clerk's user data to MongoDB
**Step 1: Create a MongoDB Realm App**
-   Open your MongoDB project and navigate to the App Services tab.
-   Click the “Create a New App” button and follow the recommended instructions.

**Step 2: Create a Custom HTTPS Endpoint**
-   In the App Services UI of your Realm app, select “HTTPS Endpoints” from the left navigation menu.
-   Click “Add An Endpoint.”
-   Define the endpoint Route (e.g., “/webhook”).
-   Copy the callback URL to your clipboard.
-   Choose the HTTP method “POST” and a response type “JSON”.
-   Move to the function section, click “Select a function” and then click “+ New Function.”
-   Enter the name for the new function (e.g., syncClerkData) and scroll down to Save Draft.

**Step 3: Enable webhooks in Clerk**

-   To enable webhooks, go to the Clerk Dashboard and navigate to the Webhooks page. Select the “Add Endpoint” button.
-   Complete the form specifying the URL of your backend endpoint (Paste the link you copied earlier).
-   Specify the events you want to receive (select “user.created” & “user.updated”).
-   Once you click the Create button, you’ll be presented with your webhook endpoint dashboard.
-   Retrieve the webhook signing secret and save it for later.

**Step 4: Write the HTTPS Endpoint Function**

-   Go back to the App Services UI of your Realm app, and click “Functions” in the left navigation menu.
-   Choose the function you added earlier.
-   Remove the default code and replace it with the provided code below in the Function Editor. Ensure you replace the `WEBHOOK_SECRET` with your webhook signing secret.
-   Note: Add the svix package to the function dependencies by clicking the “Add Dependency” button.

```
const { Webhook } = require("svix");
const WEBHOOK_SECRET = WEBHOOK_SECRET;
const DB_NAME = "chat-app";
const USERS_COLLECTION_NAME = "users";

async function extractAndVerifyHeaders(request, response) {
  const headers = request.headers;
  const payload = request.body.text();

  let svix_id, svix_timestamp, svix_signature;

  try {
    svix_id = headers["Svix-Id"][0];
    svix_timestamp = headers["Svix-Timestamp"][0];
    svix_signature = headers["Svix-Signature"][0];

    if (!svix_id || !svix_timestamp || !svix_signature) {
      throw new Error();
    }
  } catch (err) {
    response.setStatusCode(400);
    return response.setBody(
      JSON.stringify({
        success: false,
        message: "Error occured -- no svix headers",
      })
    );
  }

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.log("Webhook failed to verify. Error:", err.message);

    response.setStatusCode(400);
    return response.setBody(
      JSON.stringify({
        success: false,
        message: err.message,
      })
    );
  }

  return evt;
}

function getUserDataFromEvent(evt) {
  return {
    clerkUserId: evt.data.id,
    firstName: evt.data.first_name,
    lastName: evt.data.last_name,
    phone: evt.data.phone_numbers[0].phone_number,
    image: evt.data.profile_image_url,
  };
}

async function handleUserCreated(evt) {
  const mongodb = context.services.get("mongodb-atlas");
  const usersCollection = mongodb.db(DB_NAME).collection(USERS_COLLECTION_NAME);

  const newUser = getUserDataFromEvent(evt);

  try {
    const user = await usersCollection.insertOne(newUser);
    console.log(`Successfully inserted user with _id: ${user.insertedId}`);
  } catch (err) {
    console.error(`Failed to insert user: ${err}`);
  }
}

async function handleUserUpdated(evt) {
  const mongodb = context.services.get("mongodb-atlas");
  const usersCollection = mongodb.db(DB_NAME).collection(USERS_COLLECTION_NAME);

  const updatedUser = getUserDataFromEvent(evt);

  try {
    await usersCollection.updateOne(
      { clerkUserId: evt.data.id },
      { $set: updatedUser }
    );
    console.log("Successfully updated user!");
  } catch (err) {
    console.error(`Failed to update user: ${err}`);
  }
}

async function handleUserDeleted(evt) {
  const mongodb = context.services.get("mongodb-atlas");
  const usersCollection = mongodb.db(DB_NAME).collection(USERS_COLLECTION_NAME);

  try {
    await usersCollection.deleteOne({ clerkUserId: evt.data.id });
    console.log("Successfully deleted user!");
  } catch (err) {
    console.error(`Failed to delete user: ${err}`);
  }
}

exports = async function syncClerkData(request, response) {
  const evt = await extractAndVerifyHeaders(request, response);

  switch (evt.type) {
    case "user.created":
      await handleUserCreated(evt);
      response.setStatusCode(201);
      break;
    case "user.updated":
      await handleUserUpdated(evt);
      response.setStatusCode(200);
      break;
    case "user.deleted":
      await handleUserDeleted(evt);
      response.setStatusCode(200);
      break;
    default:
      console.log(`Unhandled event type: ${evt.type}`);
      response.setStatusCode(400);
  }

  return response.setBody(
    JSON.stringify({
      success: true,
      message: "Webhook received",
    })
  );
};
```
**Step 5: Configure Access Permissions**

-   To allow Clerk webhooks to call the HTTPS endpoint, update the Authentication settings.
-   Click on the “Settings” tab and choose “System” in the Authentication section.

**Step 6: Save and Deploy Your App**

-   Click “Save Draft.”
-   Once the draft is saved, click on “REVIEW DRAFT & DEPLOY” to deploy your function.

**Step 7: Testing**

-   Trigger events in Clerk (user creation or update).
-   Check the MongoDB Atlas database to ensure that user data is synced.

## Starting the server
Client: `npm run dev`
Server: `node index`

Happy coding!
