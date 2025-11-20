import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      // Disable email verification temporarily (no Resend configured)
      verify: undefined,
    }),
  ],
});
