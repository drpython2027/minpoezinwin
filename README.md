# Min Poe Zin Win

A lightweight website for private yoga in Yangon. The site uses plain HTML, CSS, and JavaScript, so it has no build step, framework, or hosting bill.

## Publish the website

1. In the repository settings, open **Pages** and select **Deploy from a branch**.
2. Choose the `main` branch and `/ (root)`, then save. GitHub Pages will publish the site at the URL shown in those settings.
3. Before sharing the site, add a real booking link in `site-config.json` and confirm the public posts and contact details are ready.

## Give the studio team publishing access

Manage access in the repository's **Settings → Collaborators and teams**:

- **Founder:** repository **Admin** permission. Keep this to the founder or trusted owner.
- **Admin team:** **Maintain** permission for people who manage site content and coordinate publishing.
- **Editors:** **Write** permission. They can update posts and add photos; review changes through pull requests if you want an approval step.

Use your GitHub organization or repository access settings to invite each person. Do not put passwords, API keys, or other secrets in this public repository.

## Publish a status or photo

Posts are listed newest first in `posts.json`. Edit that file to add a post with a unique `id`, ISO-format `publishedAt` date (`YYYY-MM-DD`), a category (`practice`, `studio`, or `notes`), a short title, and readable body text. Keep the content welcoming and suitable for a public website.

For photos, upload image files to `assets/photos/` and add their relative paths and useful alt text to the post's `photos` array:

```json
"photos": [
  {
    "src": "assets/photos/yangon-morning-practice.jpg",
    "alt": "A quiet yoga practice in a sunlit room"
  }
]
```

Use photos the studio has permission to publish, and get consent from identifiable people. Keep image files reasonably sized for visitors on mobile connections. When `photos` is empty, the post displays an illustrated placeholder instead.

Save changes to the `main` branch or merge a pull request. GitHub Pages will publish the updated feed and photos automatically after deployment.

## Enable public comments

In the repository settings, enable **Discussions** and create a public category for studio conversations. Visitors can open the **Join the conversation** links on posts and leave comments there; commenting requires a GitHub account. Add a post-specific `discussionUrl` to a post in `posts.json` to link directly to its discussion. Otherwise, the comments link uses the repository Discussions page.

## Configure booking and comments links

Edit `site-config.json`:

- Set `bookingUrl` to the studio's real public booking/contact page. Leave it empty to show a prompt to contact the studio through its established channel instead of displaying a broken booking button.
- Set `discussionsUrl` to the repository's public Discussions URL if the repository location changes.

The site does not provide a private booking inbox or a custom comment database. Keep private client or health information out of public posts and discussions.

## Local preview

Serve the repository root with any static file server, then open its local URL. For example, with Python installed:

```sh
python -m http.server 8000
```

Open `http://localhost:8000`. No package installation or build command is required.
