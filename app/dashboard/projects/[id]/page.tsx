"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Clock } from "lucide-react";
import styles from "./page.module.css";
import modalStyles from "../page.module.css"; // Reuse modal styles from projects page

type Task = {
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate: string | null;
  assignee: { name: string; email: string } | null;
};

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Task form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          description, 
          priority, 
          dueDate: dueDate || null 
        })
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setTitle("");
        setDescription("");
        setPriority("MEDIUM");
        setDueDate("");
        fetchTasks();
      }
    } catch (error) {
      console.error("Failed to create task", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date() && new Date().toDateString() !== new Date(dateString).toDateString();
  };

  const renderColumn = (status: string, title: string) => {
    const columnTasks = tasks.filter(t => t.status === status);
    
    return (
      <div className={styles.column}>
        <div className={styles.columnHeader}>
          <span>{title}</span>
          <span className={styles.taskCount}>{columnTasks.length}</span>
        </div>
        <div className={styles.columnContent}>
          {columnTasks.map(task => (
            <div key={task.id} className={styles.taskCard}>
              <h4 className={styles.taskTitle}>{task.title}</h4>
              {task.description && (
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                  {task.description.length > 50 ? task.description.substring(0, 50) + "..." : task.description}
                </p>
              )}
              <div className={styles.taskFooter}>
                <span className={`${styles.priorityBadge} ${styles[`priority-${task.priority.toLowerCase()}`]}`}>
                  {task.priority}
                </span>
                {task.dueDate && (
                  <span className={`${styles.dateBadge} ${isOverdue(task.dueDate) && task.status !== "DONE" ? styles.overdue : ""}`}>
                    <Clock size={12} />
                    {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          ))}
          
          {columnTasks.length === 0 && (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--border)", fontSize: "0.875rem" }}>
              No tasks
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.projectInfo}>
          <Link href="/dashboard/projects" style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
            <ArrowLeft size={16} /> Back to Projects
          </Link>
          <h1 className={styles.title}>
            Project Board
          </h1>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Add Task
        </button>
      </div>

      {isLoading ? (
        <div className={styles.kanbanBoard}>
          <div className={`${styles.column} skeleton`} />
          <div className={`${styles.column} skeleton`} />
          <div className={`${styles.column} skeleton`} />
        </div>
      ) : (
        <div className={styles.kanbanBoard}>
          {renderColumn("TODO", "To Do")}
          {renderColumn("IN_PROGRESS", "In Progress")}
          {renderColumn("DONE", "Done")}
        </div>
      )}

      {isModalOpen && (
        <div className={modalStyles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "1.5rem" }}>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className={modalStyles.formGroup}>
                <label className={modalStyles.label}>Task Title</label>
                <input 
                  type="text" 
                  className={modalStyles.input} 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                  placeholder="e.g. Design Login Page"
                />
              </div>
              
              <div className={modalStyles.formGroup}>
                <label className={modalStyles.label}>Description</label>
                <textarea 
                  className={modalStyles.textarea} 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task details..."
                />
              </div>
              
              <div style={{ display: "flex", gap: "1rem" }}>
                <div className={modalStyles.formGroup} style={{ flex: 1 }}>
                  <label className={modalStyles.label}>Priority</label>
                  <select 
                    className={modalStyles.input} 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                
                <div className={modalStyles.formGroup} style={{ flex: 1 }}>
                  <label className={modalStyles.label}>Due Date</label>
                  <input 
                    type="date" 
                    className={modalStyles.input} 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className={modalStyles.modalActions}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting || !title.trim()}
                >
                  {isSubmitting ? "Adding..." : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
