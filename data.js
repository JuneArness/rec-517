/* ==========================================================================
   REC 517 | data.js : THE FILE YOU EDIT
   --------------------------------------------------------------------------
   Contact details, the Programs list, the Leadership bios and the contact
   form settings all live here. The pages read this file, so a change here
   shows up everywhere (header, footer, Contact page, Programs page).

   RULES (a small typo can blank a section):
   - Keep text inside "double quotes". Need a quote inside? Use \" or ’.
   - Every item in a list ends with a comma, EXCEPT the last one.
   - "" (empty quotes) means "not known yet": the site shows a tidy
     placeholder instead, e.g. "Address coming soon".
   - After editing on GitHub, open the site and hard refresh (Ctrl+Shift+R).

   SOURCE OF FACTS: the REC 517 LLC Business Plan. Nothing here is
   invented. Items marked "planned" or "projected" are plans, not results.
   ========================================================================== */
window.REC517 = {

  /* ------------------------------------------------------------------------
     1. BUSINESS DETAILS
     Fill these in once they are official. Leave "" until then.
     ------------------------------------------------------------------------ */
  site: {
    name: "REC 517",
    legalName: "REC 517 LLC",
    city: "Jackson",
    state: "Michigan",
    founded: "2026",

    address: "",            // EDIT: official street address, e.g. "123 Main St, Jackson, MI 49201"
    phone: "",              // EDIT: e.g. "(517) 555-0123"
    email: "therec517@gmail.com",
    hours: "",              // EDIT: official hours once open, e.g. "Mon–Fri 7 AM–10 PM · Sat–Sun 8 AM–8 PM"
    googleBusinessUrl: "",  // EDIT: link to the Google Business Profile, once created

    // Social links. Copy the example line, remove the // at the start, fill in.
    socials: [
      // { label: "Instagram", url: "https://www.instagram.com/YOUR-HANDLE" },
      // { label: "Facebook",  url: "https://www.facebook.com/YOUR-PAGE" },
    ],

    /* FORM ENDPOINT
       The Contact form does NOT send anywhere until this is filled in.
       Easiest option (free): create a form at https://formspree.io, then
       paste its address here, e.g. "https://formspree.io/f/abcdwxyz".
       Until then, the form checks the fields and tells the visitor it
       isn't connected yet (it never pretends to send). */
    formEndpoint: "",

    // Small footer credit. Set to "" to hide it.
    developerCredit: "Website developed by SAP Development Solutions, LLC"
  },

  /* Proposed hours from the business plan (shown on the Facility page as
     "proposed"). When the official hours are set, fill in site.hours above. */
  plannedHours: [
    { days: "Monday – Friday",   time: "7:00 AM – 10:00 PM" },
    { days: "Saturday – Sunday", time: "8:00 AM – 8:00 PM" }
  ],

  /* ------------------------------------------------------------------------
     2. PROGRAMS (Programs page)
     Fields:
       id          short unique name, lowercase, no spaces (used in links)
       name        title on the card
       icon        one of: basketball, volleyball, soccer, pickleball, golf,
                   dumbbell, sprout, clipboard, calendar, trophy, building, heart
       categories  any of: "court", "golf", "training", "youth", "events", "community"
       status      small label on the card, e.g. "Planned", "Registration open"
       summary     one or two sentences
       planned     bullet points ("what's planned")
       audiences   small tags
       interest    which option to pre-select on the Contact form
                   (must match an entry in "interests" below)
       image       optional photo file name shown at the top of the card
       imageAlt    short description of that photo (for screen readers)

     Copy-paste example (add it inside the [ ] list, with a comma between items):
     {
       id: "summer-camp",
       name: "Summer Hoops Camp",
       icon: "basketball",
       categories: ["youth", "court"],
       status: "Registration open",
       summary: "A week of skills, teamwork and games for ages 8–14.",
       planned: ["Daily skill stations", "Team games", "Final-day showcase"],
       audiences: ["Ages 8–14"],
       interest: "Camps & Clinics"
     },
     ------------------------------------------------------------------------ */
  programs: [
    {
      id: "basketball",
      image: "photo-one-on-one-sm.jpg",
      imageAlt: "Two young players going one-on-one with a basketball",
      name: "Basketball",
      icon: "basketball",
      categories: ["court", "events"],
      status: "Planned",
      summary: "Skill development, team training, leagues and tournaments on REC 517’s planned multi-sport indoor courts.",
      planned: ["Skill development and team training", "Youth and adult leagues", "Tournaments and weekend events", "Camps and clinics"],
      audiences: ["Youth athletes", "Adults", "Teams"],
      interest: "Training"
    },
    {
      id: "volleyball",
      name: "Volleyball",
      icon: "volleyball",
      categories: ["court", "events"],
      status: "Planned",
      summary: "Court time for practices, leagues and competition, indoors and year-round.",
      planned: ["Youth and adult volleyball leagues", "Team practices and court rentals", "Tournaments and clinics"],
      audiences: ["Youth athletes", "Adults", "Teams"],
      interest: "Leagues"
    },
    {
      id: "futsal",
      name: "Futsal / Indoor Soccer",
      icon: "soccer",
      categories: ["court", "events"],
      status: "Planned",
      summary: "Weather-independent soccer for Michigan winters, with futsal play, indoor leagues and turf rentals.",
      planned: ["Indoor soccer leagues", "Futsal play and training", "Turf rentals for teams and clubs"],
      audiences: ["Youth athletes", "Adults", "Clubs"],
      interest: "Leagues"
    },
    {
      id: "pickleball",
      name: "Pickleball",
      icon: "pickleball",
      categories: ["court", "community"],
      status: "Planned",
      summary: "Social, active play for adults and families on multi-sport courts.",
      planned: ["Adult recreational leagues", "Open play", "Court rentals"],
      audiences: ["Adults", "Families"],
      interest: "Leagues"
    },
    {
      id: "golf",
      name: "Golf Training",
      icon: "golf",
      categories: ["golf", "youth", "training"],
      status: "Planned",
      summary: "A planned 20,000 sq. ft. golf training area with youth instruction. REC 517 is a partner of the Hollywood Golf Institute.",
      planned: ["Youth golf instruction", "Golf training and equipment for all ages", "Golf simulators (part of the growth plan)"],
      audiences: ["Youth", "Adults", "Families"],
      interest: "Training"
    },
    {
      id: "training",
      image: "photo-ladder-drill-sm.jpg",
      imageAlt: "A young athlete dribbling through an agility ladder drill",
      name: "Athletic & Personal Training",
      icon: "dumbbell",
      categories: ["training"],
      status: "Planned",
      summary: "Personal and team training programs led by coaches and trainers, focused on skill development.",
      planned: ["Personal training", "Team training programs", "Sport-specific skill development"],
      audiences: ["Youth athletes", "Adults", "Teams"],
      interest: "Training"
    },
    {
      id: "youth-development",
      image: "photo-youth-dribble-sm.jpg",
      imageAlt: "Two young players dribbling side by side during practice",
      name: "Youth Development",
      icon: "sprout",
      categories: ["youth"],
      status: "Planned",
      summary: "Programs for ages 4–18 built to boost academic performance, teamwork and leadership, not just athletic skill.",
      planned: ["Youth programs for ages 4–18", "Teamwork, leadership and academic focus", "After-school programs (part of the growth plan)"],
      audiences: ["Ages 4–18", "Schools", "Families"],
      interest: "Youth Programs"
    },
    {
      id: "camps",
      image: "photo-gym-drills-sm.jpg",
      imageAlt: "A large group of young players running ball-handling drills in a gym",
      name: "Camps & Clinics",
      icon: "clipboard",
      categories: ["youth", "training"],
      status: "Planned",
      summary: "Youth development camps and skill clinics across the facility’s sports.",
      planned: ["Youth development camps", "Sport-specific skill clinics", "Youth clinics and school visits"],
      audiences: ["Youth athletes", "Schools"],
      interest: "Camps & Clinics"
    },
    {
      id: "open-gym",
      image: "photo-young-player-sm.jpg",
      imageAlt: "A young child dribbling a basketball across an open gym floor",
      name: "Open Gym",
      icon: "calendar",
      categories: ["community"],
      status: "Planned",
      summary: "Open gym hours for drop-in play and weekend family recreation.",
      planned: ["Open gym hours", "Weekend family recreation"],
      audiences: ["Families", "Adults", "Youth"],
      interest: "General Information"
    },
    {
      id: "leagues-tournaments",
      image: "photo-group-drill-sm.jpg",
      imageAlt: "Young players running a group dribbling drill around the center circle",
      name: "Leagues & Tournaments",
      icon: "trophy",
      categories: ["events", "community"],
      status: "Planned",
      summary: "Evening community leagues and weekend tournaments, including space for regional tournaments that bring visitors to Jackson.",
      planned: ["Evening community leagues", "Weekend tournaments and events", "Travel teams (part of the growth plan)"],
      audiences: ["Adults", "Teams", "Tournament organizers"],
      interest: "Tournaments"
    },
    {
      id: "rentals",
      name: "Facility Rentals",
      icon: "building",
      categories: ["community", "events"],
      status: "Planned",
      summary: "Court, turf and meeting-room rentals for schools, churches, organizations, businesses and community groups.",
      planned: ["Court and turf rentals", "Meeting room rentals", "Team building, charity events, business expos and community festivals"],
      audiences: ["Schools", "Churches", "Organizations", "Businesses"],
      interest: "Facility Rental"
    },
    {
      id: "wellness",
      name: "Health & Wellness",
      icon: "heart",
      categories: ["training", "community"],
      status: "Planned",
      summary: "Health and wellness workshops focused on fitness and education for athletes, families and the community.",
      planned: ["Health and wellness workshops", "Fitness and nutrition education"],
      audiences: ["Families", "Adults", "Youth"],
      interest: "Community Programs"
    }
  ],

  /* Filter buttons on the Programs page (id must match "categories" above). */
  programCategories: [
    { id: "all",       label: "All Programs" },
    { id: "court",     label: "Court Sports" },
    { id: "golf",      label: "Golf" },
    { id: "training",  label: "Training & Wellness" },
    { id: "youth",     label: "Youth" },
    { id: "events",    label: "Leagues & Events" },
    { id: "community", label: "Community & Rentals" }
  ],

  /* ------------------------------------------------------------------------
     3. LEADERSHIP (About page)
     Bios are from the business plan. Fields:
       name      full name
       role      their REC 517 title. "" until confirmed (not stated in the plan)
       subtitle  short description from their bio
       photo     file name of a headshot in this folder, e.g. "james-manuel.jpg"
                 ("" shows initials instead)
       highlights  3–4 short facts shown on the card
       bio       paragraphs shown when "Read full bio" is opened.
                 Leave [] to show "Biography coming soon".
     ------------------------------------------------------------------------ */
  leadership: [
    {
      name: "James Lee Manuel Jr.",
      role: "Founder & Owner",
      subtitle: "Basketball trainer, mentor and former professional athlete",
      photo: "",
      highlights: ["30+ years mentoring athletes", "Junior Olympic Team, 1981", "Played professionally in Northern Europe", "Wheaties Community Participant of the Year"],
      bio: [
        "James Lee Manuel Jr. is an accomplished basketball trainer, mentor, and former professional athlete whose career spans more than four decades. Born and raised in Lansing, Michigan, he developed his talents at Long Beach Polytechnic High School and Everett High School, then played college basketball at Western Michigan University and Central State University of Ohio.",
        "Recognized as one of the most talented junior players in the nation, he earned a national ranking of #36 from Street & Smith and was selected for the Junior Olympic Team in 1981. He went on to play professional basketball in Northern Europe.",
        "After his playing career, he turned to mentoring and training. With more than thirty years of experience, he has coached and guided athletes at every stage, from beginners to professionals in the NFL and NBA, with organizations across California, Michigan, and Ohio, including a five-year tenure with Hype Athletics.",
        "He founded REC 517 to strengthen communities through sports training, life mentorship, and youth development. His civic work has been recognized with the Wheaties Community Participant of the Year award."
      ]
    },
    {
      name: "Selina “Hollywood” Johnson",
      role: "",
      subtitle: "Founder & Executive Director, Hollywood Golf Institute",
      photo: "",
      highlights: ["Introduced 4,000+ young people to golf", "150+ students earned college scholarships", "Card Walker Award recipient", "Two Hall of Fame inductions"],
      bio: [
        "Selina “Hollywood” Johnson is a prominent figure in golf, recognized for her dedication to youth development through the sport. She is the founder and executive director of the Hollywood Golf Institute, established in 1980 and incorporated in 1984 in Detroit.",
        "Known as “The First Lady of Golf,” she has introduced more than 4,000 young people to the game, and more than 150 of her students have earned collegiate scholarships, with a strong emphasis on education and character development. Her approach is to motivate youth by “challenging their climate of thinking through golf.”",
        "She was the first African American woman to receive the Card Walker Award for outstanding contribution to junior golf, and she has been inducted into the International Afro-American Sports Hall of Fame and the African American Golfers’ Hall of Fame.",
        "Under her leadership, the Hollywood Golf Institute offers golf course architecture lessons, a book club, financial programming, after-school tutorials, and summer tournaments, and has taken student golfers to junior tournaments and events in more than 20 states."
      ]
    },
    {
      name: "Lawrence Green",
      role: "",
      subtitle: "Retired educator, 35 years in education administration",
      photo: "",
      highlights: ["30 years in administration at Jackson Public Schools", "Founded the Pro-Duffers golf chapter in Jackson", "Youth Build consultant"],
      bio: [
        "Lawrence Green is a retired educator with 35 years in education administration. He grew up in Memphis, Tennessee, earned his Bachelor of Arts from AM&N College (now the University of Arkansas at Pine Bluff), and then moved to Jackson, Michigan. He completed his Master of Arts at Michigan State University and was admitted to the Doctoral Program in Educational Administration.",
        "After 30 years in administration at Jackson Public Schools, he served five more years as a principal in Memphis before retiring.",
        "He loves teaching young people golf. He founded and led the Pro-Duffers golf chapter in Jackson, part of a nationally accredited golf organization, which served youth and adults for ten years.",
        "He has also consulted with the Youth Build organization, supporting young adults returning to earn their GED or diploma while training in building trades, and presented Ruby Payne’s “A Framework for Understanding Poverty” to classroom teachers. He is a member of Lily Missionary Baptist Church in Jackson."
      ]
    },
    {
      name: "Daniel Bradford",
      role: "",
      subtitle: "Entrepreneur, technology innovator and educator",
      photo: "",
      highlights: ["Founder of GoMobile for Education (nonprofit, 2019)", "Over a decade building businesses", "Technology, finance, fashion and manufacturing ventures"],
      bio: [
        "Daniel Bradford is an entrepreneur, technology innovator, educator, and brand architect whose business journey spans more than a decade. He studied Computers and Electronics at Everest Institute (2008–2010) and launched his first venture, Personal Care Computer Repair, in 2009, including an internship pathway that helped students earn income by building websites for local businesses.",
        "He went on to found Unique Design Assistants (2011), focused on website, application and mobile web development, and GoMobile Technology (2015). In 2019 he founded GoMobile for Education, a nonprofit that introduces young people to technology careers through hands-on skills such as device repair and digital literacy.",
        "His ventures also include Alpha Financial Service Group and Alpha Financial Group Services (credit education and business consulting), Urway Business Solutions (brand and marketing strategy), several family fashion brands under DM Luxury Collections, DM Luxury Winery, and Three Kings International (custom apparel manufacturing).",
        "Since 2010, his mission has stayed the same: to innovate, educate, and build brands that create lasting impact."
      ]
    },
    {
      name: "Diane C. Issa-Wicker",
      role: "",
      subtitle: "Educator, consultant, mentor and community leader",
      photo: "",
      highlights: ["30+ years with Detroit Public Schools", "12 years as adjunct professor, Wayne State", "Detroit Public Schools Teacher of the Year", "Volunteer at Hollywood Golf Institute"],
      bio: [
        "Diane C. Issa-Wicker is an educator, consultant, mentor, and community leader whose career spans more than thirty years in the Detroit Public Schools Community District (DPSCD) and twelve years as an adjunct professor at Wayne State University.",
        "She holds a bachelor’s degree in Cognitive Impairment/Physically or Otherwise Health Impaired and a master’s degree in educational leadership. At Keidan Elementary School she pioneered autism education, earning certification from Oakland University, and introduced the Learning for Life program with the Boy Scouts of America.",
        "As a Teacher Consultant, Behavior Specialist, and Mentor, she trained more than 350 DPSCD staff members and achieved the Masters’ Instructor level with the Crisis Prevention Intervention Institute. Her honors include Detroit Public Schools Teacher of the Year, runner-up for Michigan Teacher of the Year, the Booker T. Washington Award, and the Silver Beaver Award from the Boy Scouts of America.",
        "She has volunteered at the Hollywood Golf Institute as secretary and grant writer, supporting golfers with special needs, and has served in many leadership roles at Friendship Baptist Church. In her words: “Serving is what I do best.”"
      ]
    },
    {
      name: "Renee Clarke",
      role: "",
      subtitle: "",
      photo: "",
      highlights: [],
      bio: []   // EDIT: biography not yet provided in the business plan
    },
    {
      name: "Beverly Claybrook",
      role: "",
      subtitle: "",
      photo: "",
      highlights: [],
      bio: []   // EDIT: biography not yet provided in the business plan
    }
  ],

  /* ------------------------------------------------------------------------
     4. CONTACT FORM "Interest" options
     "key" is what goes in links like contact.html?interest=sponsorship
     ------------------------------------------------------------------------ */
  interests: [
    { key: "youth",       label: "Youth Programs" },
    { key: "training",    label: "Training" },
    { key: "camps",       label: "Camps & Clinics" },
    { key: "leagues",     label: "Leagues" },
    { key: "tournaments", label: "Tournaments" },
    { key: "rental",      label: "Facility Rental" },
    { key: "sponsorship", label: "Sponsorship" },
    { key: "partnership", label: "Partnership" },
    { key: "community",   label: "Community Programs" },
    { key: "general",     label: "General Information" }
  ],

  /* ------------------------------------------------------------------------
     5. EVENTS + GET INVOLVED (database connection)
     The Events page, the Sponsor / Donate / Volunteer forms and the Admin
     page use a free Supabase project. Paste the two values from
     Supabase > Project Settings > API Keys. Both are safe to publish.
     NEVER paste the "secret" or "service_role" key anywhere in this site.
     Until these are filled in, the Events page shows "coming soon" and the
     forms say they were NOT sent (they never pretend).
     ------------------------------------------------------------------------ */
  supabaseUrl: "",   // EDIT: e.g. "https://abcdefghijkl.supabase.co"
  supabaseKey: "",   // EDIT: the "publishable" key, starts with "sb_publishable_"

  /* Online giving. Paste a payment link here (Stripe Payment Link, PayPal,
     Square, Zeffy, etc.) to show a "Give online" button on the Donate tab.
     Leave "" and the Donate tab shows only the "tell us how you'd like to
     give" form. */
  donateUrl: "",
  donateButton: "Give online",

  /* Shown under the Donate tab. REC 517 LLC is a limited liability company,
     so gifts are not tax-deductible unless it works through a nonprofit
     fiscal sponsor. If that changes, update this sentence. */
  donateNote: "REC 517 LLC is a limited liability company, not a 501(c)(3) charity, so gifts to REC 517 are not tax-deductible.",

  /* ------------------------------------------------------------------------
     6. PAST EVENTS BUILT INTO THE SITE
     These show on the Events page even before the database is connected.
     New events should be added in the Admin page instead. Photos are files
     in this folder. Use date: "YYYY-MM-DD", or when: "Summer 2026" if the date is unknown.
     ------------------------------------------------------------------------ */
  pastEvents: [
    {
      title: "Hollywood Golf Comes to Jackson",
      date: "2026-09-25",
      time: "Registration 8:00 AM",
      location: "Ella Sharp Park Golf Course, 1000 Ella Sharp Park Rd, Jackson, MI 49201",
      summary: "The REC 517 presented Hollywood Golf, featuring Mrs. Selina Johnson and Friends: a day of golf competition, networking, a vendor marketplace, prizes and giveaways, food and entertainment.",
      photos: [
        { src: "event-golf-2026-01.jpg", caption: "The youth press team" },
        { src: "event-golf-2026-02.jpg", caption: "Friends of REC 517 at the clubhouse" },
        { src: "event-golf-2026-03.jpg", caption: "Press passes and notebooks ready" },
        { src: "event-golf-2026-04.jpg", caption: "Arriving at the course" },
        { src: "event-golf-2026-05.jpg", caption: "Check-in table" },
        { src: "event-golf-2026-06.jpg", caption: "Gift bags and the raffle table" },
        { src: "event-golf-2026-07.jpg", caption: "Golfers at the clubhouse" },
        { src: "event-golf-2026-08.jpg", caption: "Heading to the carts" },
        { src: "event-golf-2026-09.jpg", caption: "Inside the clubhouse" },
        { src: "event-golf-2026-10.jpg", caption: "Welcome remarks" },
        { src: "event-golf-2026-11.jpg", caption: "Ready to tee off" },
        { src: "event-golf-2026-flyer.jpg", caption: "The event flyer" }
      ]
    }
  ]
};
