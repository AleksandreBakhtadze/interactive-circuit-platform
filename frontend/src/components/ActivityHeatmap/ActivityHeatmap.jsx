import { useMemo } from 'react';
import styles from './ActivityHeatmap.module.css';

const MONTHS = 5;
const LEVEL_COLORS = [
    'var(--heat-0)',
    'var(--heat-1)',
    'var(--heat-2)',
    'var(--heat-3)',
    'var(--heat-4)',
];

function toDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function countToLevel(count) {
    if (count <= 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return 4;
}

function startOfWeekSunday(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
}

function buildWeeks(activityMap) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endSunday = startOfWeekSunday(today);

    const rangeStart = new Date(today);
    rangeStart.setMonth(rangeStart.getMonth() - MONTHS);
    const startSunday = startOfWeekSunday(rangeStart);

    const weeks = [];
    const cursor = new Date(startSunday);

    while (cursor <= endSunday) {
        const week = [];
        for (let day = 0; day < 7; day += 1) {
            const current = new Date(cursor);
            current.setDate(cursor.getDate() + day);
            const key = toDateKey(current);
            const count = activityMap.get(key) ?? 0;
            week.push({
                date: current,
                key,
                count,
                level: countToLevel(count),
                future: current > today,
            });
        }
        weeks.push(week);
        cursor.setDate(cursor.getDate() + 7);
    }

    return weeks;
}

function buildMonthLabels(weeks, lang) {
    const fmt = new Intl.DateTimeFormat(lang === 'ka' ? 'ka-GE' : 'en-US', {
        month: 'short',
    });
    const labels = [];
    let lastMonth = -1;

    weeks.forEach((week, index) => {
        const month = week[0].date.getMonth();
        if (month !== lastMonth) {
            labels.push({ index, label: fmt.format(week[0].date) });
            lastMonth = month;
        }
    });

    return labels;
}

export default function ActivityHeatmap({ activity = [], lang, title, lessLabel, moreLabel }) {
    const activityMap = useMemo(() => {
        const map = new Map();
        activity.forEach((item) => {
            if (item?.date) map.set(item.date, Number(item.count) || 0);
        });
        return map;
    }, [activity]);

    const weeks = useMemo(() => buildWeeks(activityMap), [activityMap]);
    const monthLabels = useMemo(() => buildMonthLabels(weeks, lang), [weeks, lang]);

    const tooltipFmt = useMemo(
        () => new Intl.DateTimeFormat(lang === 'ka' ? 'ka-GE' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
        [lang]
    );

    return (
        <section className={styles.wrap} aria-label={title}>
            <h2 className={styles.title}>{title}</h2>

            <div className={styles.calendarFrame}>
                <div
                    className={styles.chart}
                    style={{ '--week-count': weeks.length }}
                >
                <div className={styles.monthRow} aria-hidden>
                    {monthLabels.map(({ index, label }) => (
                        <span
                            key={`${label}-${index}`}
                            className={styles.monthLabel}
                            style={{ gridColumn: index + 1 }}
                        >
                            {label}
                        </span>
                    ))}
                </div>

                <div className={styles.grid}>
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className={styles.weekCol}>
                            {week.map((day) => (
                                <span
                                    key={day.key}
                                    className={styles.cell}
                                    style={{
                                        background: day.future
                                            ? 'transparent'
                                            : LEVEL_COLORS[day.level],
                                        opacity: day.future ? 0 : 1,
                                    }}
                                    title={
                                        day.future
                                            ? ''
                                            : `${tooltipFmt.format(day.date)} — ${day.count} ${
                                                lang === 'ka' ? 'ამოცანა' : 'solved'
                                            }`
                                    }
                                />
                            ))}
                        </div>
                    ))}
                </div>
                </div>

                <div className={styles.legend} aria-hidden>
                    <span>{lessLabel}</span>
                    {LEVEL_COLORS.map((color, index) => (
                        <span
                            key={index}
                            className={styles.legendCell}
                            style={{ background: color }}
                        />
                    ))}
                    <span>{moreLabel}</span>
                </div>
            </div>
        </section>
    );
}
