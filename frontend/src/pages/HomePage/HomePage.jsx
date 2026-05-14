import { useLang } from '../../context/LangContext';
import styles from './HomePage.module.css';

export default function HomePage() {
    const { t } = useLang();

    const features = [
        { num: '01', title: t.feat1_title, desc: t.feat1_desc },
        { num: '02', title: t.feat2_title, desc: t.feat2_desc },
        { num: '03', title: t.feat3_title, desc: t.feat3_desc },
    ];

    return (
        <main className={styles.main}>

            <section className={styles.hero}>
                <div className={styles.heroInner}>
                    <p className={styles.eyebrow}>{t.eyebrow}</p>
                    <h1 className={styles.title}>
                        {t.hero_title_1}<br />
                        <span className={styles.accent}>{t.hero_accent}</span>
                    </h1>
                    <p className={styles.sub}>{t.hero_sub}</p>
                    <a href="/register" className={styles.cta}>{t.hero_cta}</a>
                </div>
            </section>

            <section className={styles.about}>
                <div className={styles.aboutInner}>
                    <div className={styles.aboutText}>
                        <span className={styles.sectionLabel}>{t.about_label}</span>
                        <p className={styles.aboutBody}>{t.about_body}</p>
                    </div>
                    <div className={styles.aboutStats}>
                        <div className={styles.stat}>
                            <span className={styles.statNum}>3</span>
                            <span className={styles.statDesc}>{t.stat1}</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNum}>50+</span>
                            <span className={styles.statDesc}>{t.stat2}</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNum}>4</span>
                            <span className={styles.statDesc}>{t.stat3}</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.features}>
                {features.map((f) => (
                    <div key={f.num} className={styles.card}>
                        <span className={styles.num}>{f.num}</span>
                        <h3 className={styles.cardTitle}>{f.title}</h3>
                        <p className={styles.cardDesc}>{f.desc}</p>
                    </div>
                ))}
            </section>

            <section className={styles.taskTypes}>
                <div className={styles.taskTypesInner}>
                    <span className={styles.sectionLabel}>{t.tasks_label}</span>
                    <div className={styles.taskGrid}>
                        <div className={styles.taskCard}>
                            <span className={styles.taskTag}>{t.task1_tag}</span>
                            <p className={styles.taskDesc}>{t.task1_desc}</p>
                        </div>
                        <div className={styles.taskCard}>
                            <span className={styles.taskTag}>{t.task2_tag}</span>
                            <p className={styles.taskDesc}>{t.task2_desc}</p>
                        </div>
                        <div className={styles.taskCard}>
                            <span className={styles.taskTag}>{t.task3_tag}</span>
                            <p className={styles.taskDesc}>{t.task3_desc}</p>
                        </div>
                        <div className={styles.taskCard}>
                            <span className={styles.taskTag}>{t.task4_tag}</span>
                            <p className={styles.taskDesc}>{t.task4_desc}</p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className={styles.footer}>{t.footer}</footer>
        </main>
    );
}