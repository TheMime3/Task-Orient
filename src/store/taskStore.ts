import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import type { Task, User } from '../types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>;
  updateTaskOrder: (tasks: Task[]) => Promise<void>;
  assignTask: (taskId: string, userId: string) => Promise<void>;
  addComment: (taskId: string, content: string, userId: string) => Promise<void>;
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:auth.users!tasks_assignee_id_fkey(id, email, raw_user_meta_data->name),
          creator:auth.users!tasks_creator_id_fkey(id, email, raw_user_meta_data->name),
          comments:task_comments(
            id,
            content,
            created_at,
            author:auth.users!task_comments_user_id_fkey(id, email, raw_user_meta_data->name)
          ),
          tags:task_tags(tag)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTasks = data?.map(task => ({
        ...task,
        assignee: task.assignee ? {
          id: task.assignee.id,
          email: task.assignee.email,
          name: task.assignee.name || task.assignee.email.split('@')[0]
        } : undefined,
        creator: {
          id: task.creator.id,
          email: task.creator.email,
          name: task.creator.name || task.creator.email.split('@')[0]
        },
        tags: task.tags?.map(t => t.tag) || [],
        comments: task.comments?.map(comment => ({
          ...comment,
          author: {
            id: comment.author.id,
            email: comment.author.email,
            name: comment.author.name || comment.author.email.split('@')[0]
          }
        })) || [],
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at),
      }));

      set({ tasks: formattedTasks || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addTask: async (task: Task) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignee_id: task.assignee?.id,
          creator_id: task.creator.id,
          due_date: task.dueDate,
        }])
        .select()
        .single();

      if (error) throw error;

      if (task.tags.length > 0) {
        const { error: tagError } = await supabase
          .from('task_tags')
          .insert(
            task.tags.map(tag => ({
              task_id: data.id,
              tag,
            }))
          );

        if (tagError) throw tagError;
      }

      await get().fetchTasks();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateTask: async (taskId: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          description: updates.description,
          status: updates.status,
          priority: updates.priority,
          assignee_id: updates.assignee?.id,
          due_date: updates.dueDate,
          updated_at: new Date(),
        })
        .eq('id', taskId);

      if (error) throw error;

      if (updates.tags) {
        // Delete existing tags
        await supabase
          .from('task_tags')
          .delete()
          .eq('task_id', taskId);

        // Insert new tags
        if (updates.tags.length > 0) {
          const { error: tagError } = await supabase
            .from('task_tags')
            .insert(
              updates.tags.map(tag => ({
                task_id: taskId,
                tag,
              }))
            );

          if (tagError) throw tagError;
        }
      }

      await get().fetchTasks();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      set(state => ({
        tasks: state.tasks.filter(task => task.id !== taskId),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateTaskStatus: async (taskId: string, status: Task['status']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date() })
        .eq('id', taskId);

      if (error) throw error;

      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === taskId ? { ...task, status } : task
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateTaskOrder: async (tasks: Task[]) => {
    try {
      const updates = tasks.map((task, index) => ({
        id: task.id,
        order: index,
      }));

      const { error } = await supabase
        .from('tasks')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;

      set({ tasks });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  assignTask: async (taskId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ assignee_id: userId, updated_at: new Date() })
        .eq('id', taskId);

      if (error) throw error;

      await get().fetchTasks();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addComment: async (taskId: string, content: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('task_comments')
        .insert([{
          task_id: taskId,
          user_id: userId,
          content,
        }]);

      if (error) throw error;

      await get().fetchTasks();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));

// Set up real-time subscriptions
supabase
  .channel('tasks')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'tasks',
    },
    () => {
      useTaskStore.getState().fetchTasks();
    }
  )
  .subscribe();