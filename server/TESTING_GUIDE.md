# QuizFun API Testing Commands

## PowerShell Commands (Windows)
# Test API Info
Invoke-RestMethod -Uri "http://localhost:3001/api/docs/info" -Method GET

# Test Users with Pagination
Invoke-RestMethod -Uri "http://localhost:3001/api/user?page=1&limit=5" -Method GET

# Test Quiz Search
Invoke-RestMethod -Uri "http://localhost:3001/api/quizz?search=math&page=1&limit=3" -Method GET

## cURL Commands (if available)
# Test API Info
curl -X GET "http://localhost:3001/api/docs/info"

# Test Users with Pagination
curl -X GET "http://localhost:3001/api/user?page=1&limit=5"

# Test Quiz Sorting
curl -X GET "http://localhost:3001/api/quizz?sortBy=title&sortOrder=asc&page=1&limit=5"

## Test Scenarios

### Pagination Scenarios:
1. Test different page numbers: page=1, page=2, page=3
2. Test different limits: limit=5, limit=10, limit=25, limit=100
3. Test invalid parameters: page=0, limit=0, limit=200 (should be capped at 100)

### Search Scenarios:
1. Search users by name or email
2. Search quizzes by title or description  
3. Test empty search results

### Sorting Scenarios:
1. Sort by different fields: title, createdAt, updatedAt
2. Test both sort orders: asc, desc
3. Test invalid sort fields (should default to createdAt)

### Filter Scenarios:
1. Filter users by role: player, admin, moderator
2. Filter quizzes by visibility: public, private
3. Test invalid filter values

## Expected Response Format:
{
  "data": [...],           // Array of items
  "total": 50,            // Total count
  "page": 1,              // Current page
  "totalPages": 5,        // Total pages
  "hasNext": true,        // Has next page
  "hasPrev": false,       // Has previous page
  "limit": 10             // Items per page
}
