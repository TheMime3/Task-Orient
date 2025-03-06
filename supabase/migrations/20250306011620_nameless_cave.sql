/*
  # Create Tasks Schema

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `status` (text)
      - `priority` (text)
      - `assignee_id` (uuid)
      - `creator_id` (uuid)
      - `due_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `order` (integer)

    - `task_comments`
      - `id` (uuid, primary key)
      - `task_id` (uuid)
      - `user_id` (uuid)
      - `content` (text)
      - `created_at` (timestamptz)

    - `task_attachments`
      - `id` (uuid, primary key)
      - `task_id` (uuid)
      - `name` (text)
      - `url` (text)
      - `size` (integer)
      - `type` (text)
      - `created_at` (timestamptz)

    - `task_tags`
      - `task_id` (uuid)
      - `tag` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create tasks table if it doesn't exist
DO $$ BEGIN
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
END $$;

-- Create task comments table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS task_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
  );
END $$;

-- Create task attachments table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS task_attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
    name text NOT NULL,
    url text NOT NULL,
    size integer NOT NULL,
    type text NOT NULL,
    created_at timestamptz DEFAULT now()
  );
END $$;

-- Create task tags table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS task_tags (
    task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
    tag text NOT NULL,
    PRIMARY KEY (task_id, tag)
  );
END $$;

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DO $$ BEGIN
  -- Tasks policies
  DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
  DROP POLICY IF EXISTS "Users can read all tasks" ON tasks;
  DROP POLICY IF EXISTS "Users can update assigned tasks" ON tasks;
  DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

  -- Task comments policies
  DROP POLICY IF EXISTS "Users can create comments" ON task_comments;
  DROP POLICY IF EXISTS "Users can read all comments" ON task_comments;

  -- Task attachments policies
  DROP POLICY IF EXISTS "Users can create attachments" ON task_attachments;
  DROP POLICY IF EXISTS "Users can read all attachments" ON task_attachments;

  -- Task tags policies
  DROP POLICY IF EXISTS "Users can manage tags" ON task_tags;
  DROP POLICY IF EXISTS "Users can read all tags" ON task_tags;
END $$;

-- Create policies for tasks
CREATE POLICY "Users can create tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can read all tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update assigned tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING ((auth.uid() = creator_id) OR (auth.uid() = assignee_id))
  WITH CHECK ((auth.uid() = creator_id) OR (auth.uid() = assignee_id));

CREATE POLICY "Users can delete own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Create policies for task comments
CREATE POLICY "Users can create comments"
  ON task_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read all comments"
  ON task_comments
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for task attachments
CREATE POLICY "Users can create attachments"
  ON task_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_attachments.task_id
      AND (tasks.creator_id = auth.uid() OR tasks.assignee_id = auth.uid())
    )
  );

CREATE POLICY "Users can read all attachments"
  ON task_attachments
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for task tags
CREATE POLICY "Users can manage tags"
  ON task_tags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_tags.task_id
      AND (tasks.creator_id = auth.uid() OR tasks.assignee_id = auth.uid())
    )
  );

CREATE POLICY "Users can read all tags"
  ON task_tags
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_tasks_creator_id ON tasks(creator_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
  CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON task_comments(user_id);
  CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
END $$;