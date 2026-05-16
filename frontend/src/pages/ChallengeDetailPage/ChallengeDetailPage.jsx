import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CircuitBoard from '../../components/CircuitBoard/CircuitBoard';
import CircuitWorkbench from '../../components/CircuitBoard/CircuitWorkbench';
import { supportsSimulator } from '../../constants/componentCatalog';
import { useLang } from '../../context/LangContext';
import styles from './ChallengeDetailPage.module.css';

const API = 'http://localhost:8080/api';

export default function ChallengeDetailPage() {
    const { chapterCode, problemSlug } = useParams();
    const { lang } = useLang();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!chapterCode || !problemSlug) return;

        setLoading(true);
        setError('');

        fetch(
            `${API}/chapters/${encodeURIComponent(chapterCode)}/problems/${encodeURIComponent(problemSlug)}`
        )
            .then((res) => {
                if (!res.ok) {
                    const err = new Error('request_failed');
                    err.status = res.status;
                    throw err;
                }
                return res.json();
            })
            .then((data) => {
                setProblem(data);
                setLoading(false);
            })
            .catch((err) => {
                if (err.status === 404) {
                    setError(lang === 'ka' ? 'ამოცანა ვერ მოიძებნა' : 'Challenge not found');
                } else {
                    setError(lang === 'ka' ? 'სერვერთან კავშირი ვერ მოხერხდა' : 'Could not connect to server');
                }
                setLoading(false);
            });
    }, [chapterCode, problemSlug, lang]);

    const listPath = `/challenges/${chapterCode}`;

    if (loading) {
        return (
            <main className={styles.main}>
                <p className={styles.status}>{lang === 'ka' ? 'იტვირთება...' : 'Loading...'}</p>
            </main>
        );
    }

    if (error || !problem) {
        return (
            <main className={styles.main}>
                <p className={styles.status}>{error}</p>
                <Link to={listPath} className={styles.backLink}>
                    {lang === 'ka' ? '← ამოცანების სია' : '← Back to list'}
                </Link>
            </main>
        );
    }

    const sections = [
        { key: 'description', labelKa: 'ამოცანის პირობა', labelEn: 'Challenge', value: problem.description },
        { key: 'hint', labelKa: 'დახმარება', labelEn: 'Hint', value: problem.hint },
        { key: 'questions', labelKa: 'შეკითხვები', labelEn: 'Questions', value: problem.questions },
        { key: 'methodology', labelKa: 'მეთოდიკა', labelEn: 'Methodology', value: problem.methodology },
    ].filter((s) => s.value && s.value.trim());

    return (
        <main className={styles.main}>
            <div className={styles.layout}>
                <div className={styles.contentColumn}>
                    <div className={styles.header}>
                <Link to={listPath} className={styles.backLink}>
                    {lang === 'ka' ? `← ${chapterCode} ამოცანები` : `← ${chapterCode} challenges`}
                </Link>
                <span className={styles.eyebrow}>{problem.code}</span>
                <h1 className={styles.title}>{problem.title}</h1>
                {problem.difficulty && (
                    <span className={styles.badge}>{problem.difficulty}</span>
                )}
            </div>

            {sections.length > 0 ? (
                <div className={styles.sections}>
                    {sections.map((section) => (
                        <section key={section.key} className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                {lang === 'ka' ? section.labelKa : section.labelEn}
                            </h2>
                            <p className={styles.sectionBody}>{section.value}</p>
                        </section>
                    ))}
                </div>
            ) : (
                <p className={styles.placeholder}>
                    {lang === 'ka'
                        ? 'ამოცანის აღწერა მალე დაემატება.'
                        : 'Challenge details will be added soon.'}
                </p>
                    )}

                <div className={styles.boardColumn}>
                    {supportsSimulator(problem.code) ? (
                        <CircuitWorkbench problemCode={problem.code} />
                    ) : (
                        <CircuitBoard label={problem.code} />
                    )}
                </div>
                </div>
            </div>
        </main>
    );
}
