-- Add source tracking fields to messages table
ALTER TABLE messages
  ADD COLUMN source_index VARCHAR(255),
  ADD COLUMN source_document_ids TEXT[];

-- Create index for performance when filtering by source_index
CREATE INDEX idx_messages_source_index ON messages(source_index)
  WHERE source_index IS NOT NULL;
