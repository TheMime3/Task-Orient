import React from 'react';
import {
  makeStyles,
  tokens,
  Button,
  Title2,
  Card,
  CardHeader,
} from '@fluentui/react-components';
import {
  Calendar24Regular,
  ChevronLeft24Regular,
  ChevronRight24Regular,
  Add24Regular,
} from '@fluentui/react-icons';
import type { CalendarEvent } from '../types';

const useStyles = makeStyles({
  root: {
    padding: '24px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  calendar: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
  },
  dayCell: {
    height: '120px',
    padding: '8px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '4px',
    ...tokens.borderRadius,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  today: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
  },
  dayHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
    marginBottom: '8px',
    textAlign: 'center',
    fontWeight: tokens.fontWeightSemibold,
  },
  event: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    padding: '2px 4px',
    borderRadius: '2px',
    fontSize: '12px',
    marginBottom: '2px',
    cursor: 'pointer',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

const Calendar: React.FC = () => {
  const styles = useStyles();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Mock events - replace with actual data
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Team Meeting',
      start: new Date(),
      end: new Date(),
      attendees: [],
      organizer: { id: '1', name: 'John Doe', email: 'john@example.com' },
      status: 'scheduled',
    },
  ];

  const currentDate = new Date();
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const renderCalendarDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === currentDate.getDate();
      days.push(
        <div
          key={day}
          className={`${styles.dayCell} ${isToday ? styles.today : ''}`}
        >
          <div style={{ marginBottom: '8px' }}>{day}</div>
          {events.map((event) => (
            <div key={event.id} className={styles.event}>
              {event.title}
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Title2>Calendar</Title2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button icon={<ChevronLeft24Regular />} />
            <Button icon={<ChevronRight24Regular />} />
          </div>
          <Title2>
            {currentDate.toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </Title2>
        </div>
        <Button icon={<Add24Regular />}>New Event</Button>
      </div>
      <div className={styles.dayHeader}>
        {days.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className={styles.calendar}>{renderCalendarDays()}</div>
    </div>
  );
};

export default Calendar;