import DashboardAuthGuard from "@/components/auth/DashboardAuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAuthGuard>
      <div className="text-stone-900 min-h-screen">{children}</div>
    </DashboardAuthGuard>
  );
}
