# REC 517 | Static Website

The public website for **REC 517 LLC**, a planned multi-sport indoor recreational and
training facility in Jackson, Michigan. All content comes from the REC 517 business plan:
nothing is invented, and projections are labeled as planned, projected or goals. It is
plain HTML, CSS and JavaScript. There is no backend, no build step and no paid platform,
and it runs on GitHub Pages.

- **Pages:** Home, About, Programs, Facility, Impact, Contact, plus a 404 page
- **Fonts:** Archivo (headlines) and DM Sans (text), from Google Fonts
- **Colors:** taken from the REC 517 logo (orange, teal, navy)
- **Website developed by SAP Development Solutions, LLC**

## Folder structure (39 files, one folder, no subfolders)

```text
rec-517/
├── index.html            Home: hero, who we are, sports, facility, impact, who we serve
├── about.html            Mission, vision, why REC 517, goals, partner, leadership bios
├── programs.html         12 programs with filter buttons
├── facility.html         Planned 70,500 sq ft facility, spaces, rentals, proposed hours
├── impact.html           Youth, community, workforce, economy, partnerships, growth plan
├── contact.html          Contact form and contact details
├── 404.html              "Out of bounds" page for broken links
├── data.js               THE FILE YOU EDIT: contact info, programs, bios, form setting
├── app.js                Menu, programs filter, bios, contact form
├── animations.js         Scroll reveals and number counters
├── style.css             All styling (colors and fonts are at the top)
├── responsive.css        Phone, tablet and desktop layouts; reduced motion
├── rec-517-logo.png      Logo (background removed so it works on dark and light)
├── team-photo.jpg        Team photo from the business plan (large)
├── team-photo-800.jpg    Same photo, smaller, for phones
├── photo-*.jpg           10 training photos (large versions, for full screen)
├── photo-*-sm.jpg        9 smaller copies (load fast on phones and in cards)
├── og-image.jpg          Picture shown when the link is shared (1200 × 630)
├── favicon.svg           Browser tab icon
├── apple-touch-icon.png  Icon when saved to an iPhone home screen
├── README.md
└── .gitignore
```

**Why one flat folder?** The build prompt suggested `css/`, `js/` and `images/`
folders. Uploading through GitHub's website can silently drop folders, which breaks
every page. A flat folder can't break that way. The files keep the prompt's names
(`style.css`, `responsive.css`, `app.js`, `animations.js`, `data.js`).

## Step 1: Preview on your computer

1. Right-click the zip → **Extract All** → **Extract**. Never open pages from inside the
   zip; they'll look unstyled.
2. Open the extracted `rec-517` folder and double-click `index.html`.

Full preview, closest to the live site (Python 3.11):

```bash
cd rec-517
python -m http.server 8000
```

Open http://localhost:8000 in your browser. Press `Ctrl + C` in the terminal to stop.

## Step 2: Put it on GitHub

1. Sign in at https://github.com.
2. Click **+** (top right) → **New repository**.
3. Name it `rec-517`, choose **Public**, and leave README, .gitignore and license
   **unchecked**. Click **Create repository**.
4. On the next page, click **uploading an existing file**.
5. Open the extracted `rec-517` folder. Press **Ctrl + A** to select everything, then drag
   the files (not the folder) into the browser window. Chrome or Edge work best.
6. Wait until all the files are listed. Type `Initial REC 517 website` in the box and click
   **Commit changes**.
7. Check the repo's main page: `index.html` must be at the top level, not inside a folder.

> `.gitignore` starts with a dot, so Windows may hide it. If it doesn't upload, that's
> fine; the site works without it.

Or with Git:

```bash
cd rec-517
git init
git add .
git commit -m "Initial REC 517 website"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## Step 3: Turn on GitHub Pages

1. In the repository, click **Settings** → **Pages** (left menu).
2. Under **Source**, choose **Deploy from a branch**.
3. Pick branch **main** and folder **/ (root)**, then click **Save**.
4. Wait 1 to 3 minutes and refresh. The site is live at
   `https://YOUR-ACCOUNT.github.io/rec-517/`.
