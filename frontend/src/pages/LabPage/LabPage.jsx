import CircuitWorkbench from '../../components/CircuitBoard/CircuitWorkbench';
import { useLang } from '../../context/LangContext';
import styles from './LabPage.module.css';

export default function LabPage() {
    const { lang, t } = useLang();

    return (
        <main className={styles.main}>
            <div className={styles.layout}>
                <header className={styles.header}>
                    <p className={styles.eyebrow}>
                        {lang === 'ka' ? 'სასწავლო ნაკრები' : 'Learning kit'}
                    </p>
                    <h1 className={styles.title}>{t.lab_title}</h1>
                    <p className={styles.sub}>{t.lab_sub}</p>
                </header>
                <div className={styles.boardColumn}>
                    <CircuitWorkbench problemCode="LAB" />
                </div>
            </div>
        </main>
    );
}
