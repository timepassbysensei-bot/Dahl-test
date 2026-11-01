/**
 * siteConfig.js
 * ---------------------------------------------------------------------------
 * SINGLE SOURCE OF TRUTH FOR ALL TEACHER-FACING CONTENT.
 *
 * Everything a teacher may want to change lives in this one file:
 * name, WhatsApp number, pincode badge, tracks, subjects and AI prompts.
 * Replace the placeholder strings, save, and the whole site updates.
 *
 * STRICT CONTENT RULES baked into this file:
 *   - No class timing / schedule tables.
 *   - No student results, marks or testimonials.
 * ---------------------------------------------------------------------------
 */

export const siteConfig = {
  meta: {
    title: "Manju Sensei — Teacher's Resource Hub",
    edition: '№ 001 / 2026',
    established: 'EST. 2026',
    region: '827013 • IN',
    tagline: 'Hindi. Sanskrit. Everything in between.',
  },

  school: {
    // Replace with the exact school name if the teacher prefers a different label.
    name: 'View Point Public School',
    shortName: 'View Point',
    hubLabel: "Teacher's Resource Hub",
  },

  teacher: {
    // Display name shown in the navbar, hero and footer.
    name: 'Manju Sensei',
    // Formal introduction used sparingly in metadata rows.
    formalName: 'Smt. Manju Madam',
    role: 'Senior Educator',
    specialisation: 'Hindi & Sanskrit Literature, Vyakaran, and All-Subject Tuition',
    initials: 'MS',
    intro:
      'A senior educator teaching Class VII–X Hindi and Sanskrit literature, grammar and board preparation — plus complete all-subject tuition for students who need one steady, patient mentor.',
  },

  location: {
    // Easy-to-edit pincode + country badge used across the site.
    badge: '827013 • IN',
    city: 'Bokaro Steel City',
    region: 'Jharkhand, India',
    note: 'Local students welcome · Online support on WhatsApp',
  },

  contact: {
    // digits only in the number; the display string is what visitors read.
    whatsappNumber: '+917654172754',
    whatsappDisplay: '+91 76541 72754',
    whatsappMessage: "Hello Ma'am, I have a question about the study material.",
    email: 'viewpointpublicschoolofficial@gmail.com',
  },

  admin: {
    // The Supabase Auth account created by the migration file.
    // The password is intentionally NOT stored in this file.
    email: 'viewpointpublicschoolofficial@gmail.com',
    consoleLabel: "Teacher's Console",
    sessionNote: 'Sign-in is case-insensitive. Session secured by Supabase Auth.',
  },

  nav: [
    { label: 'Tracks', href: '#tracks' },
    { label: 'Vault', href: '#vault' },
    { label: 'Contact', href: '#contact' },
  ],

  hero: {
    eyebrow: 'A quieter kind of classroom',
    // The bracketed words below are the interactive highlight blocks.
    headline: {
      lead: 'A classroom that',
      quiet: 'doesn’t whisper.',
      speak: 'It speaks',
      highlight: 'Knowledge.',
    },
    description:
      'Notes, question papers and handouts for Hindi, Sanskrit and every tuition subject — written by hand, explained in plain language, and always one tap away.',
    primaryCta: { label: 'Enter the vault', href: '#vault' },
    secondaryCta: { label: 'Ask Sleep Sensei', action: 'chat' },
    meta: ['CLASSES VII – X', 'HINDI + SANSKRIT', 'ALL-SUBJECT TUITION'],
  },

  marquee: [
    'HINDI LITERATURE',
    'SANSKRIT VYAKARAN',
    'BOARD PREPARATION',
    'MATHS',
    'SCIENCE',
    'SOCIAL STUDIES',
    'ENGLISH',
    'TRANSLATION PRACTICE',
  ],

  tracks: [
    {
      id: 'school',
      index: '01',
      meta: 'SCHOOL CURRICULUM',
      title: 'School Curriculum',
      italic: 'Classes VII – X',
      description:
        'Focused classroom support for Hindi and Sanskrit — literature explained line by line, grammar drilled until it feels obvious, and board answers built to score.',
      tags: ['Hindi Literature', 'Sanskrit Vyakaran', 'Board Preparation', 'Translation Practice'],
      note: 'CBSE & state board friendly',
      stats: [
        { label: 'Classes', value: 'VII – X' },
        { label: 'Languages', value: '02' },
        { label: 'Focus', value: 'Board' },
      ],
    },
    {
      id: 'tuition',
      index: '02',
      meta: 'ALL-SUBJECT TUITION',
      title: 'Complete Tuition Hub',
      italic: 'All classes. All subjects.',
      description:
        'One mentor for the whole timetable. Personal tuition across Maths, Science, Social Studies, English, Hindi and Sanskrit, paced to the student rather than the syllabus.',
      tags: ['Maths', 'Science', 'Social Studies', 'English', 'Hindi', 'Sanskrit'],
      note: 'Personal mentorship · All subjects',
      stats: [
        { label: 'Subjects', value: '06' },
        { label: 'Mode', value: '1:1' },
        { label: 'Approach', value: 'Concept' },
      ],
    },
  ],

  method: {
    eyebrow: 'The study method',
    title: 'Three moves, repeated until it clicks',
    steps: [
      {
        index: '01',
        title: 'Diagnose',
        detail: 'Find the exact sentence, rule or formula where the confusion actually starts.',
      },
      {
        index: '02',
        title: 'Explain',
        detail: 'Rebuild the concept in plain Hindi, English or Hinglish — whichever lands fastest.',
      },
      {
        index: '03',
        title: 'Practise',
        detail: 'Apply it to a real board-style question, then to one the student has never seen.',
      },
    ],
  },

  vault: {
    eyebrow: 'The resource vault',
    title: 'Notes, papers & handouts',
    italic: 'one tap away.',
    description:
      'Everything uploaded by the teacher appears here the moment it is published — no logins, no folders to dig through.',
    filters: [
      { id: 'all', label: 'All' },
      { id: 'hindi', label: 'Hindi' },
      { id: 'sanskrit', label: 'Sanskrit' },
      { id: 'tuition', label: 'Tuition (All Subjects)' },
      { id: 'class-7-10', label: 'Class 7–10' },
      { id: 'pdf', label: 'PDFs' },
      { id: 'image', label: 'Photos / Images' },
    ],
  },

  contactSection: {
    eyebrow: 'Direct line',
    title: 'Let’s talk.',
    description:
      'A doubt, a paper request, or a question about tuition — send it directly. Messages are answered on WhatsApp, and cleared from the database automatically after seven days.',
    formNote: 'Every message self-destructs after 7 days. Nothing is kept longer than it needs to be.',
  },

  ai: {
    name: 'Sleep Sensei',
    tagline: 'Your study mentor, awake at any hour.',
    greeting:
      "Namaste! I'm Sleep Sensei, your study mentor for Class 7–10 Hindi, Sanskrit and every tuition subject. Ask me a grammar rule, a shloka meaning, a maths doubt, or paste a question you're stuck on.",
    suggestions: [
      'Explain संधि in simple Hindi',
      'Give me 5 Hindi vyakaran practice questions',
      'Help me understand this science chapter',
      'How do I write a better board answer?',
    ],
    disclaimer: 'Study guidance only · Always cross-check with your textbook',
  },

  footer: {
    headline: 'Let’s',
    headlineAccent: 'learn.',
    note: 'Built for students who ask better questions.',
    credit: 'Designed & built in India',
  },
}

/** Builds a wa.me link with a URL-encoded prefilled message. */
export function whatsappLink(message = siteConfig.contact.whatsappMessage, number = siteConfig.contact.whatsappNumber) {
  const digits = String(number).replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

/** Builds a wa.me link for replying to a specific student number. */
export function whatsappReplyLink(phone, studentName = '') {
  const digits = String(phone || '').replace(/\D/g, '')
  const greeting = studentName ? `Hello ${studentName}, ` : 'Hello, '
  return `https://wa.me/${digits}?text=${encodeURIComponent(`${greeting}this is Manju Sensei. I received your message on the resource hub.`)}`
}

export default siteConfig