5. Open it and press **Ctrl + Shift + R** for a fresh load.

## Step 4: Fix link previews (after it's live)

Each `.html` file has `https://www.example.com/` in 4 places near the top: canonical,
og:url, og:image and twitter:image. Replace it with the live address, for example
`https://YOUR-ACCOUNT.github.io/rec-517/`, so shared links show the REC 517 picture.
`index.html` also has it twice in the "ld+json" block. Edit on GitHub: open the file,
click the **pencil**, press **Ctrl + F**, make the changes, then click **Commit changes**.

## Custom domain (later)

1. **Settings → Pages → Custom domain**: type the domain (e.g. `www.rec517.com`) and click
   **Save**.
2. At the domain registrar:
   - Add a **CNAME** record for `www` pointing to `YOUR-ACCOUNT.github.io`.
   - Add four **A** records for the bare domain: `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`.
3. DNS can take up to 24 hours to update. When it does, tick **Enforce HTTPS**, then redo
   Step 4 with the new domain.

## Updating content (data.js)

Open `data.js` on GitHub → click the **pencil** → make the change → **Commit changes**.
Wait about 2 minutes, then open the site and press **Ctrl + Shift + R**.

### Contact details (fills in the footer and Contact page)

Find the `site:` block near the top and fill in the empty quotes:

```javascript
    address: "123 Example St, Jackson, MI 49201",
    phone: "(517) 555-0123",
    email: "info@rec517.com",
    hours: "Mon–Fri 7 AM–10 PM · Sat–Sun 8 AM–8 PM",
    googleBusinessUrl: "https://g.page/YOUR-PROFILE",
```

While a field is `""`, the site shows a tidy placeholder such as "Email coming soon".
Only enter details once they're official.

### Social links

Remove the `//` at the start of a line and fill in the link:

```javascript
    socials: [
      { label: "Instagram", url: "https://www.instagram.com/YOUR-HANDLE" },
      { label: "Facebook",  url: "https://www.facebook.com/YOUR-PAGE" }
    ],
```

### Programs

Each program is one `{ ... }` block in `programs:`. There's a full copy-paste example
in the comment above the list. When a program opens for registration, change
`status: "Planned"` to something like `status: "Registration open"`.

### Leadership

- Each person is one block in `leadership:`.
- Add REC 517 titles in `role: ""` once they're confirmed. The plan only states James
  Lee Manuel Jr.'s role (Founder & Owner).
- To add a headshot, upload the photo (e.g. `renee-clarke.jpg`) and set
  `photo: "renee-clarke.jpg"`.
- Renee Clarke's and Beverly Claybrook's bios are empty in the business plan. Add
  paragraphs to their `bio: []` like this:
  `bio: ["First paragraph.", "Second paragraph."]`

### Training photos (where each one is used)

| Photo | Used on |
| --- | --- |
| `photo-hero-drills` | Home hero background; About ("Why REC 517") |
| `photo-gym-line` | About page header background |
| `photo-group-drill` | Programs page header; Leagues & Tournaments card |
| `photo-cone-drills` | Impact page header; Impact youth section; Home gallery |
| `photo-young-player` | Contact page header; Open Gym card; Home gallery |
| `photo-youth-dribble` | Home gallery; Youth Development card |
| `photo-one-on-one` | Home gallery; Basketball card |
| `photo-ladder-drill` | Home gallery; Impact youth section; Athletic Training card |
| `photo-gym-drills` | Home gallery; About; Camps & Clinics card |
| `photo-champions` | Impact, "Community" section |

- These are training-session photos, not photos of the REC 517 facility, and the site
  says so under the photos. Put real facility photos only on the Facility page, once
  they exist.
- To swap a photo, upload a new file with the **same name** (both the large and the
  `-sm` version) and it changes everywhere.
- Program card photos are set in `data.js` with `image:` and `imageAlt:`.

