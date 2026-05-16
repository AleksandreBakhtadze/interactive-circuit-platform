import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo}>CircuitLab</Link>
          <div className={styles.actions}>
            <Link to="/challenges" className={`${styles.navLink} ${location.pathname.startsWith('/challenges') ? styles.active : ''}`}>
              {t.nav_challenges}
            </Link>

            {user ? (
                <>
                  <Link to="/profile" className={styles.btnOutline}>{t.nav_profile}</Link>
                  <button className={styles.btnPrimary} onClick={handleLogout}>{t.nav_logout}</button>
                </>
            ) : (
                <>
                  <Link to="/register" className={styles.btnOutline}>{t.nav_register}</Link>
                  <Link to="/login" className={styles.btnPrimary}>{t.nav_login}</Link>
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