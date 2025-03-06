import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  tokens,
  Button,
  Title2,
  Card,
  CardHeader,
  Text,
  Input,
  Badge,
  Avatar,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Field,
  Select,
  Option,
  Textarea,
  Persona,
  Spinner,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  Add24Regular,
  Search24Regular,
  Calendar24Regular,
  Tag24Regular,
  Info24Regular,
  Delete24Regular,
  Edit24Regular,
} from '@fluentui/react-icons';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { format } from 'date-fns';
import type { Task, User } from '../types';
import { SortableTask } from '../components/SortableTask';
import { useTaskStore } from '../store/taskStore';
import LoadingSpinner from '../components/LoadingSpinner';

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
  searchBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
  },
  kanbanBoard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    flex: 1,
    overflowX: 'auto',
    padding: '12px 0',
  },
  column: {
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '8px',
    padding: '16px',
    minWidth: '300px',
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  taskDetails: {
    padding: '24px',
  },
  detailsSection: {
    marginBottom: '24px',
  },
  commentSection: {
    marginTop: '24px',
  },
  errorMessage: {
    marginBottom: '16px',
  },
});

const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Alice Johnson', email: 'alice@example.com' },
];

const Tasks: React.FC = () => {
  const styles = useStyles();
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assigneeId: '',
    dueDate: '',
    tags: '',
  });

  const {
    tasks,
    isLoading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskOrder,
    addComment,
  } = useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = [
    { id: 'todo', title: 'To Do', tasks: tasks.filter(t => t.status === 'todo') },
    { id: 'in_progress', title: 'In Progress', tasks: tasks.filter(t => t.status === 'in_progress') },
    { id: 'review', title: 'Review', tasks: tasks.filter(t => t.status === 'review') },
    { id: 'done', title: 'Done', tasks: tasks.filter(t => t.status === 'done') },
  ];

  const priorityColors = {
    low: tokens.colorNeutralBackground2,
    medium: tokens.colorBrandBackground2,
    high: tokens.colorPaletteRedBackground2,
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);

      const updatedTasks = arrayMove(tasks, oldIndex, newIndex);
      const targetTask = updatedTasks[newIndex];
      const targetColumn = columns.find((col) => 
        col.tasks.some((t) => t.id === over.id)
      );

      if (targetColumn) {
        await updateTaskStatus(targetTask.id, targetColumn.id as Task['status']);
        await updateTaskOrder(updatedTasks);
      }
    }

    setActiveId(null);
  };

  const handleCreateTask = async () => {
    try {
      const newTask: Partial<Task> = {
        title: newTaskData.title,
        description: newTaskData.description,
        status: 'todo',
        priority: newTaskData.priority as Task['priority'],
        assignee: mockUsers.find(u => u.id === newTaskData.assigneeId),
        dueDate: newTaskData.dueDate ? new Date(newTaskData.dueDate) : undefined,
        tags: newTaskData.tags.split(',').map(tag => tag.trim()),
        creator: mockUsers[0], // Current user
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addTask(newTask as Task);
      setIsNewTaskOpen(false);
      setNewTaskData({
        title: '',
        description: '',
        priority: 'medium',
        assigneeId: '',
        dueDate: '',
        tags: '',
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    setSelectedTask(null);
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.root}>
      {error && (
        <MessageBar intent="error" className={styles.errorMessage}>
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      )}

      <div className={styles.header}>
        <Title2>Tasks</Title2>
        <Button
          icon={<Add24Regular />}
          onClick={() => setIsNewTaskOpen(true)}
        >
          Create Task
        </Button>
      </div>

      <div className={styles.searchBar}>
        <Input
          placeholder="Search tasks..."
          contentBefore={<Search24Regular />}
          value={searchQuery}
          onChange={(e, data) => setSearchQuery(data.value)}
          style={{ flex: 1 }}
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.kanbanBoard}>
          {columns.map(column => (
            <div key={column.id} className={styles.column}>
              <div className={styles.columnHeader}>
                <Text weight="semibold">{column.title}</Text>
                <Badge>{column.tasks.length}</Badge>
              </div>
              <SortableContext
                items={column.tasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {column.tasks.map(task => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                    priorityColors={priorityColors}
                  />
                ))}
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>

      <Dialog
        open={isNewTaskOpen}
        onOpenChange={(_, { open }) => setIsNewTaskOpen(open)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Field label="Title" required>
                  <Input
                    value={newTaskData.title}
                    onChange={(e, data) => 
                      setNewTaskData(prev => ({ ...prev, title: data.value }))
                    }
                  />
                </Field>
                <Field label="Description">
                  <Textarea
                    value={newTaskData.description}
                    onChange={(e, data) =>
                      setNewTaskData(prev => ({ ...prev, description: data.value }))
                    }
                  />
                </Field>
                <Field label="Priority">
                  <Select
                    value={newTaskData.priority}
                    onChange={(e, data) =>
                      setNewTaskData(prev => ({ ...prev, priority: data.value as string }))
                    }
                  >
                    <Option value="low">Low</Option>
                    <Option value="medium">Medium</Option>
                    <Option value="high">High</Option>
                  </Select>
                </Field>
                <Field label="Assignee">
                  <Select
                    value={newTaskData.assigneeId}
                    onChange={(e, data) =>
                      setNewTaskData(prev => ({ ...prev, assigneeId: data.value as string }))
                    }
                  >
                    {mockUsers.map(user => (
                      <Option key={user.id} value={user.id}>
                        {user.name}
                      </Option>
                    ))}
                  </Select>
                </Field>
                <Field label="Due Date">
                  <Input
                    type="date"
                    value={newTaskData.dueDate}
                    onChange={(e, data) =>
                      setNewTaskData(prev => ({ ...prev, dueDate: data.value }))
                    }
                  />
                </Field>
                <Field label="Tags">
                  <Input
                    placeholder="Add tags separated by commas"
                    value={newTaskData.tags}
                    onChange={(e, data) =>
                      setNewTaskData(prev => ({ ...prev, tags: data.value }))
                    }
                  />
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="primary"
                onClick={handleCreateTask}
                disabled={!newTaskData.title.trim()}
              >
                Create Task
              </Button>
              <Button
                appearance="secondary"
                onClick={() => setIsNewTaskOpen(false)}
              >
                Cancel
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog
        open={!!selectedTask}
        onOpenChange={(_, { open }) => !open && setSelectedTask(null)}
      >
        <DialogSurface>
          <DialogBody>
            {selectedTask && (
              <div className={styles.taskDetails}>
                <DialogTitle>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {selectedTask.title}
                    <div>
                      <Button
                        icon={<Edit24Regular />}
                        appearance="subtle"
                        onClick={() => {/* Implement edit */}}
                      />
                      <Button
                        icon={<Delete24Regular />}
                        appearance="subtle"
                        onClick={() => handleDeleteTask(selectedTask.id)}
                      />
                    </div>
                  </div>
                </DialogTitle>
                <div className={styles.detailsSection}>
                  <Text>{selectedTask.description}</Text>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <Badge
                      appearance="filled"
                      style={{ backgroundColor: priorityColors[selectedTask.priority] }}
                    >
                      {selectedTask.priority}
                    </Badge>
                    <Text size={200}>
                      <Calendar24Regular />
                      Due: {selectedTask.dueDate?.toLocaleDateString()}
                    </Text>
                  </div>
                </div>

                <div className={styles.detailsSection}>
                  <Text weight="semibold">Assignee</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <Persona
                      name={selectedTask.assignee?.name}
                      secondaryText={selectedTask.assignee?.email}
                      presence={{ status: 'available' }}
                      avatar={{ color: 'colorful' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {selectedTask.tags.map(tag => (
                    <Badge
                      key={tag}
                      appearance="tint"
                      icon={<Tag24Regular />}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className={styles.commentSection}>
                  <Text weight="semibold">Comments</Text>
                  <div style={{ marginTop: '12px' }}>
                    {selectedTask.comments?.map(comment => (
                      <div
                        key={comment.id}
                        style={{
                          display: 'flex',
                          gap: '8px',
                          marginBottom: '12px',
                        }}
                      >
                        <Avatar name={comment.author.name} size={24} />
                        <div>
                          <Text weight="semibold">{comment.author.name}</Text>
                          <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                            {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                          </Text>
                          <Text>{comment.content}</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <Textarea placeholder="Add a comment..." />
                    <Button
                      appearance="primary"
                      style={{ marginTop: '8px' }}
                      onClick={() => {/* Implement add comment */}}
                    >
                      Add Comment
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default Tasks;