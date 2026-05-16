import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { problemToSlug } from '../../utils/problemSlug';
import { useLang } from '../../context/LangContext';
import styles from './ChapterChallengesPage.module.css';

const API = 'http://localhost:8080/api';

async function fetchChapterDetail(chapterCode) {
    const res = await fetch(`${API}/chapters/${encodeURIComponent(chapterCode)}/detail`);
    if (!res.ok) {
        const err = new Error('request_failed');
        err.status = res.status;
        throw err;
    }
    return res.json();
}

export default function ChapterChallengesPage() {
    const { chapterCode } = useParams();
    const navigate = useNavigate();
    const { lang } = useLang();
    const [chapter, setChapter] = useState(null);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!chapterCode) return;

        setLoading(true);
        setError('');

        fetchChapterDetail(chapterCode)
            .then((data) => {
                setChapter(data.chapter);
                setProblems(data.problems ?? []);
                setLoading(false);
            })
            .catch((err) => {
                if (err.status === 404) {
                    setError(lang === 'ka' ? 'თავი ვერ მოიძებნა' : 'Chapter not found');
                } else if (err.message === 'request_failed') {
                    setError(lang === 'ka' ? 'სერვერმა მოთხოვნა უარყო' : 'Server rejected the request');
                } else {
                    setError(lang === 'ka' ? 'სერვერთან კავშირი ვერ მოხერხდა' : 'Could not connect to server');
                }
                setLoading(false);
            });
    }, [chapterCode, lang]);

    if (loading) {
        return (
            <main className={styles.main}>
                <p className={styles.status}>{lang === 'ka' ? 'იტვირთება...' : 'Loading...'}</p>
            </main>
        );
    }

    if (error || !chapter) {
        return (
            <main className={styles.main}>
                <p className={styles.status}>{error || (lang === 'ka' ? 'თავი ვერ მოიძებნა' : 'Chapter not found')}</p>
                <p className={styles.hint}>
                    {lang === 'ka'
                        ? 'დარწმუნდით, რომ backend გაშვებულია (პორტი 8080) და გადატვირთეთ მას შეცვლების შემდეგ.'
                        : 'Make sure the backend is running on port 8080 and restart it after code changes.'}
                </p>
                <Link to="/challenges" className={styles.backLink}>
                    {lang === 'ka' ? '← თავებზე დაბრუნება' : '← Back to chapters'}
                </Link>
            </main>
        );
    }

    const chapterTitle = lang === 'ka' ? chapter.titleKa : chapter.titleEn;

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <Link to="/challenges" className={styles.backLink}>
                    {lang === 'ka' ? '← თავები' : '← Chapters'}
                </Link>
                <span className={styles.eyebrow}>{chapter.code}</span>
                <h1 className={styles.title}>{chapterTitle}</h1>
                <p className={styles.sub}>
                    {lang === 'ka'
                        ? `${problems.length} ამოცანა`
                        : `${problems.length} challenges`}
                </p>
            </div>

            {problems.length === 0 ? (
                <p className={styles.empty}>
                    {lang === 'ka' ? 'ამოცანები ჯერ არ არის დამატებული' : 'No challenges added yet'}
                </p>
            ) : (
                <ul className={styles.list}>
                    {problems.map((problem, index) => (
                        <li key={problem.id}>
                            <button
                                type="button"
                                className={styles.row}
                                onClick={() =>
                                    navigate(
                                        `/challenges/${chapterCode}/${encodeURIComponent(
                                            problemToSlug(chapter.code, problem.code)
                                        )}`
                                    )
                                }
                                aria-label={problem.title}
                            >
                                <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                                <span className={styles.code}>{problem.code}</span>
                                <span className={styles.problemTitle}>{problem.title}</span>
                                <span className={styles.arrow} aria-hidden>→</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
