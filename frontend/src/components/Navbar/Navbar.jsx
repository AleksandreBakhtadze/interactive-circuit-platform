import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { lang, setLang, t } = useLang();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo}>MazyConnect</Link>
          <div className={styles.actions}>
            <Link to="/challenges" className={`${styles.navLink} ${location.pathname.startsWith('/challenges') ? styles.active : ''}`}>
              {t.nav_challenges}
            </Link>
            <Link to="/lab" className={`${styles.navLink} ${location.pathname === '/lab' ? styles.active : ''}`}>
              {t.nav_lab}
            </Link>
            <Link to="/kit" className={`${styles.navLink} ${location.pathname === '/kit' ? styles.active : ''}`}>
              {t.nav_kit}
            </Link>

            {user ? (
                  <Link
                    to="/account"
                    className={`${styles.userChip} ${location.pathname === '/account' || location.pathname === '/profile' ? styles.userChipActive : ''}`}
                    title={user.email || user.username}
                  >
                    <span className={styles.userName}>{user.username}</span>
                  </Link>
            ) : (
                <>
                  <Link to="/login" className={styles.btnGhost}>{t.nav_login}</Link>
                  <Link to="/register" className={styles.btnPrimary}>{t.nav_register}</Link>
                </>
            )}

            <div className={styles.langToggle}>
              <button className={`${styles.langBtn} ${lang === 'ka' ? styles.langActive : ''}`} onClick={() => setLang('ka')}>KA</button>
              <span className={styles.langDivider}>/</span>
              <button className={`${styles.langBtn} ${lang === 'en' ? styles.langActive : ''}`} onClick={() => setLang('en')}>EN</button>
            </div>
          </div>
        </div>
      </nav>
  );
}
