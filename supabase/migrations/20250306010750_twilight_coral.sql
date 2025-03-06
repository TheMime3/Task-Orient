/*
  # Chat Application Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `avatar_url` (text)
      - `status` (text)
      - `last_seen` (timestamp)
    
    - `messages`
      - `id` (uuid, primary key)
      - `content` (text)
      - `sender_id` (uuid, references users)
      - `channel_id` (uuid, references channels)
      - `type` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_edited` (boolean)
      - `reply_to_id` (uuid, self-reference)
    
    - `message_reactions`
      - `message_id` (uuid, references messages)
      - `user_id` (uuid, references users)
      - `emoji` (text)
      - `created_at` (timestamp)
    
    - `message_attachments`
      - `id` (uuid, primary key)
      - `message_id` (uuid, references messages)
      - `name` (text)
      - `type` (text)
      - `url` (text)
      - `size` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  status text DEFAULT 'offline',
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text,
  sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  type text DEFAULT 'text',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_edited boolean DEFAULT false,
  reply_to_id uuid REFERENCES messages(id) ON DELETE SET NULL
);

-- Create message reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (message_id, user_id, emoji)
);

-- Create message attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
  size integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read other users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read messages in their channels"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_id = messages.channel_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their channels"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_id = messages.channel_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid());

CREATE POLICY "Users can read reactions"
  ON message_reactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their reactions"
  ON message_reactions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read attachments"
  ON message_attachments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create attachments"
  ON message_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_messages_channel_id ON messages(channel_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_reply_to_id ON messages(reply_to_id);
CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);