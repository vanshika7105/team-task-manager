import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.hero}>
      <h1 className={styles.title}>Team Task Manager</h1>
      <p className={styles.subtitle}>
        Manage projects, track tasks, and collaborate effortlessly with your team using our intuitive and powerful dashboard.
      </p>
      <div className={styles.actions}>
        <Link href="/login" className="btn btn-primary">
          Get Started
        </Link>
        <Link href="/about" className="btn btn-secondary">
          Learn More
        </Link>
      </div>
    </main>
  );
}
