export const metadata = {
  title: 'Authentication - ExpenseFlow',
  description: 'Sign in or create an account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
