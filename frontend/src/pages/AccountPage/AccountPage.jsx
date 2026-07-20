import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api';
import { ChapterIcon, getChapterMeta } from '../../constants/chapterMeta';
import ProgressRing from '../../components/ProgressRing/ProgressRing';
import ActivityHeatmap from '../../components/ActivityHeatmap/ActivityHeatmap';
import styles from './AccountPage.module.css';

export default function AccountPage() {
    const { lang, t } = useLang();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
        if (!user?.id) {
            setStats(null);
            return;
        }

        let cancelled = false;
        setStatsLoading(true);

        fetch(`${API_BASE}/users/${user.id}/stats`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!cancelled && data) {
                    setStats({
                        solvedCount: Number(data.solvedCount) || 0,
                        totalCount: Number(data.totalCount) || 0,
                        badges: Array.isArray(data.badges) ? data.badges : [],
                        activity: Array.isArray(data.activity) ? data.activity : [],
                    });
                }
            })
            .catch(() => {
                if (!cancelled) setStats(null);
            })
            .finally(() => {
                if (!cancelled) setStatsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    if (!user) {
        return (
            <main className={styles.main}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.headerLine} />
                        <h1 className={styles.title}>
                            {lang === 'ka' ? 'ანგარიში' : 'Account'}
                        </h1>
                        <p className={styles.sub}>
                            {lang === 'ka'
                                ? 'პროგრესის შესანახად შედი ანგარიშში'
                                : 'Sign in to save your challenge progress'}
                        </p>
                    </div>
                    <div className={styles.actions}>
                        <Link to="/login" className={styles.btnPrimary}>
                            {t.nav_login}
                        </Link>
                        <Link to="/register" className={styles.btnGhost}>
                            {t.nav_register}
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const solvedLabel = (() => {
        if (statsLoading) return t.account_solved_loading;
        if (!stats) return '—';
        return t.account_solved_count
            .replace('{solved}', String(stats.solvedCount))
            .replace('{total}', String(stats.totalCount));
    })();

    const solvedCount = stats?.solvedCount ?? 0;
    const totalCount = stats?.totalCount ?? 0;
    const progressPct = totalCount > 0
        ? Math.round((solvedCount / totalCount) * 100)
        : 0;
    const initial = user.username?.charAt(0)?.toUpperCase() || '?';

    return (
        <main className={styles.main}>
            <div className={styles.card}>
                <header className={styles.profileHero}>
                    <div className={styles.heroGlow} aria-hidden />
                    <div className={styles.avatar} aria-hidden>
                        {initial}
                    </div>
                    <div className={styles.heroText}>
                        <span className={styles.eyebrow}>CircuitLab</span>
                        <h1 className={styles.heroName}>{user.username}</h1>
                        <p className={styles.heroSub}>
                            {lang === 'ka'
                                ? 'შენი პროგრესი და მიღებული ბეჯები'
                                : 'Your progress and earned badges'}
                        </p>
                    </div>
                </header>

                <div className={styles.dashboard}>
                    <section className={styles.progressCard} aria-label={t.account_solved}>
                        <div className={styles.progressTop}>
                            <ProgressRing
                                value={solvedCount}
                                max={totalCount || 1}
                                size={72}
                                stroke={6}
                                color="#60c5f1"
                            />
                            <div className={styles.progressCopy}>
                                <span className={styles.progressLabel}>{t.account_solved}</span>
                                <span className={styles.progressValue}>
                                    {statsLoading ? t.account_solved_loading : solvedLabel}
                                </span>
                                {!statsLoading && stats && (
                                    <span className={styles.progressPct}>
                                        {progressPct}%
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className={styles.progressTrack} aria-hidden>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </section>

                    <section className={styles.infoCard}>
                        <span className={styles.infoIcon} aria-hidden>
                            @
                        </span>
                        <div className={styles.infoCopy}>
                            <span className={styles.infoLabel}>
                                {lang === 'ka' ? 'ელ-ფოსტა' : 'Email'}
                            </span>
                            <span className={styles.infoValue}>{user.email || '—'}</span>
                        </div>
                    </section>
                </div>

                {!statsLoading && (
                    <ActivityHeatmap
                        activity={stats?.activity ?? []}
                        lang={lang}
                        title={t.account_activity}
                        lessLabel={t.account_activity_less}
                        moreLabel={t.account_activity_more}
                    />
                )}

                <section className={styles.badgesSection} aria-labelledby="account-badges-label">
                    <h2 id="account-badges-label" className={styles.metaLabel}>
                        {t.account_badges}
                    </h2>
                    {statsLoading ? (
                        <p className={styles.badgesEmpty}>{t.account_solved_loading}</p>
                    ) : !stats?.badges?.length ? (
                        <p className={styles.badgesEmpty}>{t.account_badges_empty}</p>
                    ) : (
                        <ul className={styles.badgeGrid}>
                            {stats.badges.map((badge) => {
                                const meta = getChapterMeta(badge.chapterCode);
                                const title = lang === 'ka' ? badge.titleKa : badge.titleEn;
                                return (
                                    <li key={badge.chapterCode}>
                                        <div
                                            className={styles.badgeItem}
                                            style={{
                                                '--badge-accent': meta.accent,
                                                '--badge-icon-bg': meta.iconBg,
                                            }}
                                            title={title}
                                        >
                                            <ChapterIcon name={meta.icon} color={meta.accent} />
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <div className={styles.actions}>
                    <Link to="/challenges" className={styles.btnPrimary}>
                        {lang === 'ka' ? 'ამოცანები' : 'Challenges'}
                    </Link>
                    <button
                        type="button"
                        className={styles.btnGhost}
                        onClick={handleLogout}
                    >
                        {t.nav_logout}
                    </button>
                </div>
            </div>
        </main>
    );
}
