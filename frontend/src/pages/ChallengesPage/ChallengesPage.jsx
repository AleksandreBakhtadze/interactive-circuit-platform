import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api';
import { ChapterIcon, getChapterMeta } from '../../constants/chapterMeta';
import ProgressRing from '../../components/ProgressRing/ProgressRing';
import styles from './ChallengesPage.module.css';

export default function ChallengesPage() {
    const { lang } = useLang();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        const qs = user?.id != null ? `?userId=${encodeURIComponent(user.id)}` : '';
        fetch(`${API_BASE}/chapters${qs}`)
            .then((res) => res.json())
            .then((data) => {
                setChapters(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                setError(
                    lang === 'ka'
                        ? 'სერვერთან კავშირი ვერ მოხერხდა'
                        : 'Could not connect to server'
                );
                setLoading(false);
            });
    }, [user?.id, lang]);

    if (loading) {
        return (
            <main className={styles.main}>
                <p className={styles.status}>
                    {lang === 'ka' ? 'იტვირთება...' : 'Loading...'}
                </p>
            </main>
        );
    }
    if (error) {
        return (
            <main className={styles.main}>
                <p className={styles.status}>{error}</p>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    {lang === 'ka' ? 'თავები' : 'Chapters'}
                </h1>
                <p className={styles.sub}>
                    {lang === 'ka'
                        ? 'აირჩიე თავი და დაიწყე ამოცანების ამოხსნა'
                        : 'Pick a topic and start solving'}
                </p>
            </div>

            <div className={styles.grid}>
                {chapters.map((ch) => {
                    const total = Number(ch.problemCount) || 0;
                    const solved = Number(ch.solvedCount) || 0;
                    const meta = getChapterMeta(ch.code);
                    const title = lang === 'ka' ? ch.titleKa : ch.titleEn;

                    return (
                        <button
                            type="button"
                            key={ch.code}
                            className={styles.card}
                            style={{
                                '--card-accent': meta.accent,
                                '--card-icon-bg': meta.iconBg,
                            }}
                            onClick={() => navigate(`/challenges/${ch.code}`)}
                        >
                            <div className={styles.cardTop}>
                                <span className={styles.iconTile}>
                                    <ChapterIcon name={meta.icon} color={meta.accent} />
                                </span>
                            </div>

                            <h3 className={styles.chapterTitle}>{title}</h3>
                            <p className={styles.lessonCount}>
                                {total}{' '}
                                {lang === 'ka' ? 'ამოცანა' : total === 1 ? 'lesson' : 'lessons'}
                            </p>

                            <div className={styles.cardBottom}>
                                <ProgressRing
                                    value={solved}
                                    max={total || 1}
                                    color={meta.accent}
                                    size={42}
                                    stroke={3.5}
                                />
                                <div className={styles.frac}>
                                    <span className={styles.done}>{solved}</span>
                                    <span className={styles.sep}>/</span>
                                    <span className={styles.total}>{total}</span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </main>
    );
}
