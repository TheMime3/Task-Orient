/*
  # Create Tasks Schema

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `status` (text)
      - `priority` (text)
      - `assignee_id` (uuid, references users)
      - `creator_id` (uuid, references users)
      - `due_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `order` (integer)
    - `task_comments`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `user_id` (uuid, references users)
      - `content` (text)
      - `created_at` (timestamptz)
    - `task_attachments`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `name` (text)
      - `url` (text)
      - `size` (integer)
      - `type` (text)
      - `created_at` (timestamptz)
    - `task_tags`
      - `task_id` (uuid, references tasks)
      - `tag` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  "order" integer DEFAULT 0,
  CONSTRAINT tasks_status_check CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high'))
);

-- Create task comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create task attachments table
CREATE TABLE IF NOT EXISTS task_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  size integer NOT NULL,
  type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create task tags table
CREATE TABLE IF NOT EXISTS task_tags (
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  tag text NOT NULL,
  PRIMARY KEY (task_id, tag)
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can read all tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update assigned tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = creator_id OR
    auth.uid() = assignee_id
  )
  WITH CHECK (
    auth.uid() = creator_id OR
    auth.uid() = assignee_id
  );

CREATE POLICY "Users can delete own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Create policies for comments
CREATE POLICY "Users can read all comments"
  ON task_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON task_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for attachments
CREATE POLICY "Users can read all attachments"
  ON task_attachments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create attachments"
  ON task_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE id = task_attachments.task_id
      AND (creator_id = auth.uid() OR assignee_id = auth.uid())
    )
  );

-- Create policies for tags
CREATE POLICY "Users can read all tags"
  ON task_tags
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage tags"
  ON task_tags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE id = task_tags.task_id
      AND (creator_id = auth.uid() OR assignee_id = auth.uid())
    )
  );

-- Create function for updating task order
CREATE OR REPLACE FUNCTION update_task_order(task_orders json[])
RETURNS void AS $$
BEGIN
  FOR i IN 1..array_length(task_orders, 1) LOOP
    UPDATE tasks
    SET "order" = (task_orders[i]->>'new_order')::integer
    WHERE id = (task_orders[i]->>'task_id')::uuid;
  END LOOP;
END;
$$ LANGUAGE plpgsql;