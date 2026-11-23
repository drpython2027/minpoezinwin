const postForm = document.querySelector("#post-form");
const photoInput = document.querySelector("#photo-input");
const photoAlt = document.querySelector("#photo-alt");
const titleInput = document.querySelector("#post-title");
const captionInput = document.querySelector("#post-caption");
const categoryInput = document.querySelector("#post-category");
const previewImage = document.querySelector("#preview-image");
const previewPlaceholder = document.querySelector("#preview-placeholder");
const previewHeading = document.querySelector("#preview-heading");
const previewCaption = document.querySelector("#preview-caption");
const previewCategory = document.querySelector("#preview-category");
const outputWrap = document.querySelector("#publish-tools");
const output = document.querySelector("#post-output");
const statusMessage = document.querySelector("#admin-status");
const copyButton = document.querySelector("#copy-posts");
const categoryNames = {
  practice: "Practice",
  studio: "Studio notes",
  notes: "Reflections",
};
let selectedPhoto = null;
let previewUrl = "";

function setStatus(message, kind = "") {
  statusMessage.textContent = message;
  statusMessage.dataset.kind = kind;
}

function updatePreview() {
  previewHeading.textContent = titleInput.value.trim() || "Your post title";
  previewCaption.textContent = captionInput.value.trim() || "Your optional caption or status will appear here.";
  previewCategory.textContent = categoryNames[categoryInput.value];
}

function clearPhotoPreview() {
  selectedPhoto = null;
  photoAlt.required = false;
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = "";
  previewImage.removeAttribute("src");
  previewImage.hidden = true;
  previewPlaceholder.hidden = false;
}

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file) {
    clearPhotoPreview();
    return;
  }
  const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!acceptedTypes.includes(file.type)) {
    photoInput.value = "";
    clearPhotoPreview();
    setStatus("Choose a JPG, PNG, WebP, or GIF image.", "error");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    photoInput.value = "";
    clearPhotoPreview();
    setStatus("This image is larger than 10 MB. Please resize it before uploading.", "error");
    return;
  }
  selectedPhoto = file;
  photoAlt.required = true;
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  previewImage.src = previewUrl;
  previewImage.alt = photoAlt.value.trim() || "Preview of the selected photo";
  previewImage.hidden = false;
  previewPlaceholder.hidden = true;
  setStatus("Photo selected. Preview it here, then upload the same file to GitHub.", "success");
});

photoAlt.addEventListener("input", () => {
  previewImage.alt = photoAlt.value.trim() || "Preview of the selected photo";
});
[titleInput, captionInput, categoryInput].forEach((input) => input.addEventListener("input", updatePreview));
categoryInput.addEventListener("change", updatePreview);

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!postForm.reportValidity()) return;
  if (selectedPhoto && !photoAlt.value.trim()) {
    photoAlt.setCustomValidity("Add a short description of the photo.");
    photoAlt.reportValidity();
    photoAlt.setCustomValidity("");
    return;
  }
  setStatus("Preparing the post…");
  try {
    const response = await fetch("posts.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load the current post feed (HTTP ${response.status}).`);
    const currentPosts = await response.json();
    if (!Array.isArray(currentPosts)) throw new Error("The current post feed is not a JSON array.");
    const post = {
      id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `post-${Date.now()}`,
      publishedAt: new Date().toISOString().slice(0, 10),
      category: categoryInput.value,
      eyebrow: categoryNames[categoryInput.value],
      title: titleInput.value.trim(),
      body: captionInput.value.trim(),
      photos: selectedPhoto ? [{
        src: `assets/photos/${encodeURIComponent(selectedPhoto.name)}`,
        alt: photoAlt.value.trim(),
      }] : [],
      discussionUrl: "",
    };
    output.value = JSON.stringify([post, ...currentPosts], null, 2);
    outputWrap.hidden = false;
    setStatus(selectedPhoto
      ? "Post prepared. Upload and commit the selected photo before publishing this feed."
      : "Post prepared. Copy the feed and publish it in GitHub.", "success");
    outputWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Could not prepare the post. Check the current feed and try again.", "error");
  }
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(output.value);
    setStatus("Feed copied. Open the GitHub editor, replace the file contents, and commit.", "success");
  } catch (error) {
    console.error(error);
    output.focus();
    output.select();
    setStatus("Automatic copy was blocked. The JSON is selected; copy it and paste it into the GitHub editor.", "error");
  }
});

updatePreview();
