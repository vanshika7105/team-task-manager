"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { CheckCircle2, Clock, AlertCircle, Briefcase } from "lucide-react";

type DashboardData = {
  metrics: {
    totalTasks: number;
    completionRate: number;
    overdueCount: number;
    activeProjects: number;
  };
  myTasks: Array<{
    id: string;
    title: string;
    status: string;
    dueDate: string | null;
    project: { name: string };
  }>;
  tasksPerProject: Array<{ name: string; count: number }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDisplay = (task: any) => {
    if (task.status === "DONE") {
      return <span className={`${styles.taskStatus} ${styles.statusDone}`}>Done</span>;
    }
    
    if (task.dueDate) {
      const isOverdue = new Date(task.dueDate) < new Date() && new Date().toDateString() !== new Date(task.dueDate).toDateString();
      if (isOverdue) {
        return <span className={`${styles.taskStatus} ${styles.statusOverdue}`}>Overdue</span>;
      }
      return <span className={`${styles.taskStatus} ${styles.statusUpcoming}`}>Upcoming</span>;
    }
    
    return <span className={styles.taskStatus} style={{ backgroundColor: "var(--surface-hover)", color: "var(--text-muted)" }}>No Date</span>;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.statsGrid}>
          {[1, 2, 3, 4].map(i => <div key={i} className={`${styles.statCard} skeleton`} style={{ height: "120px" }} />)}
        </div>
        <div className={styles.contentGrid}>
          <div className={`${styles.section} skeleton`} style={{ height: "400px" }} />
          <div className={`${styles.section} skeleton`} style={{ height: "400px" }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>Total Tasks</span>
            <CheckCircle2 size={20} color="var(--primary)" />
          </div>
          <div className={styles.statValue}>{data?.metrics.totalTasks || 0}</div>
          <div className={styles.statLabel}>Assigned to you</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>Completion Rate</span>
            <Briefcase size={20} color="var(--status-done)" />
          </div>
          <div className={styles.statValue}>{data?.metrics.completionRate || 0}%</div>
          <div className={styles.statLabel}>Of all assigned tasks</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>Overdue Tasks</span>
            <AlertCircle size={20} color="var(--status-overdue)" />
          </div>
          <div className={styles.statValue}>{data?.metrics.overdueCount || 0}</div>
          <div className={styles.statLabel}>Require attention</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>Active Projects</span>
            <Briefcase size={20} color="var(--priority-medium)" />
          </div>
          <div className={styles.statValue}>{data?.metrics.activeProjects || 0}</div>
          <div className={styles.statLabel}>In your workspace</div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>My Recent Tasks</h3>
          <div className={styles.taskList}>
            {data?.myTasks.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No tasks assigned to you yet.</p>
            ) : (
              data?.myTasks.map(task => (
                <div key={task.id} className={styles.taskItem}>
                  <div className={styles.taskInfo}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <span className={styles.taskProject}>{task.project.name}</span>
                  </div>
                  {getStatusDisplay(task)}
                </div>
              ))
            )}
          </div>
          {data && data.myTasks.length > 0 && (
            <Link href="/dashboard/tasks" style={{ marginTop: "1rem", color: "var(--primary)", fontSize: "0.875rem", fontWeight: 500 }}>
              View all my tasks &rarr;
            </Link>
          )}
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Tasks per Project</h3>
          <div className={styles.taskList}>
            {data?.tasksPerProject.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No projects yet.</p>
            ) : (
              data?.tasksPerProject.map((p, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "0.875rem" }}>{p.name}</span>
                  <span style={{ fontWeight: 600 }}>{p.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
