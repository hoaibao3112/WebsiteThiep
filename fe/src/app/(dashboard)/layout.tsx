import DashboardAuthGuard from "@/components/auth/DashboardAuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardAuthGuard>{children}</DashboardAuthGuard>;
}
