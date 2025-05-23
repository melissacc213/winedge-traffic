import type { PropsWithChildren } from 'react';

type LoginLayoutProps = PropsWithChildren;

export function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background p-0">
      {children}
    </div>
  );
}