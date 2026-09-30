// Central legal copy. Rendered on the /terms and /privacy pages and reused
// verbatim for the downloadable documents so both always match.

export const TERMS_SECTIONS = [
  { title: 'Acceptance of Terms', body: 'By creating an account or using Smart Resume Designer (the "Service"), you agree to these Terms & Conditions. If you do not agree, please do not use the Service. These terms form a binding agreement between you and the operator of Smart Resume Designer.' },
  { title: 'Account Responsibilities', body: 'You must provide accurate information when registering and keep your login credentials confidential. You are responsible for all activity under your account. Notify us promptly of any unauthorized access. Accounts are for individual use unless otherwise agreed.' },
  { title: 'Resume Content', body: 'You retain full ownership of the resume content you create. By using the Service, you grant us a limited license to store, process, and display your content solely to operate the Service (including backups, previews, PDF generation, and public sharing links you explicitly enable).' },
  { title: 'AI-Generated Content', body: 'The Service uses Google Gemini AI to suggest summaries, bullet points, skills, and feedback. AI output is provided as a drafting aid and may be inaccurate or incomplete. You are solely responsible for reviewing, verifying, and approving all AI-suggested content before using it. Never include false credentials, employers, or achievements in your resume.' },
  { title: 'User Responsibilities', body: 'You agree not to: (a) upload unlawful, harmful, or infringing content; (b) misrepresent your qualifications; (c) attempt to disrupt or abuse the Service, including excessive automated requests; (d) circumvent authentication, rate limits, or access controls; (e) use the Service to generate content for others in violation of applicable law.' },
  { title: 'Intellectual Property', body: 'The Service interface, templates, branding, and software are the intellectual property of the Service operator. You may use the templates to create your own resumes. You may not copy, resell, or redistribute the Service itself without written permission.' },
  { title: 'Third-Party Services', body: 'The Service integrates third-party providers including Firebase (authentication and storage), MongoDB (database hosting), and Google Gemini (AI). Your use of these integrations is also subject to the respective providers\' terms and privacy policies.' },
  { title: 'Service Availability', body: 'We aim for reliable availability but do not guarantee uninterrupted service. The Service may be modified, suspended, or discontinued at any time. We are not liable for temporary outages, AI provider downtime, or data loss; we recommend exporting important resumes as PDF regularly.' },
  { title: 'Limitation of Liability', body: 'To the maximum extent permitted by law, the Service is provided "as is" without warranties of any kind. We are not liable for indirect, incidental, or consequential damages, including job-application outcomes. ATS scores and AI feedback are heuristic aids, not guarantees of hiring success or of passing any specific applicant tracking system.' },
  { title: 'Changes to Terms', body: 'We may update these terms from time to time. Material changes will be communicated through the Service. Continued use after changes take effect constitutes acceptance of the updated terms.' },
  { title: 'Contact Information', body: 'For questions about these terms, contact support@smartresumedesigner.app.' },
];

export const PRIVACY_SECTIONS = [
  { title: 'Information We Collect', body: 'We collect information you provide directly and limited data generated through your use of the Service, as described below.' },
  { title: 'Account Information', body: 'When you register, we store your name, email address, and authentication identifiers provided by Firebase Authentication (including Google sign-in profile data such as your name and profile photo when you choose that method).' },
  { title: 'Profile Information', body: 'Information you add to your profile — such as phone, location, professional title, bio, links, skills, and years of experience — is stored to pre-fill your resumes and personalize the Service.' },
  { title: 'Resume Information', body: 'Resume content you create (personal details, summaries, experience, education, projects, and related sections) is stored in our database so you can edit, version, preview, export, and optionally publish it.' },
  { title: 'Uploaded Files', body: 'Profile pictures you upload are stored securely in Firebase Storage. We validate file type and size. Image URLs are associated with your account and shown across the app and on public resumes only as you configure.' },
  { title: 'AI Processing', body: 'When you use AI features, the relevant resume text or job description you submit is sent to Google Gemini for processing. We do not send your credentials. AI providers process data under their own policies; avoid submitting highly sensitive personal data you do not wish to be processed.' },
  { title: 'Firebase Authentication', body: 'Authentication is handled by Firebase Authentication. Session tokens are verified on our backend for protected requests. We do not store your password — credential management is handled by Firebase/Google.' },
  { title: 'Database Storage', body: 'Application data is stored in MongoDB. We apply access controls so that your private resumes are accessible only to your authenticated account, plus any public resume pages you explicitly enable.' },
  { title: 'Cookies and Local Storage', body: 'We use browser local storage for preferences such as your theme choice. Firebase may use cookies or local storage to maintain your login session. We do not use advertising trackers.' },
  { title: 'Analytics', body: 'We may collect basic, aggregated usage statistics (such as page visits and feature usage) to improve the Service. We do not sell personal data to third parties.' },
  { title: 'Data Retention', body: 'We retain your account and resume data while your account is active. Deleted resumes and versions are removed from active storage. Backups may persist for a limited period before expiring.' },
  { title: 'Data Deletion', body: 'You may delete individual resumes and versions at any time, and you may delete your entire account (including all resumes and versions) from Settings. Deletion removes data from active systems; some residual copies may remain in backups temporarily.' },
  { title: 'Third-Party Services', body: 'We rely on Firebase (Google), MongoDB hosting, and Google Gemini. These providers process data as described in their own privacy policies. Public resume links you enable are accessible to anyone with the URL.' },
  { title: 'Security', body: 'We use industry-standard measures including authenticated API access, token verification, input validation, and HTTPS transport. No system is perfectly secure; please use a strong, unique password and keep your devices secure.' },
  { title: 'User Rights', body: 'You may access, correct, export (via PDF and on-screen content), and delete your data through the app at any time. Contact us for additional requests regarding your personal data and we will respond within a reasonable timeframe.' },
  { title: 'Contact Information', body: 'For privacy questions or requests, contact support@smartresumedesigner.app.' },
];

export function legalToText(title, sections) {
  const line = '='.repeat(60);
  const parts = [
    title.toUpperCase(),
    'Smart Resume Designer',
    `Last updated: ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`,
    line,
    '',
    'Note: This document is provided for transparency and is not professional legal advice.',
    '',
  ];
  sections.forEach((s, i) => {
    parts.push(`${i + 1}. ${s.title}`, '-'.repeat(40), s.body, '');
  });
  return parts.join('\n');
}
