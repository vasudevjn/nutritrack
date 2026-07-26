import { ProfileForm } from "@/components/settings/profile-form";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your profile and account.</p>
      </header>
      <ProfileForm />
    </div>
  );
}
