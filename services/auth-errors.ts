type ErrorLike = { message?: string; code?: string } | null;
export function authErrorMessage(error: ErrorLike): string {
  const value = `${error?.code ?? ''} ${error?.message ?? ''}`.toLowerCase();
  if (value.includes('invalid login credentials')) return 'E-mail ou mot de passe incorrect.';
  if (value.includes('email not confirmed')) return 'Confirmez votre adresse e-mail avant de vous connecter.';
  if (value.includes('already registered') || value.includes('user_already_exists')) return 'Un compte utilise déjà cette adresse e-mail.';
  if (value.includes('password') && (value.includes('weak') || value.includes('short'))) return 'Choisissez un mot de passe d’au moins 8 caractères.';
  if (value.includes('email') && value.includes('invalid')) return 'Saisissez une adresse e-mail valide.';
  if (value.includes('network') || value.includes('fetch')) return 'Connexion impossible. Vérifiez votre réseau puis réessayez.';
  if (value.includes('auth_not_configured')) return 'La connexion par compte n’est pas configurée sur cette version.';
  return 'Une erreur temporaire est survenue. Réessayez dans un instant.';
}
export const isValidEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email.trim());
