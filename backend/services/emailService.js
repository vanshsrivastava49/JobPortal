const transporter = require("../config/email");

const APP_NAME = "Green Jobs";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ─── Base Template ─────────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">${APP_NAME}</h1>
              <p style="margin:6px 0 0;color:#bbf7d0;font-size:13px;">Connecting talent with opportunity</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
              <p style="margin:6px 0 0;color:#94a3b8;font-size:12px;">This is an automated email, please do not reply.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── Reusable UI Blocks ─────────────────────────────────────────────────────
const greeting = (name) =>
  `<p style="margin:0 0 20px;color:#0f172a;font-size:16px;font-weight:600;">Hi ${name},</p>`;

const paragraph = (text) =>
  `<p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">${text}</p>`;

const infoBox = (items) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin:20px 0;">
    <tr><td style="padding:20px;">
      ${items.map(({ label, value }) => `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
          <tr>
            <td style="width:140px;color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:2px;">${label}</td>
          </tr>
          <tr>
            <td style="color:#0f172a;font-size:14px;font-weight:600;">${value}</td>
          </tr>
        </table>
      `).join("")}
    </td></tr>
  </table>
`;

const ctaButton = (text, url, color = "#16a34a") => `
  <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background:${color};border-radius:8px;">
        <a href="${url}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">${text}</a>
      </td>
    </tr>
  </table>
`;

const statusBadge = (text, type) => {
  const colors = {
    pending:  { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
    success:  { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
    danger:   { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
    info:     { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
  };
  const c = colors[type] || colors.info;
  return `<span style="display:inline-flex;align-items:center;gap:6px;background:${c.bg};color:${c.text};padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;">
    <span style="width:8px;height:8px;background:${c.dot};border-radius:50%;display:inline-block;"></span>
    ${text}
  </span>`;
};

const divider = () => `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">`;

const signOff = () => `
  ${divider()}
  <p style="margin:0;color:#94a3b8;font-size:13px;">Warm regards,<br><strong style="color:#475569;">The ${APP_NAME} Team</strong></p>
`;


// ════════════════════════════════════════════════════════════
//   BUSINESS OWNER EMAILS
// ════════════════════════════════════════════════════════════

