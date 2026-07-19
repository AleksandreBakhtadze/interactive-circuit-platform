import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
    const { t } = useLang();
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [errorCode, setErrorCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorCode('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/users/register`, {
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
            navigate('/challenges');
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
                    <h1 className={styles.title}>{t.reg_title}</h1>
                    <p className={styles.sub}>{t.reg_sub}</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="reg-username">{t.reg_username}</label>
                        <input
                            id="reg-username"
                            className={styles.input}
                            type="text"
                            name="username"
                            placeholder={t.reg_username_ph}
                            value={form.username}
                            onChange={handleChange}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="reg-email">{t.reg_email}</label>
                        <input
                            id="reg-email"
                            className={styles.input}
                            type="email"
                            name="email"
                            placeholder={t.reg_email_ph}
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="reg-password">{t.reg_password}</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                id="reg-password"
                                className={styles.input}
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder={t.reg_password_ph}
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />
                            <button
                                type="button"
                                className={styles.toggle}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? t.reg_hide : t.reg_show}
                            </button>
                        </div>
                    </div>

                    {errorCode && (
                        <p className={styles.error} role="alert">
                            {t['err_' + errorCode] || t.reg_error}
                        </p>
                    )}

                    <button type="submit" className={styles.btn} disabled={loading}>
                        {loading ? t.reg_loading : t.reg_btn}
                    </button>
                </form>

                <p className={styles.footer}>
                    {t.reg_have_account}{' '}
                    <Link to="/login" className={styles.link}>{t.reg_login}</Link>
                </p>
            </div>
        </main>
    );
}