### Photos and renderings (Facility page)

The Facility page has three labeled placeholders, e.g. "[Architectural rendering — to be
added]". To swap one for a real picture:
1. Upload the image (JPEG, about 1600px wide, lowercase name like `rendering-1.jpg`).
2. In `facility.html`, replace that placeholder's `<div class="media-ph ...">…</div>`
   with `<img src="./rendering-1.jpg" alt="Describe the picture" loading="lazy" style="border-radius:22px">`.

### Rules that prevent most problems

- Keep text inside "double quotes". For an apostrophe, use ’ (or \').
- Every item in a list ends with a comma, except the last one.
- File names are case-sensitive on GitHub: `Photo.JPG` is not `photo.jpg`.
- Made a mistake? Open the file on GitHub → **History** → pick the earlier version and
  copy it back.

## Connecting the contact form

Until you connect it, the form checks the fields and then tells the visitor plainly that
the message was **not sent**. It never pretends to work.

1. Create a free account at https://formspree.io and click **New Form**. Use the REC 517
   email as the recipient.
2. Copy the form's endpoint. It looks like `https://formspree.io/f/abcdwxyz`.
3. In `data.js`, set `formEndpoint: "https://formspree.io/f/abcdwxyz",`.
4. Send a test message from the live site and confirm the email in Formspree.

The form includes a hidden spam trap, and Formspree adds its own spam filtering. Other
services (Netlify Forms, EmailJS or a custom backend) can replace it later. The form
already sends standard form data.

## After any change

GitHub Pages usually updates within 1 to 2 minutes. If the old version still shows,
press **Ctrl + Shift + R**.

## Adding a new page later

Copy an existing page (e.g. `impact.html`), rename it, and change the `<title>`,
description and content. Add a link to it in the navigation of every page (two spots per
page: the desktop menu and the mobile menu). Future sections such as registration,
events, memberships or a new division can be added this way without changing the
existing pages.

## Content notes

- **Everything comes from the business plan.** Where the plan contradicts itself, the
  site uses:
  - 20+ permanent jobs (the plan also says "15+ local jobs")
  - the 7-group market breakdown (the plan also has a 4-group version)
- **Planned, not open.** Facility size, jobs, hours and programs are labeled planned,
  projected, proposed or goal.
- **No clinical services.** The plan's list of future staff includes licensed therapists,
  social workers and peer recovery coaches. The site leaves those out and describes
  wellness as educational and fitness-focused.
- **Team photo caption.** The plan's caption names "Willie Green" while the bio says
  "Lawrence Green". The caption doesn't list names until this is confirmed. The names
  are in a comment in `about.html`.

## Privacy and security

- No passwords, keys, tokens, trackers or analytics anywhere in the project.
- The repository is public, so everything in it is public. Don't upload the business plan,
  financials or anything private. `.gitignore` blocks PDFs, Word files and zips as a
  safety net.
- The site shows every value from `data.js` as plain text, so a typo can't break the page
  layout or run code.

## Checked before delivery

- All 7 pages load with no script errors when served from a subfolder, the way GitHub
  Pages serves them. The link checker found no broken links, missing files or duplicate
  page headings.
- No sideways scrolling at 1920, 1440, 1280, 1024, 768, 480, 430, 390 and 375px wide.
- Mobile menu tested: open, Escape to close (focus returns to the button), tab stays
  inside the menu, and links navigate.
- Programs tested:
  - Every filter works.
  - Links like `programs.html#golf` jump to and highlight the card.
  - Bios open and close.
- Contact form tested:
  - Required fields and phone format are checked.
  - `?interest=sponsorship` pre-selects the interest.
  - With no endpoint, it shows the "not sent" notice.
  - With a test endpoint, it shows the success message, and the failure message on an
    error.
- Reduced-motion mode shows all content with no animation.
- A separate reviewer checked every claim against the business plan, and the issues found
  were corrected.
- The future division name the client asked to hold back appears nowhere in the files.