const sendBusinessPendingEmail = async (email, name, businessName) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`Thank you for registering <strong>${businessName}</strong> on ${APP_NAME}. Your application has been received and is now under review by our admin team.`)}
    <div style="margin:20px 0;">${statusBadge("Application Under Review", "pending")}</div>
    ${infoBox([
      { label: "Business Name", value: businessName },
      { label: "Status", value: "Pending Admin Approval" },
      { label: "Estimated Review Time", value: "24–48 hours" },
    ])}
    ${paragraph("Our team carefully reviews each business application to ensure quality and trust across the platform. We'll notify you as soon as a decision has been made.")}
    ${paragraph("In the meantime, feel free to complete your profile and explore the platform.")}
    ${ctaButton("Visit Dashboard", `${FRONTEND_URL}/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `📋 Application Received — ${businessName} is Under Review`,
    html,
  });
};

const sendBusinessApprovedEmail = async (email, name, businessName) => {
  const html = baseTemplate(`
    ${greeting(name)}
    <p style="margin:0 0 20px;color:#0f172a;font-size:22px;font-weight:700;">🎉 Congratulations! Your business is now live.</p>
    ${paragraph(`We're thrilled to inform you that <strong>${businessName}</strong> has been approved and is now publicly listed on ${APP_NAME}.`)}
    <div style="margin:20px 0;">${statusBadge("Approved & Live", "success")}</div>
    ${infoBox([
      { label: "Business Name", value: businessName },
      { label: "Status", value: "Approved ✓" },
      { label: "Next Step", value: "Start approving recruiters and job postings" },
    ])}
    ${paragraph("Here's what you can do next:")}
    <ul style="margin:0 0 20px;padding-left:20px;color:#475569;font-size:15px;line-height:2;">
      <li>Review and approve recruiter link requests</li>
      <li>Manage job postings submitted by your recruiters</li>
      <li>Update your business profile and images</li>
    </ul>
    ${ctaButton("Go to Dashboard", `${FRONTEND_URL}/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ ${businessName} is Approved & Live on ${APP_NAME}!`,
    html,
  });
};

const sendBusinessReApprovedEmail = async (email, name, businessName, jobsRestored = 0) => {
  const html = baseTemplate(`
    ${greeting(name)}
    <p style="margin:0 0 20px;color:#0f172a;font-size:22px;font-weight:700;">🎉 Welcome back! Your business is live again.</p>
    ${paragraph(`Great news — <strong>${businessName}</strong> has been reviewed by our admin team and is now re-approved.`)}
    <div style="margin:20px 0;">${statusBadge("Re-Approved & Live", "success")}</div>
    ${infoBox([
      { label: "Business Name", value: businessName },
      { label: "Status", value: "Approved ✓" },
      ...(jobsRestored > 0 ? [{ label: "Jobs Restored", value: `${jobsRestored} job(s) resubmitted for review` }] : []),
      { label: "Next Step", value: "Review pending recruiters and job postings" },
    ])}
    ${jobsRestored > 0
      ? paragraph(`<strong>${jobsRestored} previously paused job listing(s)</strong> have been automatically resubmitted for your review.`)
      : paragraph("Your business profile is live and ready.")}
    ${ctaButton("Go to Dashboard", `${FRONTEND_URL}/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ ${businessName} is Back Live on ${APP_NAME}!`,
    html,
  });
};

const sendBusinessRejectedEmail = async (email, name, businessName, reason) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`We regret to inform you that your application for <strong>${businessName}</strong> has not been approved at this time.`)}
    <div style="margin:20px 0;">${statusBadge("Application Not Approved", "danger")}</div>
    ${reason ? infoBox([{ label: "Reason", value: reason }]) : ""}
    ${paragraph("Don't be discouraged — you're welcome to review the requirements and re-apply with updated information.")}
    ${ctaButton("Update & Re-apply", `${FRONTEND_URL}/complete-profile`, "#dc2626")}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `❌ Business Application Update — ${businessName}`,
    html,
  });
};

const sendBusinessRevokedEmail = async (email, name, businessName) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`We're writing to let you know that the verified status of <strong>${businessName}</strong> has been revoked by our admin team.`)}
    <div style="margin:20px 0;">${statusBadge("Verification Revoked", "danger")}</div>
    ${paragraph("As a result of this action:")}
    <ul style="margin:0 0 20px;padding-left:20px;color:#475569;font-size:15px;line-height:2;">
      <li>Your business listing has been taken offline</li>
      <li>All linked recruiters have been disconnected</li>
      <li>Active job listings have been paused</li>
    </ul>
    ${paragraph("To get back on the platform, please update your business profile and re-submit for admin review.")}
    ${ctaButton("Re-apply for Approval", `${FRONTEND_URL}/complete-profile`, "#f59e0b")}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `⚠️ Important: ${businessName} Verification Revoked`,
    html,
  });
};

const sendBusinessRecruiterRemovedConfirmation = async (businessEmail, businessOwnerName, businessName, recruiterName) => {
  const html = baseTemplate(`
    ${greeting(businessOwnerName)}
    ${paragraph(`This is a confirmation that you have successfully removed <strong>${recruiterName}</strong> from <strong>${businessName}</strong>.`)}
    <div style="margin:20px 0;">${statusBadge("Recruiter Removed", "info")}</div>
    ${infoBox([
      { label: "Removed Recruiter", value: recruiterName },
      { label: "Business",          value: businessName },
      { label: "Action",            value: "Recruiter unlinked & jobs paused" },
    ])}
    ${paragraph("Their active job listings under your business have been paused.")}
    ${ctaButton("Manage Your Recruiters", `${FRONTEND_URL}/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: businessEmail,
    subject: `✅ Recruiter Removed — ${recruiterName} has been unlinked from ${businessName}`,
    html,
  });
};


// ════════════════════════════════════════════════════════════
//   RECRUITER VERIFICATION EMAILS  ← NEW
// ════════════════════════════════════════════════════════════

