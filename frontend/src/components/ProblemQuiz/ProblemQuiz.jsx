import { useMemo, useState } from 'react';
import { useLang } from '../../context/LangContext';
import styles from './ProblemQuiz.module.css';

/**
 * Interactive MCQ quiz: select answers → submit → show correct (green) + explanations.
 * @param {{ quiz: {
 *   titleKa: string,
 *   titleEn: string,
 *   questions: Array<{
 *     id: string,
 *     promptKa: string,
 *     promptEn: string,
 *     options: Array<{ key: string, textKa: string, textEn: string }>,
 *     correctKey: string,
 *     explanationKa: string,
 *     explanationEn: string,
 *   }>
 * } }} props
 */
export default function ProblemQuiz({ quiz }) {
    const { lang } = useLang();
    const questions = quiz?.questions ?? [];
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const allAnswered = useMemo(
        () => questions.length > 0 && questions.every((q) => answers[q.id]),
        [questions, answers]
    );

    const correctCount = useMemo(() => {
        if (!submitted) return 0;
        return questions.reduce(
            (n, q) => n + (answers[q.id] === q.correctKey ? 1 : 0),
            0
        );
    }, [submitted, questions, answers]);

    if (!quiz || questions.length === 0) {
        return null;
    }

    const selectAnswer = (questionId, key) => {
        if (submitted) return;
        setAnswers((prev) => ({ ...prev, [questionId]: key }));
    };

    const handleSubmit = () => {
        if (!allAnswered) return;
        setSubmitted(true);
    };

    const handleRetry = () => {
        setAnswers({});
        setSubmitted(false);
    };

    return (
        <section className={styles.quiz} aria-labelledby="problem-quiz-title">
            <div className={styles.header}>
                <h3 id="problem-quiz-title" className={styles.title}>
                    {lang === 'ka' ? quiz.titleKa : quiz.titleEn}
                </h3>
                {submitted && (
                    <p className={styles.score} role="status">
                        {lang === 'ka'
                            ? `${correctCount} / ${questions.length} სწორი`
                            : `${correctCount} / ${questions.length} correct`}
                    </p>
                )}
            </div>

            {questions.map((q, index) => {
                const selected = answers[q.id];
                const isCorrect = selected === q.correctKey;
                const showFeedback = submitted;

                return (
                    <div key={q.id} className={styles.question}>
                        <p className={styles.prompt}>
                            {index + 1}.{' '}
                            {lang === 'ka' ? q.promptKa : q.promptEn}
                        </p>
                        <ul className={styles.options} role="radiogroup">
                            {q.options.map((opt) => {
                                const isSelected = selected === opt.key;
                                const isAnswer = opt.key === q.correctKey;
                                let optionClass = styles.option;
                                if (showFeedback && isAnswer) {
                                    optionClass = `${styles.option} ${styles.optionCorrect}`;
                                } else if (
                                    showFeedback &&
                                    isSelected &&
                                    !isCorrect
                                ) {
                                    optionClass = `${styles.option} ${styles.optionWrong}`;
                                } else if (!showFeedback && isSelected) {
                                    optionClass = `${styles.option} ${styles.optionSelected}`;
                                }

                                return (
                                    <li key={opt.key}>
                                        <button
                                            type="button"
                                            role="radio"
                                            aria-checked={isSelected}
                                            className={optionClass}
                                            disabled={submitted}
                                            onClick={() =>
                                                selectAnswer(q.id, opt.key)
                                            }
                                        >
                                            <span className={styles.key}>
                                                {opt.key}.
                                            </span>
                                            <span className={styles.label}>
                                                {lang === 'ka'
                                                    ? opt.textKa
                                                    : opt.textEn}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                        {showFeedback && (
                            <p className={styles.explanation}>
                                {lang === 'ka'
                                    ? q.explanationKa
                                    : q.explanationEn}
                            </p>
                        )}
                    </div>
                );
            })}

            <div className={styles.actions}>
                {!submitted ? (
                    <>
                        <button
                            type="button"
                            className={styles.submitBtn}
                            disabled={!allAnswered}
                            onClick={handleSubmit}
                        >
                            {lang === 'ka' ? 'შემოწმება' : 'Check answers'}
                        </button>
                        {!allAnswered && (
                            <p className={styles.hint}>
                                {lang === 'ka'
                                    ? 'აირჩიეთ ყველა კითხვაზე პასუხი'
                                    : 'Select an answer for every question'}
                            </p>
                        )}
                    </>
                ) : (
                    <button
                        type="button"
                        className={styles.retryBtn}
                        onClick={handleRetry}
                    >
                        {lang === 'ka' ? 'თავიდან ცდა' : 'Try again'}
                    </button>
                )}
            </div>
        </section>
    );
}
