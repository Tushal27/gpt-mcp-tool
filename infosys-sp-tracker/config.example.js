/* Supabase connection for this deployment.
 *
 * Both values below are safe to commit and safe to serve publicly: the
 * publishable (anon) key only ever acts as an unauthenticated visitor, and
 * supabase/schema.sql turns on Row Level Security so a signed-in user can read
 * and write nothing but their own row. The key is NOT a password.
 *
 * Fill these in from: Supabase dashboard → Project Settings → API
 *   SUPABASE_URL      = "Project URL"
 *   SUPABASE_ANON_KEY = "anon public" / "publishable" key
 *
 * Until they are set, the site opens in setup mode and explains what to do.
 */

export const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
export const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