// 27. Recruiter requests admin verification — confirmation to recruiter
const sendRecruiterVerificationRequestedEmail = async (email, name, companyName) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`Your verification request for <strong>${companyName || "your recruiter profile"}</strong> has been successfully submitted to our admin team.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Verification Pending", "pending")}
    </div>

    ${infoBox([
      { label: "Company",           value: companyName || "—" },
      { label: "Status",            value: "Under Admin Review" },
      { label: "Estimated Response", value: "Within 24 hours" },
    ])}

    ${paragraph("Once approved, you'll be able to post job listings immediately — no per-job approvals required.")}
    ${paragraph("Make sure your profile is fully completed to speed up the review process.")}

    ${ctaButton("View Your Dashboard", `${FRONTEND_URL}/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `⏳ Verification Request Submitted — Awaiting Admin Approval`,
    html,
  });
};

// 28. Admin alert — new recruiter verification request
const sendAdminRecruiterVerificationAlert = async (adminEmail, recruiterName, recruiterEmail, companyName, industry, location) => {
  const html = baseTemplate(`
    ${greeting("Admin")}
    ${paragraph(`A recruiter has submitted their profile for verification on <strong>${APP_NAME}</strong> and is awaiting your review.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Requires Your Approval", "pending")}
    </div>

    ${infoBox([
      { label: "Recruiter Name",  value: recruiterName },
      { label: "Email",           value: recruiterEmail },
      { label: "Company",         value: companyName  || "—" },
      { label: "Industry",        value: industry     || "—" },
      { label: "Location",        value: location     || "—" },
      { label: "Submitted At",    value: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) },
    ])}

    ${paragraph("Once you approve this recruiter, they can post jobs directly without requiring per-job approval.")}

    ${ctaButton("Review in Admin Dashboard", `${FRONTEND_URL}/admin/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `🛡️ New Recruiter Verification Request — ${recruiterName} (${companyName || "N/A"})`,
    html,
  });
};

// 29. Recruiter verified by admin — approved
const sendRecruiterVerifiedEmail = async (email, name, companyName) => {
  const html = baseTemplate(`
    ${greeting(name)}
    <p style="margin:0 0 20px;color:#0f172a;font-size:22px;font-weight:700;">🎉 You're Verified! Start Posting Jobs.</p>

    ${paragraph(`Great news — your recruiter profile for <strong>${companyName || "your company"}</strong> has been verified by our admin team.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Verified ✓", "success")}
    </div>

    ${infoBox([
      { label: "Company",  value: companyName || "—" },
      { label: "Status",   value: "Verified ✓" },
      { label: "Benefit",  value: "Post jobs instantly — no per-job approvals needed" },
    ])}

    ${paragraph("You can now post job listings directly from your dashboard. Every job you post will go <strong>live immediately</strong> without any additional approval steps.")}
    ${paragraph("Welcome to the verified recruiter network! 🚀")}

    ${ctaButton("Post Your First Job", `${FRONTEND_URL}/post-job`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Profile Verified — You Can Now Post Jobs Instantly!`,
    html,
  });
};

// 30. Recruiter verification rejected by admin
const sendRecruiterVerificationRejectedEmail = async (email, name, companyName, reason) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`We've reviewed your verification request for <strong>${companyName || "your recruiter profile"}</strong> and are unable to approve it at this time.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Verification Not Approved", "danger")}
    </div>

    ${reason ? infoBox([{ label: "Reason", value: reason }]) : ""}

    ${paragraph("You're welcome to update your profile with more complete information and resubmit for verification.")}
    ${paragraph("Common reasons for rejection include: incomplete profile details, missing company information, or insufficient description of your recruiting activities.")}

    ${ctaButton("Update Profile & Resubmit", `${FRONTEND_URL}/complete-profile`, "#dc2626")}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `❌ Verification Request Not Approved — Action Required`,
    html,
  });
};


// ════════════════════════════════════════════════════════════
//   RECRUITER ↔ BUSINESS EMAILS  (kept for backward compat)
// ════════════════════════════════════════════════════════════

const sendRecruiterRequestToBusiness = async (
  businessEmail, businessOwnerName, businessName,
  recruiterName, recruiterEmail, recruiterCompany, dashboardUrl
) => {
  const html = baseTemplate(`
    ${greeting(businessOwnerName)}
    ${paragraph(`A recruiter has requested to link with <strong>${businessName}</strong> on ${APP_NAME} and is awaiting your approval.`)}
    <div style="margin:20px 0;">${statusBadge("Action Required", "pending")}</div>
    ${infoBox([
      { label: "Recruiter Name", value: recruiterName },
      { label: "Email",          value: recruiterEmail },
      { label: "Company",        value: recruiterCompany || "—" },
      { label: "Requesting To Join", value: businessName },
    ])}
    ${paragraph("Once approved, this recruiter will be able to post job listings under your business.")}
    ${ctaButton("Review Request in Dashboard", dashboardUrl || `${FRONTEND_URL}/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: businessEmail,
    subject: `🔔 New Recruiter Link Request for ${businessName}`,
    html,
  });
};

const sendRecruiterRequestConfirmation = async (email, name, businessName) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`Your request to link with <strong>${businessName}</strong> has been successfully submitted.`)}
    <div style="margin:20px 0;">${statusBadge("Request Pending", "pending")}</div>
    ${infoBox([
      { label: "Requested Business", value: businessName },
      { label: "Status",             value: "Awaiting Business Owner Approval" },
      { label: "Estimated Response", value: "Within 24 hours" },
    ])}
    ${ctaButton("View Your Dashboard", `${FRONTEND_URL}/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `⏳ Link Request Sent to ${businessName} — Pending Approval`,
    html,
  });
};

const sendRecruiterApprovedEmail = async (email, name, businessName, jobsRestored = 0) => {
  const html = baseTemplate(`
    ${greeting(name)}
    <p style="margin:0 0 20px;color:#0f172a;font-size:22px;font-weight:700;">🎉 You're now linked!</p>
    ${paragraph(`Great news! <strong>${businessName}</strong> has approved your link request.`)}
    <div style="margin:20px 0;">${statusBadge("Approved & Linked", "success")}</div>
    ${infoBox([
      { label: "Business", value: businessName },
      { label: "Status",   value: "Linked ✓" },
      ...(jobsRestored > 0 ? [{ label: "Jobs Restored", value: `${jobsRestored} previous job(s) resubmitted for review` }] : []),
    ])}
    ${ctaButton("Post Your First Job", `${FRONTEND_URL}/post-job`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Approved! You're Now Linked with ${businessName}`,
    html,
  });
};

