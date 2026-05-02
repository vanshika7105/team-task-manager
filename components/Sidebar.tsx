"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, Briefcase, CheckSquare, Settings, LogOut } from "lucide-react";
import styles from "./Sidebar.module.css";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: Briefcase },
  { name: "My Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>TaskMaster</div>
      
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.user}>
          <div className={styles.avatar}>
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{session?.user?.name || "User"}</span>
            <span className={styles.userEmail}>{session?.user?.email || ""}</span>
          </div>
        </div>
        
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })} 
          className={styles.logoutBtn}
        >
          <LogOut size={16} style={{ display: "inline", marginRight: "0.5rem" }} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
