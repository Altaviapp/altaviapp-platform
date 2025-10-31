# [Module Name] - [Brief Description]

## Summary

<!-- Provide a concise summary of what this PR implements (3-5 bullet points) -->

- Implemented [feature 1]
- Added [feature 2]
- Configured [feature 3]

## Module Information

**Module**: <!-- e.g., auth, fleet-api, bubble-admin -->
**Phase**: <!-- 1, 2, or 3 -->
**Duration**: <!-- Actual time taken -->
**Dependencies**: <!-- List modules this depended on -->

## Implementation Details

### What Was Implemented

<!-- Detailed description of the implementation -->

**Files Created**:
- `path/to/file1.ts` - Description
- `path/to/file2.ts` - Description

**Files Modified**:
- `path/to/file3.ts` - What was changed

**Key Features**:
1. Feature description
2. Feature description
3. Feature description

### Technical Decisions

<!-- Document any important technical decisions made during implementation -->

- **Decision 1**: Reasoning
- **Decision 2**: Reasoning

## Requirements Implemented

### From PRD
<!-- Reference specific sections of docs/PRD.md -->

- [x] Requirement 1 (PRD Section X.Y)
- [x] Requirement 2 (PRD Section X.Y)
- [x] Requirement 3 (PRD Section X.Y)

### API Endpoints
<!-- If backend module, list endpoints implemented -->

- [x] `GET /endpoint` - Description
- [x] `POST /endpoint` - Description
- [x] `PUT /endpoint/:id` - Description
- [x] `DELETE /endpoint/:id` - Description

### Database Changes
<!-- Reference docs/database/DATABASE_SCHEMA.md -->

**Tables Used/Modified**:
- `table_name` - What was done
- `table_name` - What was done

**Indexes Added**:
- `table.index_name` - Purpose

## Universal Requirements Checklist

### Multi-Tenancy
- [ ] All queries filter by `institutionId` (except super_admin)
- [ ] No cross-institution data access possible
- [ ] Row-level security enforced

### Role-Based Access Control
- [ ] Role verification implemented
- [ ] `super_admin` access properly elevated
- [ ] `admin` limited to own institution
- [ ] `driver` limited to assigned trips/routes
- [ ] `parent` read-only, own students only

### TypeScript & Type Safety
- [ ] TypeScript strict mode enabled
- [ ] No `any` types used
- [ ] All functions properly typed
- [ ] API responses typed correctly

### Input Validation
- [ ] All inputs validated with Zod
- [ ] Phone numbers validated (+593XXXXXXXXX)
- [ ] Emails validated
- [ ] Required fields enforced

### Error Handling
- [ ] Standard error response format used
- [ ] Meaningful error messages (Spanish)
- [ ] Error codes consistent
- [ ] Try-catch blocks around async operations

### Performance
- [ ] Queries use proper indexes
- [ ] No N+1 query problems
- [ ] Response times < 500ms
- [ ] Pagination implemented (if needed)

### Security
- [ ] No sensitive data in logs
- [ ] Input sanitization
- [ ] HTTPS enforced
- [ ] Authentication required

## Testing

### Test Coverage
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Edge cases covered
- [ ] Error cases tested
- [ ] All tests passing

### Manual Testing Completed
- [ ] Feature works as expected
- [ ] Error cases handled properly
- [ ] Performance acceptable
- [ ] Mobile responsive (if UI)

### Test Results
<!-- Paste test output or summary -->

```
PASS  tests/module.test.ts
  ✓ Test case 1 (123ms)
  ✓ Test case 2 (456ms)

Test Suites: 1 passed, 1 total
Tests:       X passed, X total
```

## Screenshots / Demo

<!-- If UI changes, include screenshots or GIF -->

### Before
<!-- If updating existing functionality -->

### After
<!-- New functionality -->

## Breaking Changes

<!-- List any breaking changes, or write "None" -->

- None

## Migration Notes

<!-- If database migrations or setup required -->

- None required

## Dependencies

<!-- List any new dependencies added -->

**New Dependencies**:
- None

**Updated Dependencies**:
- None

## Documentation Updates

- [ ] API endpoints documented (docs/api/API_ENDPOINTS.md)
- [ ] Bubble guide updated (if applicable)
- [ ] README updated (if needed)
- [ ] Code comments added for complex logic

## Deployment Notes

<!-- Any special deployment considerations -->

**Environment Variables Required**:
- None

**Convex Deployment**:
- [ ] Schema changes deployed
- [ ] Functions tested in dev
- [ ] Ready for production

**Vercel Deployment** (if applicable):
- [ ] Build successful
- [ ] Environment variables configured

## Checklist Before Merge

### Code Quality
- [ ] No linter errors
- [ ] Code formatted (Prettier)
- [ ] No `console.log` in production code
- [ ] No commented-out code

### Review
- [ ] Self-reviewed code
- [ ] Checked git diff for unintended changes
- [ ] Verified all files necessary

### Module Complete
- [ ] All PRD requirements met
- [ ] Module checklist completed (docs/modules/MODULE_CHECKLIST.md)
- [ ] No blocking bugs
- [ ] Ready for review

## Next Module

**Next up**: [Module Name]
**Dependencies**: This module (must merge first)
**Estimated duration**: X days

## Reviewer Notes

<!-- Any specific areas you want reviewers to focus on -->

**Please review**:
- Implementation approach for [feature]
- Performance of [query/function]
- Error handling in [section]

## Additional Context

<!-- Any additional context, related issues, or references -->

**Related**:
- Issue #X
- Discussion #Y

**References**:
- [docs/PRD.md](docs/PRD.md) - Module requirements
- [docs/database/DATABASE_SCHEMA.md](docs/database/DATABASE_SCHEMA.md) - Schema reference
- [Technical-Specification.md](Technical-Specification.md) - Implementation patterns
- [docs/modules/MODULE_CHECKLIST.md](docs/modules/MODULE_CHECKLIST.md) - Full checklist

---

**Generated with Agentic Development Framework** 🤖

Co-Authored-By: Claude <noreply@anthropic.com>
