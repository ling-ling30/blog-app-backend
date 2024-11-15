# API Documentation

## Base URL

[Missing base URL information]

## Authentication

The API uses token-based authentication. Include the token in the Authorization header for protected endpoints.

```
Authorization: <your_token>
```

## Public Endpoints

### Authentication

#### Login

- **URL:** `/auth/login`
- **Method:** POST
- **Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response:**
  - Success (200): Returns user object
  - Error (401): Invalid credentials

### Public Routes

#### List Categories

- **URL:** `/public/categories`
- **Method:** GET
- **Response:** Array of category objects
  ```json
  [
    {
      "id": "number",
      "name": "string",
      "slug": "string",
      "description": "string",
      "createdAt": "number"
    }
  ]
  ```

#### List Tags

- **URL:** `/public/tags`
- **Method:** GET
- **Response:** Array of tag objects
  ```json
  [
    {
      "id": "number",
      "name": "string",
      "slug": "string",
      "createdAt": "number"
    }
  ]
  ```

#### List Public Posts

- **URL:** `/public/posts`
- **Method:** GET
- **Query Parameters:**
  - `categoryId` (optional): Filter by category ID
  - `tagId` (optional): Filter by tag ID
  - `limit` (optional): Number of posts per page (default: 10)
  - `offset` (optional): Pagination offset (default: 0)
- **Response:** Array of public post objects
  ```json
  [
    {
      "id": "string",
      "title": "string",
      "slug": "string",
      "content": "string",
      "excerpt": "string",
      "featuredImageUrl": "string",
      "viewCount": "number",
      "publishedAt": "number",
      "categories": "string", // Comma-separated category names
      "tags": "string" // Comma-separated tag names
    }
  ]
  ```

#### Get Public Post by Slug

- **URL:** `/public/posts/:slug`
- **Method:** GET
- **Response:** Post object with stats
  ```json
  {
    "id": "string",
    "title": "string",
    "slug": "string",
    "content": "string",
    "excerpt": "string",
    "featuredImageUrl": "string",
    "viewCount": "number",
    "publishedAt": "number",
    "categories": [
      {
        "id": "number",
        "name": "string",
        "slug": "string"
      }
    ],
    "tags": [
      {
        "id": "number",
        "name": "string",
        "slug": "string"
      }
    ]
  }
  ```

## Protected Endpoints

_Requires authentication token_

### Posts

#### List Posts

- **URL:** `/posts`
- **Method:** GET
- **Query Parameters:**
  - `status` (optional): Filter by status (DRAFT, PUBLISHED)
  - `categoryId` (optional): Filter by category ID
  - `tagId` (optional): Filter by tag ID
  - `limit` (optional): Number of posts per page (default: 10)
  - `offset` (optional): Pagination offset (default: 0)
  - `isPublished` (optional): Filter by publication status (boolean)
- **Response:** Array of post objects
  ```json
  [
    {
      "id": "string",
      "title": "string",
      "slug": "string",
      "content": "string",
      "excerpt": "string",
      "featuredImageUrl": "string",
      "status": "string",
      "viewCount": "number",
      "createdAt": "number",
      "updatedAt": "number",
      "publishedAt": "number",
      "categories": "string", // Comma-separated category names
      "tags": "string" // Comma-separated tag names
    }
  ]
  ```

#### Create Post

- **URL:** `/posts`
- **Method:** POST
- **Body:**
  ```json
  {
    "title": "string",
    "content": "string",
    "status": "string", // Optional, defaults to "DRAFT"
    "excerpt": "string",
    "featuredImageUrl": "string",
    "categoryIds": "number[]", // Optional
    "tagIds": "number[]" // Optional
  }
  ```
- **Response:** Created post object with related data

#### Update Post

- **URL:** `/posts/:id`
- **Method:** PUT
- **Body:**
  ```json
  {
    "title": "string",
    "content": "string",
    "status": "string",
    "excerpt": "string",
    "featuredImageUrl": "string",
    "categories": "number[]", // Optional
    "tags": "number[]" // Optional
  }
  ```
- **Response:** Updated post object

## Post Status Values

Posts can have the following status values:

- `DRAFT`
- `PUBLISHED`

## Missing Information

1. Base URL for the API
2. Authentication token format and expiration details
3. Rate limiting information (if any)
4. Error response formats for various error scenarios
5. Any additional headers required besides Authorization
6. Complete success and error response codes for each endpoint
7. Detailed validation rules for fields (min/max lengths, allowed characters, etc.)
8. Whether slug collision handling is case-sensitive
9. Maximum allowed categories and tags per post
10. Whether featured image URLs must follow specific formats

Would you like me to add any of this missing information to the documentation?
