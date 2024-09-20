import { defineAuth } from '@aws-amplify/backend';
import { postConfirmation } from "./post-confirmation/resource"
/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  userAttributes: {
    givenName: {
      mutable: true,
      required: true,
    },
    familyName: {
      mutable: true,
      required: true,
    },
  },

  loginWith: {
    email: true,
  },
  groups: ["admin"],
  triggers: {
    postConfirmation,
  },
  access: (allow) => [
    allow.resource(postConfirmation).to(["addUserToGroup","updateUserAttributes", "getUser"]),
  ],
});
