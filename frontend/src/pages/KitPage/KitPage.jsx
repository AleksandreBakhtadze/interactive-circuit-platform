import { Link } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import { KIT_CATEGORIES } from '../../constants/kitInventory';
import styles from './KitPage.module.css';

function PartVisual({ item }) {
    if (item.images?.length) {
        return (
            <div className={styles.softPair}>
                {item.images.map((src) => (
                    <img key={src} src={src} alt="" className={styles.partImgSoft} />
                ))}
            </div>
        );
    }
    return (
        <img
            src={item.image}
            alt=""
            className={`${styles.partImg} ${item.id === 'board' ? styles.partImgBoard : ''}`}
        />
    );
}

function PartMeta({ item, isKa }) {
    const name = isKa ? item.nameKa : item.nameEn;
    const subtitle = isKa ? item.subtitleKa : item.subtitleEn;
    const detail = isKa ? item.detailKa : item.detailEn;
    const badgeStyle = item.badge
        ? { '--item-badge': item.badge }
        : undefined;

    return (
        <div className={styles.partMeta} style={badgeStyle}>
            <div className={styles.partText}>
                <div className={styles.partTitleRow}>
                    {item.label && (
                        <span className={styles.partLabel}>{item.label}</span>
                    )}
                    <span className={styles.partName}>{name}</span>
                    {item.qty != null && (
                        <span className={styles.qty}>× {item.qty}</span>
                    )}
                </div>
                {subtitle && (
                    <span className={styles.partSubtitle}>{subtitle}</span>
                )}
                {detail && (
                    <p className={styles.partDetail}>{detail}</p>
                )}
            </div>
        </div>
    );
}

export default function KitPage() {
    const { lang, t } = useLang();
    const isKa = lang === 'ka';

    return (
        <main className={styles.main}>
            <header className={styles.hero}>
                <div className={styles.heroGlow} aria-hidden />
                <div className={styles.heroInner}>
                    <p className={styles.eyebrow}>{t.kit_eyebrow}</p>
                    <h1 className={styles.title}>
                        {t.kit_title}
                        <span className={styles.titleAccent}>{t.kit_title_accent}</span>
                    </h1>
                    <p className={styles.sub}>{t.kit_sub}</p>
                    <div className={styles.heroActions}>
                        <Link to="/challenges" className={styles.ctaPrimary}>
                            {t.hero_cta}
                        </Link>
                    </div>
                </div>
            </header>

            <nav className={styles.toc} aria-label={t.kit_toc_label}>
                <div className={styles.tocInner}>
                    {KIT_CATEGORIES.map((cat) => (
                        <a
                            key={cat.id}
                            href={`#${cat.id}`}
                            className={styles.tocLink}
                            style={{ '--cat-accent': cat.accent }}
                        >
                            {isKa ? cat.titleKa : cat.titleEn}
                        </a>
                    ))}
                </div>
            </nav>

            <div className={styles.body}>
                {KIT_CATEGORIES.map((cat) => (
                    <section
                        key={cat.id}
                        id={cat.id}
                        className={`${styles.section} ${cat.featured ? styles.sectionFeatured : ''}`}
                        style={{ '--cat-accent': cat.accent }}
                    >
                        <div className={styles.sectionHead}>
                            <h2 className={styles.sectionTitle}>
                                {isKa ? cat.titleKa : cat.titleEn}
                            </h2>
                            <p className={styles.sectionDesc}>
                                {isKa ? cat.descKa : cat.descEn}
                            </p>
                        </div>

                        {cat.featured ? (
                            <div className={styles.featuredRow}>
                                <div className={styles.featuredVisual}>
                                    <PartVisual item={cat.items[0]} />
                                </div>
                                <div className={styles.featuredCopy}>
                                    <PartMeta item={cat.items[0]} isKa={isKa} />
                                </div>
                            </div>
                        ) : (
                            <ul className={styles.partList}>
                                {cat.items.map((item) => (
                                    <li key={item.id} className={styles.partRow}>
                                        <div className={styles.partVisual}>
                                            <PartVisual item={item} />
                                        </div>
                                        <PartMeta item={item} isKa={isKa} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                ))}
            </div>

            <footer className={styles.footer}>{t.footer}</footer>
        </main>
    );
}