const sendRecruiterRejectedEmail = async (email, name, businessName, reason) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`We regret to inform you that <strong>${businessName}</strong> has declined your link request.`)}
    <div style="margin:20px 0;">${statusBadge("Request Declined", "danger")}</div>
    ${reason ? infoBox([{ label: "Reason Provided", value: reason }]) : ""}
    ${ctaButton("Browse Businesses", `${FRONTEND_URL}/dashboard`, "#dc2626")}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `❌ Link Request Declined by ${businessName}`,
    html,
  });
};

const sendRecruiterRemovedEmail = async (email, name, businessName) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`Your link with <strong>${businessName}</strong> has been removed by the business owner.`)}
    <div style="margin:20px 0;">${statusBadge("Unlinked from Business", "danger")}</div>
    ${paragraph("As a result, your active job listings under this business have been paused.")}
    ${ctaButton("Find Another Business", `${FRONTEND_URL}/dashboard`, "#f59e0b")}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `⚠️ You've Been Removed from ${businessName}`,
    html,
  });
};

const sendRecruiterJobsRevokedEmail = async (email, name, businessName, jobCount) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`Due to a change in <strong>${businessName}</strong>'s verification status, your link and job listings have been affected.`)}
    <div style="margin:20px 0;">${statusBadge("Jobs Paused", "danger")}</div>
    ${infoBox([
      { label: "Affected Business", value: businessName },
      { label: "Jobs Paused",       value: `${jobCount} listing(s)` },
      { label: "Your Status",       value: "Unlinked — Re-linking required" },
    ])}
    ${ctaButton("Go to Dashboard", `${FRONTEND_URL}/dashboard`, "#f59e0b")}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `⚠️ Your Job Listings Have Been Paused — Action Required`,
    html,
  });
};


// ════════════════════════════════════════════════════════════
//   JOB POSTING EMAILS
// ════════════════════════════════════════════════════════════

