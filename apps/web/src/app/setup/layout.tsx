import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl">
             {children}
        </div>
    </div>
  );
}
