"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Users, CheckSquare } from "lucide-react";
import styles from "./page.module.css";

type Project = {
  id: string;
  name: string;
  description: string;
  _count: { tasks: number; members: number };
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description })
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setName("");
        setDescription("");
        fetchProjects(); // Refresh list
      }
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Projects</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> New Project
        </button>
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={`${styles.card} skeleton`} style={{ height: "200px" }}></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          <p>You don't have any projects yet.</p>
          <button 
            className="btn btn-secondary" 
            style={{ marginTop: "1rem" }}
            onClick={() => setIsModalOpen(true)}
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map((project) => (
            <Link href={`/dashboard/projects/${project.id}`} key={project.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{project.name}</h3>
              </div>
              <p className={styles.cardDescription}>
                {project.description || "No description provided."}
              </p>
              <div className={styles.cardFooter}>
                <div className={styles.stat} title="Members">
                  <Users size={16} />
                  <span>{project._count?.members || 1}</span>
                </div>
                <div className={styles.stat} title="Tasks">
                  <CheckSquare size={16} />
                  <span>{project._count?.tasks || 0} tasks</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "1.5rem" }}>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="name">Project Name</label>
                <input 
                  id="name"
                  type="text" 
                  className={styles.input} 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                  placeholder="e.g. Website Redesign"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="description">Description</label>
                <textarea 
                  id="description"
                  className={styles.textarea} 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this project about?"
                />
              </div>
              <div className={styles.modalActions}>
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
                  disabled={isSubmitting || !name.trim()}
                >
                  {isSubmitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
