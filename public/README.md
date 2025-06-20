# 🎮 GameSpecsHub - GitHub-Based Blog System

A fully functional blog system that uses GitHub as a backend, allowing you to publish blog posts directly from an admin dashboard without any traditional backend services.

## ✨ Features

- **📝 Admin Dashboard**: Create and publish blog posts with a beautiful interface
- **🎨 Live Preview**: See your Markdown content rendered in real-time
- **📷 Image Upload**: Drag & drop images with automatic Markdown generation
- **🏷️ Tag System**: Organize posts with tags for better categorization
- **🔍 Search & Filter**: Find posts by title, content, or tags
- **📱 Responsive Design**: Works perfectly on desktop and mobile
- **⚡ No Backend Required**: Uses GitHub API for data storage
- **🎯 SEO Friendly**: Individual post pages with proper meta tags

## 🚀 Quick Setup

### 1. GitHub Repository Setup

1. **Fork or Clone** this repository to your GitHub account
2. **Enable GitHub Pages** in your repository settings
3. **Set the source** to the branch containing your files

### 2. GitHub Personal Access Token

1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Give it a name like "GameSpecsHub Blog"
4. Select these scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
5. Copy the generated token (starts with `ghp_`)

### 3. Image Upload Setup (Optional)

For image uploads, you'll need an ImgBB API key:

1. Go to [imgbb.com](https://imgbb.com)
2. Create an account and get your API key
3. Replace `YOUR_IMGBB_API_KEY` in `admin.html` with your actual key

### 4. Configuration

Update the configuration in `admin.html`:

```javascript
const owner = "YOUR_GITHUB_USERNAME";
const repo = "YOUR_REPOSITORY_NAME";
const path = "public/blog/blogs.json";
```

## 📖 How to Use

### Publishing a Blog Post

1. **Access Admin Dashboard**: Navigate to `admin.html` on your site
2. **Authenticate**: Enter your GitHub Personal Access Token
3. **Create Post**:
   - Enter a title
   - Set publication date
   - Add tags (comma-separated)
   - Write content in Markdown
   - Upload images (optional)
4. **Preview**: See your post rendered in real-time
5. **Publish**: Click "Publish Post" to save to GitHub

### Managing Blog Posts

- **View Posts**: Visit `blog.html` to see all published posts
- **Search**: Use the search bar to find specific posts
- **Filter by Tags**: Use the tag dropdown to filter posts
- **Read Full Posts**: Click on any post to read the complete article

## 🏗️ File Structure

```
public/
├── admin.html          # Admin dashboard for creating posts
├── blog.html           # Blog listing page
├── post.html           # Individual post page
├── blog/
│   └── blogs.json      # Blog posts data (auto-generated)
└── assets/
    ├── css/
    │   └── styles.css
    └── js/
        ├── main.js
        └── marked.min.js  # Markdown parser
```

## 🔧 Technical Details

### Data Storage
- Blog posts are stored in `blog/blogs.json`
- Each post contains: `id`, `title`, `date`, `tags`, `content`
- Data is automatically sorted by date (newest first)

### GitHub API Integration
- Uses GitHub's REST API v3
- Authenticates with Personal Access Token
- Updates `blogs.json` file directly in the repository
- Creates commit history for all changes

### Markdown Support
- Full Markdown syntax support
- Live preview while writing
- Syntax highlighting for code blocks
- Image embedding support

## 🎨 Customization

### Styling
- All styles are inline in the HTML files
- Color scheme uses `#00bcd4` (cyan) as primary color
- Responsive design with mobile-first approach
- Easy to customize by modifying CSS

### Adding Features
- **Comments**: Could be added using GitHub Issues API
- **Categories**: Extend the tag system
- **Analytics**: Add Google Analytics or similar
- **Social Sharing**: Add social media buttons

## 🔒 Security Considerations

- **Token Security**: GitHub tokens are stored in browser localStorage
- **Access Control**: Admin dashboard has no built-in access control
- **Rate Limiting**: GitHub API has rate limits (5000 requests/hour for authenticated users)

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to fetch posts"**
   - Check if the GitHub repository path is correct
   - Ensure the repository is public or you have proper access

2. **"Authentication failed"**
   - Verify your GitHub token is valid
   - Check if the token has the required permissions

3. **"Image upload failed"**
   - Verify your ImgBB API key is correct
   - Check if you have remaining upload quota

4. **Posts not appearing**
   - Check if `blogs.json` exists in the correct path
   - Verify the JSON format is valid

### Debug Mode
Open browser developer tools (F12) to see detailed error messages and API responses.

## 📝 Blog Post Format

Each blog post in `blogs.json` follows this structure:

```json
{
  "id": 1234567890,
  "title": "Your Blog Post Title",
  "date": "2025-01-15",
  "tags": ["gaming", "hardware", "review"],
  "content": "# Your Markdown Content\n\nThis supports full Markdown syntax..."
}
```

## 🤝 Contributing

Feel free to fork this project and customize it for your needs. Some ideas for improvements:

- Add comment system using GitHub Issues
- Implement post categories
- Add social media sharing
- Create a post editor with more features
- Add analytics integration

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify your GitHub token and repository settings
3. Check browser console for error messages
4. Ensure all files are properly uploaded to your repository

---

**Happy Blogging! 🎉** 