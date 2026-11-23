const postGrid = document.querySelector("#post-grid");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const contactAction = document.querySelector("#contact-action");
const siteName = "Min Poe Zin Win";
let posts = [];
let activeFilter = "all";

const categoryLabels = {
  practice: "Practice",
  studio: "Studio notes",
  notes: "Reflections",
};

function createPostCard(post, discussionsUrl) {
  const article = document.createElement("article");
  article.className = "post-card";

  const photos = Array.isArray(post.photos) ? post.photos : [];
  if (photos.length) {
    const gallery = document.createElement("div");
    gallery.className = `post-gallery${photos.length > 1 ? " has-multiple" : ""}`;
    gallery.setAttribute("role", "group");
    gallery.setAttribute("aria-label", `${post.title} photos`);
    photos.slice(0, 4).forEach((photo) => {
      if (!photo || typeof photo.src !== "string" || typeof photo.alt !== "string") return;
      const image = document.createElement("img");
      image.src = photo.src;
      image.alt = photo.alt;
      image.loading = "lazy";
      gallery.append(image);
    });
    if (gallery.childElementCount) article.append(gallery);
    else article.append(createIllustration(post));
  } else {
    article.append(createIllustration(post));
  }

  const meta = document.createElement("div");
  meta.className = "post-meta";
  const category = document.createElement("span");
  category.className = "post-category";
  category.textContent = categoryLabels[post.category] || "Studio notes";
  const date = document.createElement("time");
  date.dateTime = post.publishedAt;
  date.textContent = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${post.publishedAt}T12:00:00`));
  meta.append(category, date);

  const title = document.createElement("h3");
  title.textContent = post.title;
  const body = document.createElement("p");
  body.className = "post-body";
  body.textContent = post.body;

  const actions = document.createElement("div");
  actions.className = "post-actions";
  const signature = document.createElement("span");
  signature.textContent = siteName;
  const comments = document.createElement("a");
  comments.href = post.discussionUrl || discussionsUrl;
  comments.textContent = "Join the conversation ↗";
  comments.target = "_blank";
  comments.rel = "noopener noreferrer";
  comments.setAttribute("aria-label", `Comment on ${post.title} — opens GitHub Discussions`);
  actions.append(signature, comments);

  article.append(meta, title, body, actions);
  return article;
}

function createIllustration(post) {
  const art = document.createElement("div");
  art.className = `post-art post-art--${categoryLabels[post.category] ? post.category : "notes"}`;
  art.setAttribute("role", "img");
  art.setAttribute("aria-label", `Illustrated placeholder for ${post.title}`);
  const label = document.createElement("span");
  label.className = "post-art-label";
  label.textContent = post.eyebrow || "A moment to pause";
  art.append(label);
  return art;
}

function renderPosts() {
  const visiblePosts = posts.filter((post) => activeFilter === "all" || post.category === activeFilter);
  postGrid.replaceChildren();
  if (!visiblePosts.length) {
    const empty = document.createElement("p");
    empty.className = "feed-message";
    empty.textContent = "No notes in this collection just yet.";
    postGrid.append(empty);
    return;
  }
  visiblePosts.forEach((post) => postGrid.append(createPostCard(post, window.siteConfig.discussionsUrl)));
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    renderPosts();
  });
});

async function loadSite() {
  const [postsResponse, configResponse] = await Promise.all([
    fetch("posts.json"),
    fetch("site-config.json"),
  ]);
  if (!postsResponse.ok) throw new Error(`Could not load posts (${postsResponse.status}).`);
  if (!configResponse.ok) throw new Error(`Could not load site settings (${configResponse.status}).`);
  const loadedPosts = await postsResponse.json();
  const config = await configResponse.json();
  if (!Array.isArray(loadedPosts)) throw new Error("The post feed must be a JSON array.");
  if (typeof config.discussionsUrl !== "string" || typeof config.bookingUrl !== "string") {
    throw new Error("Site settings must include string values for bookingUrl and discussionsUrl.");
  }

  posts = loadedPosts.filter((post) =>
    post && typeof post.id === "string" &&
    typeof post.title === "string" &&
    typeof post.body === "string" &&
    typeof post.publishedAt === "string" &&
    !Number.isNaN(Date.parse(`${post.publishedAt}T12:00:00`))
  );
  window.siteConfig = config;

  const count = document.querySelector('[data-count="all"]');
  count.textContent = String(posts.length);
  if (config.bookingUrl.trim()) {
    const link = document.createElement("a");
    link.className = "button button-dark";
    link.href = config.bookingUrl;
    link.textContent = "Ask about a private session ↗";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    contactAction.replaceChildren(link);
  }
  renderPosts();
}

loadSite().catch((error) => {
  console.error(error);
  postGrid.replaceChildren();
  const message = document.createElement("p");
  message.className = "feed-message";
  message.textContent = "The journal is taking a quiet moment. Please check back soon.";
  postGrid.append(message);
});
