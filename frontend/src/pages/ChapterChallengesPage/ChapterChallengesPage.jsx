import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { problemToSlug } from '../../utils/problemSlug';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api';
import { ChapterIcon, getChapterMeta } from '../../constants/chapterMeta';
import styles from './ChapterChallengesPage.module.css';

async function fetchChapterDetail(chapterCode, userId) {
    const qs = userId != null ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(
        `${API_BASE}/chapters/${encodeURIComponent(chapterCode)}/detail${qs}`
    );
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
    const { user } = useAuth();
    const [chapter, setChapter] = useState(null);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!chapterCode) return;

        setLoading(true);
        setError('');

        fetchChapterDetail(chapterCode, user?.id)
            .then((data) => {
                setChapter(data.chapter);
                setProblems(data.problems ?? []);
                setLoading(false);
            })
            .catch((err) => {
                if (err.status === 404) {
                    setError(lang === 'ka' ? 'თავი ვერ მოიძებნა' : 'Chapter not found');
                } else if (err.message === 'request_failed') {
                    setError(
                        lang === 'ka'
                            ? 'სერვერმა მოთხოვნა უარყო'
                            : 'Server rejected the request'
                    );
                } else {
                    setError(
                        lang === 'ka'
                            ? 'სერვერთან კავშირი ვერ მოხერხდა'
                            : 'Could not connect to server'
                    );
                }
                setLoading(false);
            });
    }, [chapterCode, lang, user?.id]);

    const meta = useMemo(
        () => getChapterMeta(chapter?.code ?? chapterCode),
        [chapter?.code, chapterCode]
    );

    if (loading) {
        return (
            <main className={styles.main}>
                <p className={styles.status}>
                    {lang === 'ka' ? 'იტვირთება...' : 'Loading...'}
                </p>
            </main>
        );
    }

    if (error || !chapter) {
        return (
            <main className={styles.main}>
                <p className={styles.status}>
                    {error || (lang === 'ka' ? 'თავი ვერ მოიძებნა' : 'Chapter not found')}
                </p>
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
    const visibleProblems =
        chapter?.code === 'ST'
            ? problems.filter(
                  (p) => p.code !== 'ST.L1.6' && p.code !== 'ST.L1.7'
              )
            : problems;
    const solvedCount = visibleProblems.filter((p) => p.solved).length;
    const totalCount = visibleProblems.length;

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <Link to="/challenges" className={styles.backLink}>
                    {lang === 'ka' ? '← თავები' : '← Chapters'}
                </Link>

                <div className={styles.headerRow}>
                    <span
                        className={styles.iconTile}
                        style={{
                            background: meta.iconBg,
                            borderColor: `${meta.accent}55`,
                        }}
                    >
                        <ChapterIcon name={meta.icon} color={meta.accent} />
                    </span>
                    <div>
                        <h1 className={styles.title}>{chapterTitle}</h1>
                        <p className={styles.sub}>
                            {user
                                ? lang === 'ka'
                                    ? `${solvedCount} / ${totalCount} ამოხსნილი`
                                    : `${solvedCount} / ${totalCount} solved`
                                : lang === 'ka'
                                  ? `${totalCount} ამოცანა`
                                  : `${totalCount} challenges`}
                        </p>
                    </div>
                </div>
            </div>

            {visibleProblems.length === 0 ? (
                <p className={styles.empty}>
                    {lang === 'ka'
                        ? 'ამოცანები ჯერ არ არის დამატებული'
                        : 'No challenges added yet'}
                </p>
            ) : (
                <ul className={styles.list} style={{ '--path-accent': meta.accent }}>
                    {visibleProblems.map((problem, index) => {
                        const solved = Boolean(problem.solved);
                        const isNext =
                            !solved &&
                            index === visibleProblems.findIndex((p) => !p.solved);

                        return (
                            <li key={problem.id}>
                                <button
                                    type="button"
                                    className={`${styles.row} ${
                                        solved ? styles.rowSolved : ''
                                    } ${isNext ? styles.rowCurrent : ''}`}
                                    onClick={() =>
                                        navigate(
                                            `/challenges/${chapterCode}/${encodeURIComponent(
                                                problemToSlug(chapter.code, problem.code)
                                            )}`
                                        )
                                    }
                                    aria-label={
                                        solved
                                            ? `${problem.title} (${lang === 'ka' ? 'ამოხსნილი' : 'solved'})`
                                            : problem.title
                                    }
                                >
                                    <span className={styles.code}>{problem.code}</span>
                                    <span className={styles.problemTitle}>{problem.title}</span>
                                    {solved ? (
                                        <span className={styles.solvedTag}>
                                            {lang === 'ka' ? 'ამოხსნილი' : 'Solved'}
                                        </span>
                                    ) : (
                                        <span className={styles.go} aria-hidden>
                                            →
                                        </span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </main>
    );
}
