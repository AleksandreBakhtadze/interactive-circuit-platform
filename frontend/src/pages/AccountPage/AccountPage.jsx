import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import styles from './AccountPage.module.css';

export default function AccountPage() {
    const { lang, t } = useLang();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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
                            ? 'შენი პროფილი და ამოხსნილი ამოცანები'
                            : 'Your profile and solved challenges'}
                    </p>
                </div>

                <dl className={styles.meta}>
                    <div className={styles.metaRow}>
                        <dt className={styles.metaLabel}>
                            {lang === 'ka' ? 'მომხმარებელი' : 'Username'}
                        </dt>
                        <dd className={styles.metaValue}>{user.username}</dd>
                    </div>
                    <div className={styles.metaRow}>
                        <dt className={styles.metaLabel}>
                            {lang === 'ka' ? 'ელ-ფოსტა' : 'Email'}
                        </dt>
                        <dd className={styles.metaValue}>{user.email || '—'}</dd>
                    </div>
                </dl>

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
