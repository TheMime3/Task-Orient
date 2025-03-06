import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  makeStyles,
  tokens,
  Card,
  Text,
  Badge,
  Avatar,
} from '@fluentui/react-components';
import {
  Calendar24Regular,
  Tag24Regular,
} from '@fluentui/react-icons';
import type { Task } from '../types';

const useStyles = makeStyles({
  taskCard: {
    marginBottom: '12px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  taskContent: {
    padding: '12px',
  },
  taskMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
  },
  tags: {
    display: 'flex',
    gap: '4px',
    marginTop: '8px',
  },
  tag: {
    backgroundColor: tokens.colorNeutralBackground2,
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
  },
  priorityBadge: {
    textTransform: 'capitalize',
  },
});

interface SortableTaskProps {
  task: Task;
  onClick: () => void;
  priorityColors: Record<string, string>;
}

export const SortableTask: React.FC<SortableTaskProps> = ({ task, onClick, priorityColors }) => {
  const styles = useStyles();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={styles.taskCard}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      <div className={styles.taskContent}>
        <Text weight="semibold">{task.title}</Text>
        <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
          {task.description}
        </Text>
        <div className={styles.tags}>
          {task.tags.map(tag => (
            <span key={tag} className={styles.tag}>
              <Tag24Regular />
              {tag}
            </span>
          ))}
        </div>
        <div className={styles.taskMeta}>
          <Avatar
            name={task.assignee.name}
            size={24}
          />
          <Badge
            appearance="filled"
            className={styles.priorityBadge}
            style={{ backgroundColor: priorityColors[task.priority] }}
          >
            {task.priority}
          </Badge>
          <Text size={200}>
            <Calendar24Regular />
            {task.dueDate.toLocaleDateString()}
          </Text>
        </div>
      </div>
    </Card>
  );
};