import styles from './page.module.css'
import Link from 'next/link'

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Anime Quiz Challenge</h1>
      <p className={styles.subtitle}>Test your knowledge of anime with our interactive quiz!</p>
      
      <Link href="/quiz">
        <button className={styles.startButton}>
          Start Quiz
        </button>
      </Link>

      <div className={styles.features}>
        <div className={styles.featureCard}>
          <h3>Multiple Categories</h3>
          <p>Questions from various anime genres and series to test your knowledge</p>
        </div>

        <div className={styles.featureCard}>
          <h3>Track Progress</h3>
          <p>See your scores and improve your anime knowledge over time</p>
        </div>

        <div className={styles.featureCard}>
          <h3>Challenge Friends</h3>
          <p>Share your results and compete with other anime fans</p>
        </div>
      </div>
    </main>
  )
}
