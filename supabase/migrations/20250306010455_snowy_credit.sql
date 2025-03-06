/*
  # Chat System Schema

  1. New Tables
    - `channels`
      - Basic channel information and settings
    - `messages`
      - Message content and metadata
    - `channel_members`
      - Channel membership and roles
    - `attachments`
      - File attachments for messages

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create channels table
CREATE TABLE IF NOT EXISTS channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('public', 'private')),
  team_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content text,
  type text NOT NULL DEFAULT 'text',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_edited boolean DEFAULT false,
  reply_to_id uuid REFERENCES messages(id) ON DELETE SET NULL
);

-- Create channel_members table
CREATE TABLE IF NOT EXISTS channel_members (
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
  size integer NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Channel policies
CREATE POLICY "Users can view public channels"
  ON channels FOR SELECT
  TO authenticated
  USING (type = 'public' OR EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_id = channels.id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create channels"
  ON channels FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Message policies
CREATE POLICY "Users can view messages in their channels"
  ON messages FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_id = messages.channel_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_id = messages.channel_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can edit their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Channel member policies
CREATE POLICY "Users can view channel members"
  ON channel_members FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM channel_members cm
    WHERE cm.channel_id = channel_members.channel_id AND cm.user_id = auth.uid()
  ));

-- Attachment policies
CREATE POLICY "Users can view attachments"
  ON attachments FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM messages m
    JOIN channel_members cm ON cm.channel_id = m.channel_id
    WHERE m.id = attachments.message_id AND cm.user_id = auth.uid()
  ));

CREATE POLICY "Users can upload attachments"
  ON attachments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_id ON channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_content_search ON messages USING GIN (to_tsvector('english', content));