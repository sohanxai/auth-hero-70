import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Email is required.").email("Please enter a valid email address.").max(255),
  password: z.string().min(6, "Password must be at least 6 characters.").max(128),
});

export const signupSchema = credentialsSchema.extend({
  fullName: z.string().trim().min(2, "Please enter your full name.").max(100),
  phone: z.string().trim().min(6, "Please enter a valid phone number.").max(20),
});

/**
 * Maps Supabase / network failures to a friendly message.
 * Never surfaces raw backend internals to the user.
 */
export function friendlyAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? "");

  // Browser fetch failures (offline, DNS, blocked request, bad env config).
  if (/failed to fetch|network ?error|load failed|fetch failed|networkrequestfailed/i.test(message)) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }
  if (/invalid login credentials|invalid credentials/i.test(message)) {
    return "Invalid email or password.";
  }
  if (/email not confirmed|not confirmed|verify/i.test(message)) {
    return "Please verify your email before logging in.";
  }
  if (/already registered|already exists|user already/i.test(message)) {
    return "Email already registered. Please sign in instead.";
  }
  if (/provider is not enabled|unsupported provider|validation_failed/i.test(message)) {
    return "Google sign-in isn't enabled yet. Please use email and password, or enable the Google provider in your backend auth settings.";
  }
  if (/redirect|url.*not allowed|invalid request.*redirect/i.test(message)) {
    return "This site's URL isn't allowed for sign-in redirects yet. Add it to your backend auth redirect URLs.";
  }
  if (/weak|pwned|easy to guess|leaked/i.test(message)) {
    return "That password is too easy to guess. Try adding a few more characters or numbers.";
  }
  if (/rate limit|too many/i.test(message)) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (/password/i.test(message) && /short|least/i.test(message)) {
    return "Password must be at least 6 characters.";
  }
  if (/missing supabase environment/i.test(message)) {
    return "Authentication is not configured for this environment. Please contact support.";
  }
  return message || "Something went wrong. Please try again.";
}
