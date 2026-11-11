
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();

  // Step 1: Verify the user's identity with Supabase Auth.
  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect("/admin/login");
  }

  // Step 2: Require completed multi-factor authentication.
  const { data: assurance, error: assuranceError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (
    assuranceError ||
    assurance?.currentLevel !== "aal2"
  ) {
    redirect("/admin/login");
  }

  // Step 3: Verify admin membership through PostgreSQL.
  const { data: allowed, error: roleError } =
    await supabase.rpc("is_admin");

  if (roleError || allowed !== true) {
    redirect("/admin/login");
  }

  return {
    user: userData.user,
    supabase,
  };
}