// Job posted by verified recruiter → goes live instantly (notify admin only)
const sendJobPostedDirectlyEmail = async (adminEmail, jobTitle, recruiterName, recruiterEmail, companyName, location, jobType) => {
  const html = baseTemplate(`
    ${greeting("Admin")}
    ${paragraph(`A verified recruiter has posted a new job listing that is now <strong>live on ${APP_NAME}</strong>.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Now Live on Platform", "success")}
    </div>

    ${infoBox([
      { label: "Job Title",     value: jobTitle },
      { label: "Recruiter",     value: recruiterName },
      { label: "Email",         value: recruiterEmail },
      { label: "Company",       value: companyName || "—" },
      { label: "Location",      value: location },
      { label: "Job Type",      value: jobType },
      { label: "Posted At",     value: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) },
    ])}

    ${paragraph("This job went live immediately because the recruiter is verified. No action required unless you need to moderate this listing.")}

    ${ctaButton("View in Admin Dashboard", `${FRONTEND_URL}/admin/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `✅ Job Posted — "${jobTitle}" by ${recruiterName}`,
    html,
  });
};

const sendJobSubmittedToBusiness = async (
  businessEmail, businessOwnerName, businessName,
  jobTitle, recruiterName, location, jobType
) => {
  const html = baseTemplate(`
    ${greeting(businessOwnerName)}
    ${paragraph(`A new job listing has been submitted by one of your recruiters and is awaiting your approval to go live on ${APP_NAME}.`)}
    <div style="margin:20px 0;">${statusBadge("Pending Your Approval", "pending")}</div>
    ${infoBox([
      { label: "Job Title",    value: jobTitle },
      { label: "Submitted By", value: recruiterName },
      { label: "Location",     value: location },
      { label: "Job Type",     value: jobType },
      { label: "Business",     value: businessName },
    ])}
    ${ctaButton("Review Job Listing", `${FRONTEND_URL}/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: businessEmail,
    subject: `📝 New Job Listing Needs Your Approval — "${jobTitle}"`,
    html,
  });
};

const sendJobSubmittedConfirmation = async (email, name, jobTitle, businessName) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`Your job listing <strong>"${jobTitle}"</strong> has been successfully submitted to <strong>${businessName}</strong> for review.`)}
    <div style="margin:20px 0;">${statusBadge("Pending Business Approval", "pending")}</div>
    ${infoBox([
      { label: "Job Title",    value: jobTitle },
      { label: "Submitted To", value: businessName },
      { label: "Status",       value: "Under Review" },
      { label: "Expected Review", value: "Within 24 hours" },
    ])}
    ${ctaButton("View My Jobs", `${FRONTEND_URL}/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `📤 Job Submitted for Review — "${jobTitle}"`,
    html,
  });
};

const sendJobApprovedEmail = async (email, name, jobTitle, businessName) => {
  const html = baseTemplate(`
    ${greeting(name)}
    <p style="margin:0 0 20px;color:#0f172a;font-size:22px;font-weight:700;">🎉 Your job is now live!</p>
    ${paragraph(`<strong>${businessName}</strong> has approved your job listing. It's now publicly visible on ${APP_NAME}.`)}
    <div style="margin:20px 0;">${statusBadge("Live & Active", "success")}</div>
    ${infoBox([
      { label: "Job Title",   value: jobTitle },
      { label: "Approved By", value: businessName },
      { label: "Status",      value: "Live ✓" },
    ])}
    ${ctaButton("Manage Job Listings", `${FRONTEND_URL}/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Job Approved & Live — "${jobTitle}"`,
    html,
  });
};

const sendJobRejectedEmail = async (email, name, jobTitle, businessName, reason) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`Your job listing <strong>"${jobTitle}"</strong> has been reviewed by <strong>${businessName}</strong> and was not approved.`)}
    <div style="margin:20px 0;">${statusBadge("Listing Rejected", "danger")}</div>
    ${infoBox([
      { label: "Job Title",   value: jobTitle },
      { label: "Reviewed By", value: businessName },
      { label: "Status",      value: "Rejected" },
      ...(reason ? [{ label: "Reason", value: reason }] : []),
    ])}
    ${ctaButton("Edit & Resubmit", `${FRONTEND_URL}/dashboard`, "#dc2626")}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `❌ Job Listing Not Approved — "${jobTitle}"`,
    html,
  });
};

