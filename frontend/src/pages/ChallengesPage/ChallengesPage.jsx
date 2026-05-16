import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import styles from './ChallengesPage.module.css';

export default function ChallengesPage() {
    const { lang } = useLang();
    const navigate = useNavigate();
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://localhost:8080/api/chapters')
            .then(res => res.json())
            .then(data => { setChapters(data); setLoading(false); })
            .catch(() => { setError('სერვერთან კავშირი ვერ მოხერხდა'); setLoading(false); });
    }, []);

    if (loading) return <main className={styles.main}><p className={styles.status}>იტვირთება...</p></main>;
    if (error)   return <main className={styles.main}><p className={styles.status}>{error}</p></main>;

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <span className={styles.eyebrow}>CircuitLab</span>
                <h1 className={styles.title}>
                    {lang === 'ka' ? 'თავები' : 'Chapters'}
                </h1>
                <p className={styles.sub}>
                    {lang === 'ka'
                        ? 'აირჩიე თავი და დაიწყე ამოცანების ამოხსნა'
                        : 'Choose a chapter and start solving challenges'}
                </p>
            </div>

            <div className={styles.grid}>
                {chapters.map((ch) => (
                    <div
                        key={ch.code}
                        className={styles.card}
                        onClick={() => navigate(`/challenges/${ch.code}`)}
                    >
                        <div className={styles.cardTop}>
                            <span className={styles.code}>{ch.code}</span>
                            <span className={styles.order}>#{ch.displayOrder}</span>
                        </div>
                        <h3 className={styles.chapterTitle}>
                            {lang === 'ka' ? ch.titleKa : ch.titleEn}
                        </h3>
                        <div className={styles.cardBottom}>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: '0%' }} />
                            </div>
                            <div className={styles.counts}>
                                <span className={styles.done}>0</span>
                                <span className={styles.sep}>/</span>
                                <span className={styles.total}>{ch.problemCount} {lang === 'ka' ? 'ამოცანა' : 'challenges'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
