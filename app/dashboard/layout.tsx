import { Sidebar } from "@/components/Sidebar";
import styles from "./layout.module.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <h2>Dashboard Overview</h2>
        </header>
        <main className={styles.contentArea}>
          {children}
        </main>
      </div>
    </div>
  );
}