const sendRestoredJobsNotification = async (
  businessEmail, businessOwnerName, businessName, recruiterName, jobCount
) => {
  const html = baseTemplate(`
    ${greeting(businessOwnerName)}
    ${paragraph(`<strong>${recruiterName}</strong> has re-linked with <strong>${businessName}</strong>. Their previously revoked job listings have been automatically restored and are now pending your re-approval.`)}
    <div style="margin:20px 0;">${statusBadge("Jobs Awaiting Re-approval", "pending")}</div>
    ${infoBox([
      { label: "Recruiter",    value: recruiterName },
      { label: "Jobs Restored", value: `${jobCount} listing(s) need your review` },
      { label: "Business",     value: businessName },
    ])}
    ${ctaButton("Review Restored Jobs", `${FRONTEND_URL}/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: businessEmail,
    subject: `📋 ${jobCount} Restored Job(s) Need Your Review — ${businessName}`,
    html,
  });
};

const sendAdminNewBusinessAlert = async (adminEmail, businessName, ownerName, ownerEmail, category, address) => {
  const html = baseTemplate(`
    ${greeting("Admin")}
    ${paragraph(`A new business has submitted an application for listing on <strong>${APP_NAME}</strong> and is awaiting your review.`)}
    <div style="margin:20px 0;">${statusBadge("Requires Your Approval", "pending")}</div>
    ${infoBox([
      { label: "Business Name", value: businessName },
      { label: "Owner Name",    value: ownerName },
      { label: "Owner Email",   value: ownerEmail },
      { label: "Category",      value: category || "—" },
      { label: "Address",       value: address  || "—" },
      { label: "Submitted At",  value: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) },
    ])}
    ${ctaButton("Review in Admin Dashboard", `${FRONTEND_URL}/admin/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `🏢 New Business Application — "${businessName}" Needs Review`,
    html,
  });
};

const sendAdminJobLiveAlert = async (adminEmail, jobTitle, businessName, recruiterName, location, jobType) => {
  const html = baseTemplate(`
    ${greeting("Admin")}
    ${paragraph(`A new job listing has been approved by <strong>${businessName}</strong> and is now publicly live on <strong>${APP_NAME}</strong>.`)}
    <div style="margin:20px 0;">${statusBadge("Now Live on Platform", "success")}</div>
    ${infoBox([
      { label: "Job Title",    value: jobTitle },
      { label: "Business",     value: businessName },
      { label: "Posted By",    value: recruiterName },
      { label: "Location",     value: location },
      { label: "Job Type",     value: jobType },
      { label: "Went Live At", value: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) },
    ])}
    ${ctaButton("View in Admin Dashboard", `${FRONTEND_URL}/admin/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `✅ Job Now Live — "${jobTitle}" by ${businessName}`,
    html,
  });
};


// ════════════════════════════════════════════════════════════
//   APPLICATION WORKFLOW EMAILS
// ════════════════════════════════════════════════════════════

