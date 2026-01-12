import { SetupWizard } from "@/components/setup/SetupWizard";

export default function SetupPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Bem-vindo ao Autevo
        </h1>
        <p className="text-muted-foreground">
          Vamos configurar sua conta e sua oficina em poucos passos.
        </p>
      </div>

      <SetupWizard />
    </div>
  );
}
