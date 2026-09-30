export const DEMO_RESUME = {
  title: 'Sample Resume',
  targetRole: 'Frontend Developer',
  templateId: 'classic-ats',
  personalInfo: {
    fullName: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    title: 'Frontend Developer',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan',
    portfolio: 'alexmorgan.dev',
  },
  summary: 'Frontend Developer with 3 years of experience building responsive, accessible web applications with React and TypeScript. Passionate about clean UI, performance, and delightful user experiences.',
  skills: ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Node.js', 'Git', 'REST APIs', 'Figma'],
  education: [
    { id: 'e1', school: 'State University', degree: 'B.S.', field: 'Computer Science', startDate: '2018', endDate: '2022', description: 'Graduated with honors. Relevant coursework: Web Development, Databases, UI Design.' },
  ],
  experience: [
    {
      id: 'x1', company: 'TechNova Inc.', role: 'Frontend Developer', location: 'Remote',
      startDate: '2022', endDate: '', current: true,
      bullets: [
        'Built and shipped 12+ customer-facing React features used by 40,000 monthly users.',
        'Improved page load performance by 35% through code splitting and lazy loading.',
        'Collaborated with designers to implement a reusable component library.',
      ],
    },
    {
      id: 'x2', company: 'Bright Labs', role: 'Web Development Intern', location: 'Austin, TX',
      startDate: '2021', endDate: '2022', current: false,
      bullets: [
        'Developed responsive landing pages with HTML, CSS, and JavaScript.',
        'Wrote unit tests that increased frontend coverage to 80%.',
      ],
    },
  ],
  projects: [
    { id: 'p1', name: 'TaskFlow App', link: 'github.com/alexmorgan/taskflow', technologies: 'React, Firebase, Tailwind', description: 'A collaborative task manager with real-time sync and drag-and-drop boards.' },
  ],
  certifications: [
    { id: 'c1', title: 'Meta Front-End Developer Professional Certificate', detail: 'Coursera', date: '2023' },
  ],
  achievements: [
    { id: 'a1', title: 'Hackathon Winner', detail: '1st place out of 60 teams at CityHack 2022', date: '2022' },
  ],
  languages: ['English (Native)', 'Spanish (Conversational)'],
  customSections: [],
  sectionOrder: [
    { id: 'summary', visible: true },
    { id: 'skills', visible: true },
    { id: 'experience', visible: true },
    { id: 'projects', visible: true },
    { id: 'education', visible: true },
    { id: 'certifications', visible: true },
    { id: 'achievements', visible: true },
    { id: 'languages', visible: true },
  ],
};
