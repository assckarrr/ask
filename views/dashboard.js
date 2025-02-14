<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard</title>
</head>
<body>
    <h1>Welcome, <%= user.name %>!</h1>
    <p>Your email: <%= user.email %></p>
    <a href="/logout">Logout</a>

    <!-- 🔍 Search Bar -->
    <h2>Search Posts</h2>
    <form action="/posts/search" method="GET">
        <input type="text" name="q" placeholder="Search posts" required>
        <button type="submit">Search</button>
    </form>

    <!-- ✍ Create Post Form -->
    <h2>Create a New Post</h2>
    <form action="/posts/add" method="POST">
        <input type="text" name="title" placeholder="Title" required>
        <textarea name="content" placeholder="Content" required></textarea>
        <button type="submit">Add Post</button>
    </form>

    <!-- 📌 Display User's Posts -->
    <h2>Your Posts</h2>
    <% if (posts.length > 0) { %>
        <ul>
            <% posts.forEach(post => { %>
                <li>
                    <h3><%= post.title %></h3>
                    <p><%= post.content %></p>
                    <a href="/posts/edit/<%= post._id %>">Edit</a>
                    <a href="/posts/delete/<%= post._id %>">Delete</a>
                </li>
            <% }) %>
        </ul>
    <% } else { %>
        <p>No posts yet.</p>
    <% } %>
</body>
</html>