const sendApplicationConfirmation = async (email, applicantName, jobTitle, companyName) => {
  const html = baseTemplate(`
    ${greeting(applicantName)}
    ${paragraph(`Your application has been successfully submitted. The recruiter will review it and get back to you soon.`)}
    <div style="margin:20px 0;">${statusBadge("Application Received", "info")}</div>
    ${infoBox([
      { label: "Role Applied For", value: jobTitle },
      { label: "Company",          value: companyName },
      { label: "Status",           value: "Under Review" },
      { label: "Submitted At",     value: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) },
    ])}
    ${paragraph("Good luck! 🤞")}
    ${ctaButton("Track My Applications", `${FRONTEND_URL}/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Application Received — ${jobTitle} at ${companyName}`,
    html,
  });
};

const sendNewApplicationAlert = async (email, recruiterName, jobTitle, applicantName, applicantEmail) => {
  const html = baseTemplate(`
    ${greeting(recruiterName)}
    ${paragraph(`You have received a new application for one of your active job listings.`)}
    <div style="margin:20px 0;">${statusBadge("New Application", "info")}</div>
    ${infoBox([
      { label: "Applicant Name",  value: applicantName },
      { label: "Applicant Email", value: applicantEmail },
      { label: "Applied For",     value: jobTitle },
      { label: "Received At",     value: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) },
    ])}
    ${ctaButton("Review Application", `${FRONTEND_URL}/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `📥 New Application — ${jobTitle}`,
    html,
  });
};

const sendShortlistEmail = async (email, applicantName, jobTitle, companyName, firstRoundName, note) => {
  const html = baseTemplate(`
    ${greeting(applicantName)}
    <p style="margin:0 0 20px;color:#0f172a;font-size:22px;font-weight:700;">🎉 You've been shortlisted!</p>
    ${paragraph(`Exciting news — you have been <strong>shortlisted</strong> for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.`)}
    <div style="margin:20px 0;">${statusBadge("Shortlisted ✓", "success")}</div>
    ${infoBox([
      { label: "Role",    value: jobTitle },
      { label: "Company", value: companyName },
      { label: "Status",  value: "Shortlisted" },
      ...(firstRoundName ? [{ label: "First Round", value: firstRoundName }] : []),
    ])}
    ${note ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border:1px solid #fde047;border-radius:8px;margin:20px 0;"><tr><td style="padding:16px 20px;"><p style="margin:0 0 6px;color:#92400e;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Message from Recruiter</p><p style="margin:0;color:#78350f;font-size:14px;line-height:1.6;">${note}</p></td></tr></table>` : ""}
    ${ctaButton("Track My Application", `${FRONTEND_URL}/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🎉 You've Been Shortlisted! — ${jobTitle} at ${companyName}`,
    html,
  });
};

const sendRoundPassedEmail = async (email, applicantName, jobTitle, companyName, passedRound, nextRound, nextRoundNumber, note) => {
  const html = baseTemplate(`
    ${greeting(applicantName)}
    <p style="margin:0 0 20px;color:#0f172a;font-size:22px;font-weight:700;">✅ Round Cleared — Keep Going!</p>
    ${paragraph(`Well done! You have successfully cleared a round in the hiring process for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.`)}
    ${infoBox([
      { label: "Round Cleared", value: `${passedRound} ✓` },
      { label: "Next Round",    value: `Round ${nextRoundNumber}: ${nextRound}` },
      { label: "Status",        value: "Advancing" },
    ])}
    ${note ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border:1px solid #fde047;border-radius:8px;margin:20px 0;"><tr><td style="padding:16px 20px;"><p style="margin:0 0 6px;color:#92400e;font-size:12px;font-weight:700;">Message from Recruiter</p><p style="margin:0;color:#78350f;font-size:14px;line-height:1.6;">${note}</p></td></tr></table>` : ""}
    ${ctaButton("View Application Status", `${FRONTEND_URL}/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Round Passed — Moving to Round ${nextRoundNumber} | ${jobTitle}`,
    html,
  });
};

const sendRoundRejectedEmail = async (email, applicantName, jobTitle, companyName, roundName, note) => {
  const html = baseTemplate(`
    ${greeting(applicantName)}
    ${paragraph(`Thank you for your time and effort during the hiring process for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.`)}
    <div style="margin:20px 0;">${statusBadge("Not Selected at This Stage", "danger")}</div>
    ${infoBox([
      { label: "Role",     value: jobTitle },
      { label: "Company",  value: companyName },
      { label: "Stage",    value: roundName },
      { label: "Decision", value: "Not selected to proceed further" },
    ])}
    ${note ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin:20px 0;"><tr><td style="padding:16px 20px;"><p style="margin:0 0 6px;color:#64748b;font-size:12px;font-weight:700;">Feedback from Recruiter</p><p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">${note}</p></td></tr></table>` : ""}
    ${ctaButton("Browse More Jobs", `${FRONTEND_URL}/jobs`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Update on Your Application — ${jobTitle} at ${companyName}`,
    html,
  });
};

const sendRejectionEmail = async (email, applicantName, jobTitle, companyName, reason) => {
  const html = baseTemplate(`
    ${greeting(applicantName)}
    ${paragraph(`Thank you for your interest in the <strong>${jobTitle}</strong> role at <strong>${companyName}</strong>.`)}
    <div style="margin:20px 0;">${statusBadge("Application Not Selected", "danger")}</div>
    ${infoBox([
      { label: "Role",    value: jobTitle },
      { label: "Company", value: companyName },
      { label: "Status",  value: "Not Selected" },
      ...(reason ? [{ label: "Reason", value: reason }] : []),
    ])}
    ${paragraph("Don't be discouraged — keep exploring other opportunities on our platform. 🌟")}
    ${ctaButton("Browse More Jobs", `${FRONTEND_URL}/jobs`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Update on Your Application — ${jobTitle} at ${companyName}`,
    html,
  });
};

const sendHiredEmail = async (email, applicantName, jobTitle, companyName, note) => {
  const html = baseTemplate(`
    ${greeting(applicantName)}
    <p style="margin:0 0 20px;color:#0f172a;font-size:22px;font-weight:700;">🎊 Congratulations — You've Been Selected!</p>
    ${paragraph(`We are absolutely thrilled to inform you that you have been <strong>selected</strong> for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>!`)}
    <div style="margin:20px 0;">${statusBadge("Offer Extended 🏆", "success")}</div>
    ${infoBox([
      { label: "Role",    value: jobTitle },
      { label: "Company", value: companyName },
      { label: "Status",  value: "Offer Extended ✓" },
    ])}
    ${note ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border:1px solid #fde047;border-radius:8px;margin:20px 0;"><tr><td style="padding:16px 20px;"><p style="margin:0 0 6px;color:#92400e;font-size:12px;font-weight:700;">Message from the Team</p><p style="margin:0;color:#78350f;font-size:14px;line-height:1.6;">${note}</p></td></tr></table>` : ""}
    ${ctaButton("View Application Details", `${FRONTEND_URL}/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🎊 Offer Extended — ${jobTitle} at ${companyName}!`,
    html,
  });
};

const sendApplicationWithdrawnNotice = async (email, recruiterName, jobTitle, applicantName) => {
  const html = baseTemplate(`
    ${greeting(recruiterName)}
    ${paragraph(`An applicant has withdrawn their application for <strong>${jobTitle}</strong>.`)}
    <div style="margin:20px 0;">${statusBadge("Application Withdrawn", "info")}</div>
    ${infoBox([
      { label: "Applicant",    value: applicantName },
      { label: "Role",         value: jobTitle },
      { label: "Withdrawn At", value: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) },
    ])}
    ${ctaButton("View All Applications", `${FRONTEND_URL}/dashboard`)}
    ${signOff()}
  `);
  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Application Withdrawn — ${jobTitle}`,
    html,
  });
};


// ════════════════════════════════════════════════════════════
//   EXPORTS
// ════════════════════════════════════════════════════════════
module.exports = {
  // Business
  sendBusinessPendingEmail,
  sendBusinessApprovedEmail,
  sendBusinessReApprovedEmail,
  sendBusinessRejectedEmail,
  sendBusinessRevokedEmail,
  sendBusinessRecruiterRemovedConfirmation,

  // Recruiter verification ← NEW
  sendRecruiterVerificationRequestedEmail,
  sendAdminRecruiterVerificationAlert,
  sendRecruiterVerifiedEmail,
  sendRecruiterVerificationRejectedEmail,

  // Recruiter ↔ Business (kept for backward compat)
  sendRecruiterRequestToBusiness,
  sendRecruiterRequestConfirmation,
  sendRecruiterApprovedEmail,
  sendRecruiterRejectedEmail,
  sendRecruiterRemovedEmail,
  sendRecruiterJobsRevokedEmail,

  // Jobs
  sendJobPostedDirectlyEmail,       // ← NEW
  sendJobSubmittedToBusiness,
  sendJobSubmittedConfirmation,
  sendJobApprovedEmail,
  sendJobRejectedEmail,
  sendRestoredJobsNotification,
  sendAdminNewBusinessAlert,
  sendAdminJobLiveAlert,

  // Applications
  sendApplicationConfirmation,
  sendNewApplicationAlert,
  sendShortlistEmail,
  sendRoundPassedEmail,
  sendRoundRejectedEmail,
  sendRejectionEmail,
  sendHiredEmail,
  sendApplicationWithdrawnNotice,
};