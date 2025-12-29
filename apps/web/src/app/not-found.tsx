import Link from "next/link";
import { Car, Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col items-center justify-center p-6">
      {/* Animated Car Icon */}
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="relative bg-muted/50 p-6 rounded-full border border-border/50">
          <Car className="h-16 w-16 text-muted-foreground" />
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="text-center max-w-md mx-auto space-y-4">
        <h1 className="text-7xl font-bold text-primary/20">404</h1>
        <h2 className="text-2xl font-bold tracking-tight">
          Página não encontrada
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Parece que essa página deu uma volta errada. O endereço que você
          tentou acessar não existe ou foi movido.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <Home className="h-4 w-4" />
          Voltar ao Dashboard
        </Link>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors border border-border"
        >
          <Search className="h-4 w-4" />
          Buscar Ordens
        </Link>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
