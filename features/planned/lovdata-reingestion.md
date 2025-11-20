# Feature: Enhanced Lovdata Reingestion with Hierarchical Metadata

## Status

**Planned** - Pending data exploration phase

## Objective

Reingest the complete Lovdata dataset with improved metadata extraction and no token limits, leveraging GPT-5.1's enhanced context handling.

## Key Requirements

### Complete Documents Only

- No token-based chunking
- Use full documents end-to-end
- GPT-5.1 handles large contexts effectively

### Hierarchical Metadata Extraction

- Parse XML files for parent/section relationships
- Extract metadata at multiple levels (between title and department)
- Store section paths and category hierarchies
- Enable filtering/sorting at higher granularity levels

### Data Exploration First

- Analyze XML structure in exploration notebook
- Identify parent sections and hierarchical relationships
- Map available metadata fields
- Determine optimal categorization strategy

## Implementation Steps

### Phase 1: Data Science Exploration (in exploration notebook)

1. Load sample Lovdata XML files
2. Analyze XML structure and schema
3. Identify parent section fields and relationships
4. Map metadata hierarchy (department → section → subsection → document)
5. Document findings and propose metadata schema

### Phase 2: Update Elasticsearch Schema

1. Design new index mapping with hierarchical fields:
   - `parent_section_id` - ID of parent section
   - `section_path` - Full path (e.g., "Skatteloven/Kapittel 5/§5-1")
   - `category_hierarchy` - Array of category levels
   - `department` - Existing field
   - `title` - Existing field
   - `section_name` - New field for section display name
2. Create new index or plan migration strategy
3. Optimize for filtered searches by section/category

### Phase 3: Update Ingestion Pipeline

1. Update XML parser to extract hierarchical metadata
2. Build section path from XML structure
3. Store complete documents (no chunking)
4. Index documents with new metadata fields
5. Validate ingestion with sample documents

### Phase 4: Reingest Full Dataset

1. Run full reingestion pipeline
2. Monitor for errors and data quality
3. Validate document count and metadata completeness
4. Update index alias to point to new index

## Technical Considerations

### Context Handling

- GPT-5.1 handles large contexts well
- Complete documents are viable without chunking
- May need to balance document size vs. search granularity
- Consider hybrid approach: full docs + section bookmarks for very large documents

### Search Performance

- Hierarchical metadata enables filtered searches
- Users can filter by section/category before semantic search
- RRF search can leverage section metadata for better ranking

### Backwards Compatibility

- Keep old index during transition
- Gradual cutover with alias switching
- Rollback plan if issues arise

## Expected Benefits

1. **Better context**: Full documents provide complete legal context
2. **Improved navigation**: Hierarchical metadata enables section browsing
3. **Enhanced search**: Filter by section before semantic search
4. **User experience**: Users can explore related sections
5. **Accuracy**: Complete documents reduce context loss from chunking

## Open Questions

1. What XML fields contain parent section information?
2. How deep is the section hierarchy (levels)?
3. Are section IDs stable across updates?
4. Should we maintain both chunked and full-doc indices?
5. How to handle extremely large documents (edge cases)?

## Next Steps

1. Start data exploration in notebook
2. Document XML structure findings
3. Propose metadata schema based on exploration
4. Get approval before proceeding with reingestion
