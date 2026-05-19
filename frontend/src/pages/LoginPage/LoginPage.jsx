import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api';
import styles from './LoginPage.module.css';

export default function LoginPage() {
    const { t } = useLang();
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ identifier: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [errorCode, setErrorCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorCode('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const text = await res.text();
                setErrorCode(text);
                return;
            }

            const data = await res.json();
            login(data);
            navigate('/');
        } catch (err) {
            setErrorCode('NETWORK_ERROR');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.headerLine} />
                    <h1 className={styles.title}>{t.login_title}</h1>
                    <p className={styles.sub}>{t.login_sub}</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label className={styles.label}>{t.login_identifier}</label>
                        <input
                            className={styles.input}
                            type="text"
                            name="identifier"
                            placeholder={t.login_identifier_ph}
                            value={form.identifier}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>{t.login_password}</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                className={styles.input}
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder={t.login_password_ph}
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className={styles.toggle}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? t.login_hide : t.login_show}
                            </button>
                        </div>
                    </div>

                    {errorCode && <p className={styles.error}>{t['err_' + errorCode] || t.login_error}</p>}

                    <button type="submit" className={styles.btn} disabled={loading}>
                        {loading ? t.login_loading : t.login_btn}
                    </button>
                </form>

                <p className={styles.footer}>
                    {t.login_no_account}{' '}
                    <Link to="/register" className={styles.link}>{t.login_register}</Link>
                </p>
            </div>
        </main>
    );
}