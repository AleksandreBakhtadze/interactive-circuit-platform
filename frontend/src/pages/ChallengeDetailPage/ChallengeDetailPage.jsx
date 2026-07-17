import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CircuitBoard from '../../components/CircuitBoard/CircuitBoard';
import CircuitWorkbench from '../../components/CircuitBoard/CircuitWorkbench';
import ProblemQuiz from '../../components/ProblemQuiz/ProblemQuiz';
import { supportsSimulator } from '../../constants/componentCatalog';
import { getFiguresForProblem } from '../../constants/problemFigures';
import { getQuizForProblem } from '../../constants/problemQuizzes';
import { useLang } from '../../context/LangContext';
import { API_BASE } from '../../api';
import styles from './ChallengeDetailPage.module.css';

function hasText(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

export default function ChallengeDetailPage() {
    const { chapterCode, problemSlug } = useParams();
    const { lang } = useLang();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [hintOpen, setHintOpen] = useState(false);
    const [questionsOpen, setQuestionsOpen] = useState(false);
    const [methodOpen, setMethodOpen] = useState(false);

    useEffect(() => {
        if (!chapterCode || !problemSlug) return;

        setLoading(true);
        setError('');
        setHintOpen(false);
        setQuestionsOpen(false);
        setMethodOpen(false);

        fetch(
            `${API_BASE}/chapters/${encodeURIComponent(chapterCode)}/problems/${encodeURIComponent(problemSlug)}`
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
                    setError(
                        lang === 'ka'
                            ? 'სერვერთან კავშირი ვერ მოხერხდა'
                            : 'Could not connect to server'
                    );
                }
                setLoading(false);
            });
    }, [chapterCode, problemSlug, lang]);

    const listPath = `/challenges/${chapterCode}`;

    if (loading) {
        return (
            <main className={styles.main}>
                <p className={styles.status}>
                    {lang === 'ka' ? 'იტვირთება...' : 'Loading...'}
                </p>
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

    const usesSim = supportsSimulator(problem.code);
    const figures = getFiguresForProblem(problem.code);
    const quiz = getQuizForProblem(problem.code);
    const description = hasText(problem.description) ? problem.description.trim() : '';
    const hint = hasText(problem.hint) ? problem.hint.trim() : '';
    const questions =
        !quiz && hasText(problem.questions) ? problem.questions.trim() : '';
    const methodology = hasText(problem.methodology)
        ? problem.methodology.trim()
        : '';

    return (
        <main
            className={`${styles.main} ${usesSim ? styles.mainWithWorkbench : ''}`}
        >
            <div className={styles.layout}>
                <div className={styles.contentColumn}>
                    <header className={styles.header}>
                        <Link to={listPath} className={styles.backLink}>
                            {lang === 'ka'
                                ? `← ${chapterCode} ამოცანები`
                                : `← ${chapterCode} challenges`}
                        </Link>
                        <div className={styles.titleRow}>
                            <span className={styles.eyebrow}>{problem.code}</span>
                            {problem.difficulty && (
                                <span className={styles.badge}>
                                    {problem.difficulty}
                                </span>
                            )}
                        </div>
                        <h1 className={styles.title}>{problem.title}</h1>
                    </header>

                    {description ? (
                        <section className={styles.challengeBrief} aria-labelledby="challenge-brief">
                            <h2 id="challenge-brief" className={styles.briefLabel}>
                                {lang === 'ka' ? 'ამოცანა' : 'Challenge'}
                            </h2>
                            <p className={styles.briefBody}>{description}</p>
                            {figures.length > 0 && (
                                <div className={styles.figureGrid}>
                                    {figures.map((fig) => (
                                        <figure key={fig.src} className={styles.figure}>
                                            <img
                                                src={fig.src}
                                                alt={
                                                    lang === 'ka'
                                                        ? fig.altKa
                                                        : fig.altEn
                                                }
                                                className={styles.figureImg}
                                            />
                                            <figcaption className={styles.figureCaption}>
                                                {lang === 'ka'
                                                    ? fig.captionKa
                                                    : fig.captionEn}
                                            </figcaption>
                                        </figure>
                                    ))}
                                </div>
                            )}
                        </section>
                    ) : (
                        <p className={styles.placeholder}>
                            {lang === 'ka'
                                ? 'ამოცანის აღწერა მალე დაემატება.'
                                : 'Challenge details will be added soon.'}
                        </p>
                    )}

                    <div className={styles.boardColumn}>
                        {usesSim ? (
                            <CircuitWorkbench problemCode={problem.code} />
                        ) : (
                            <CircuitBoard label={problem.code} />
                        )}
                    </div>

                    {(hint || quiz || questions || methodology) && (
                        <div className={styles.afterBoard}>
                            {hint && (
                                <div className={styles.hintPanel}>
                                    {!hintOpen ? (
                                        <button
                                            type="button"
                                            className={styles.hintRevealBtn}
                                            onClick={() => setHintOpen(true)}
                                        >
                                            {lang === 'ka'
                                                ? 'მინიშნების ჩვენება'
                                                : 'Reveal hint'}
                                        </button>
                                    ) : (
                                        <div className={styles.hintCard}>
                                            <div className={styles.hintCardTop}>
                                                <h3 className={styles.panelTitle}>
                                                    {lang === 'ka'
                                                        ? 'მინიშნება'
                                                        : 'Hint'}
                                                </h3>
                                                <button
                                                    type="button"
                                                    className={styles.hintHideBtn}
                                                    onClick={() => setHintOpen(false)}
                                                >
                                                    {lang === 'ka' ? 'დამალვა' : 'Hide'}
                                                </button>
                                            </div>
                                            <p className={styles.panelBody}>{hint}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {quiz && (
                                <div className={styles.quizPanel}>
                                    <ProblemQuiz
                                        key={problem.code}
                                        quiz={quiz}
                                    />
                                </div>
                            )}

                            {(questions || methodology) && (
                                <div className={styles.learnRail}>
                                    <p className={styles.learnIntro}>
                                        {lang === 'ka'
                                            ? 'ააწყვე წრედი, შემდეგ გაიაზრე —'
                                            : 'Build first, then reflect —'}
                                    </p>

                                    {questions && (
                                        <div className={styles.learnItem}>
                                            <button
                                                type="button"
                                                className={styles.learnSummary}
                                                aria-expanded={questionsOpen}
                                                onClick={() =>
                                                    setQuestionsOpen((v) => !v)
                                                }
                                            >
                                                <span>
                                                    {lang === 'ka'
                                                        ? 'შეკითხვები'
                                                        : 'Think about it'}
                                                </span>
                                                <span
                                                    className={styles.learnChevron}
                                                    aria-hidden
                                                >
                                                    {questionsOpen ? '−' : '+'}
                                                </span>
                                            </button>
                                            {questionsOpen && (
                                                <p className={styles.panelBody}>
                                                    {questions}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {methodology && (
                                        <div className={styles.learnItem}>
                                            <button
                                                type="button"
                                                className={styles.learnSummary}
                                                aria-expanded={methodOpen}
                                                onClick={() =>
                                                    setMethodOpen((v) => !v)
                                                }
                                            >
                                                <span>
                                                    {lang === 'ka'
                                                        ? 'როგორ მუშაობს'
                                                        : 'How it works'}
                                                </span>
                                                <span
                                                    className={styles.learnChevron}
                                                    aria-hidden
                                                >
                                                    {methodOpen ? '−' : '+'}
                                                </span>
                                            </button>
                                            {methodOpen && (
                                                <p className={styles.panelBody}>
                                                    {methodology}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
