import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import type { Message, Channel, User, Attachment } from '../types';

interface ChatState {
  activeChannel: string | null;
  channels: Channel[];
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  setActiveChannel: (channelId: string) => void;
  addMessage: (message: Message) => Promise<void>;
  addChannel: (channel: Channel) => Promise<void>;
  fetchMessages: (channelId: string) => Promise<void>;
  fetchChannels: () => Promise<void>;
  uploadAttachment: (file: File) => Promise<Attachment>;
  searchMessages: (query: string, channelId: string) => Promise<Message[]>;
  addUsersToChannel: (channelId: string, userIds: string[]) => Promise<void>;
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useChatStore = create<ChatState>((set, get) => ({
  activeChannel: 'general',
  channels: [],
  messages: [],
  isLoading: false,
  error: null,

  setActiveChannel: async (channelId: string) => {
    set({ activeChannel: channelId });
    await get().fetchMessages(channelId);
  },

  addMessage: async (message: Message) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([message])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        messages: [...state.messages, data],
      }));

      // Trigger real-time update
      await supabase
        .channel('messages')
        .send({
          type: 'broadcast',
          event: 'new_message',
          payload: data,
        });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addChannel: async (channel: Channel) => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .insert([channel])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        channels: [...state.channels, data],
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  fetchMessages: async (channelId: string) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channelId', channelId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      set({ messages: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchChannels: async () => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('createdAt', { ascending: true });

      if (error) throw error;

      set({ channels: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  uploadAttachment: async (file: File) => {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(fileName, file);

      if (error) throw error;

      const attachment: Attachment = {
        id: data.path,
        name: file.name,
        type: file.type,
        url: supabase.storage.from('attachments').getPublicUrl(data.path).data.publicUrl,
        size: file.size,
        uploadedAt: new Date(),
      };

      return attachment;
    } catch (error) {
      throw new Error(`Failed to upload attachment: ${(error as Error).message}`);
    }
  },

  searchMessages: async (query: string, channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channelId', channelId)
        .textSearch('content', query);

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to search messages: ${(error as Error).message}`);
    }
  },

  addUsersToChannel: async (channelId: string, userIds: string[]) => {
    try {
      const { error } = await supabase
        .from('channel_members')
        .insert(
          userIds.map(userId => ({
            channelId,
            userId,
            role: 'member',
          }))
        );

      if (error) throw error;
    } catch (error) {
      throw new Error(`Failed to add users to channel: ${(error as Error).message}`);
    }
  },
}));

// Set up real-time subscriptions
supabase
  .channel('messages')
  .on('broadcast', { event: 'new_message' }, ({ payload }) => {
    useChatStore.setState(state => ({
      messages: [...state.messages, payload],
    }));
  })
  .subscribe();