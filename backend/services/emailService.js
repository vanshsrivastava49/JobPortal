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

// 1. Business applied → pending approval
const sendBusinessPendingEmail = async (email, name, businessName) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`Thank you for registering <strong>${businessName}</strong> on ${APP_NAME}. Your application has been received and is now under review by our admin team.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Application Under Review", "pending")}
    </div>

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

// 2. Business approved by admin (first time)
const sendBusinessApprovedEmail = async (email, name, businessName) => {
  const html = baseTemplate(`
    ${greeting(name)}
    <p style="margin:0 0 20px;color:#0f172a;font-size:22px;font-weight:700;">🎉 Congratulations! Your business is now live.</p>

    ${paragraph(`We're thrilled to inform you that <strong>${businessName}</strong> has been approved and is now publicly listed on ${APP_NAME}.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Approved & Live", "success")}
    </div>

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

// 2b. Business RE-approved by admin (after a revocation)
const sendBusinessReApprovedEmail = async (email, name, businessName, jobsRestored = 0) => {
  const html = baseTemplate(`
    ${greeting(name)}
    <p style="margin:0 0 20px;color:#0f172a;font-size:22px;font-weight:700;">🎉 Welcome back! Your business is live again.</p>

    ${paragraph(`Great news — <strong>${businessName}</strong> has been reviewed by our admin team and is now re-approved. Your listing is publicly visible again on ${APP_NAME}.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Re-Approved & Live", "success")}
    </div>

    ${infoBox([
      { label: "Business Name", value: businessName },
      { label: "Status", value: "Approved ✓" },
      ...(jobsRestored > 0
        ? [{ label: "Jobs Restored", value: `${jobsRestored} job(s) resubmitted for review` }]
        : []
      ),
      { label: "Next Step", value: "Review pending recruiters and job postings" },
    ])}

    ${jobsRestored > 0
      ? paragraph(`<strong>${jobsRestored} previously paused job listing(s)</strong> have been automatically resubmitted for your review. Please approve or reject them from your dashboard before they go live.`)
      : paragraph("Your business profile is live and ready. Recruiters can now request to link with your business and start posting jobs.")
    }

    ${paragraph("If you have any questions about why your business was previously revoked, please reach out to our support team.")}

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

// 3. Business rejected by admin
const sendBusinessRejectedEmail = async (email, name, businessName, reason) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`We regret to inform you that your application for <strong>${businessName}</strong> has not been approved at this time.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Application Not Approved", "danger")}
    </div>

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

// 4. Business revoked by admin
const sendBusinessRevokedEmail = async (email, name, businessName) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`We're writing to let you know that the verified status of <strong>${businessName}</strong> has been revoked by our admin team.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Verification Revoked", "danger")}
    </div>

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


// ════════════════════════════════════════════════════════════
//   RECRUITER ↔ BUSINESS EMAILS
// ════════════════════════════════════════════════════════════

// 5. Recruiter sends link request → notify business owner
const sendRecruiterRequestToBusiness = async (
  businessEmail, businessOwnerName, businessName,
  recruiterName, recruiterEmail, recruiterCompany, dashboardUrl
) => {
  const html = baseTemplate(`
    ${greeting(businessOwnerName)}
    ${paragraph(`A recruiter has requested to link with <strong>${businessName}</strong> on ${APP_NAME} and is awaiting your approval.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Action Required", "pending")}
    </div>

    ${infoBox([
      { label: "Recruiter Name", value: recruiterName },
      { label: "Email", value: recruiterEmail },
      { label: "Company", value: recruiterCompany || "—" },
      { label: "Requesting To Join", value: businessName },
    ])}

    ${paragraph("Once approved, this recruiter will be able to post job listings under your business — which you'll review before they go live.")}

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

// 6. Recruiter sends link request → confirmation to recruiter
const sendRecruiterRequestConfirmation = async (email, name, businessName) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`Your request to link with <strong>${businessName}</strong> has been successfully submitted.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Request Pending", "pending")}
    </div>

    ${infoBox([
      { label: "Requested Business", value: businessName },
      { label: "Status", value: "Awaiting Business Owner Approval" },
      { label: "Estimated Response", value: "Within 24 hours" },
    ])}

    ${paragraph("You'll receive an email as soon as the business owner reviews your request. In the meantime, make sure your recruiter profile is fully completed.")}

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

// 7. Recruiter approved by business owner
const sendRecruiterApprovedEmail = async (email, name, businessName, jobsRestored = 0) => {
  const html = baseTemplate(`
    ${greeting(name)}
    <p style="margin:0 0 20px;color:#0f172a;font-size:22px;font-weight:700;">🎉 You're now linked!</p>

    ${paragraph(`Great news! <strong>${businessName}</strong> has approved your link request. You can now post job listings under this business.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Approved & Linked", "success")}
    </div>

    ${infoBox([
      { label: "Business", value: businessName },
      { label: "Status", value: "Linked ✓" },
      ...(jobsRestored > 0 ? [{ label: "Jobs Restored", value: `${jobsRestored} previous job(s) resubmitted for review` }] : []),
    ])}

    ${jobsRestored > 0
      ? paragraph(`Your <strong>${jobsRestored} previously revoked job listing(s)</strong> have been automatically resubmitted to ${businessName} for re-approval. You'll be notified once they're reviewed.`)
      : paragraph("You can now start posting job listings from your dashboard. Each listing will go to the business owner for review before going live.")
    }

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

// 8. Recruiter rejected by business owner
const sendRecruiterRejectedEmail = async (email, name, businessName, reason) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`We regret to inform you that <strong>${businessName}</strong> has declined your link request.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Request Declined", "danger")}
    </div>

    ${reason ? infoBox([{ label: "Reason Provided", value: reason }]) : ""}

    ${paragraph("You can explore other approved businesses on the platform and send a new request.")}

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

// 9. Recruiter removed by business owner
const sendRecruiterRemovedEmail = async (email, name, businessName) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`Your link with <strong>${businessName}</strong> has been removed by the business owner.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Unlinked from Business", "danger")}
    </div>

    ${paragraph("As a result, your active job listings under this business have been paused. You can request access to another approved business to continue posting jobs.")}

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

// 10. Recruiter's job revoked (because business was revoked)
const sendRecruiterJobsRevokedEmail = async (email, name, businessName, jobCount) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`Due to a change in <strong>${businessName}</strong>'s verification status, your link and job listings have been affected.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Jobs Paused", "danger")}
    </div>

    ${infoBox([
      { label: "Affected Business", value: businessName },
      { label: "Jobs Paused", value: `${jobCount} listing(s)` },
      { label: "Your Status", value: "Unlinked — Re-linking required" },
    ])}

    ${paragraph("Once the business is re-approved and you re-link with them, your job listings will be automatically restored for review.")}

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

// 11. Job submitted by recruiter → notify business owner
const sendJobSubmittedToBusiness = async (
  businessEmail, businessOwnerName, businessName,
  jobTitle, recruiterName, location, jobType
) => {
  const html = baseTemplate(`
    ${greeting(businessOwnerName)}
    ${paragraph(`A new job listing has been submitted by one of your recruiters and is awaiting your approval to go live on ${APP_NAME}.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Pending Your Approval", "pending")}
    </div>

    ${infoBox([
      { label: "Job Title", value: jobTitle },
      { label: "Submitted By", value: recruiterName },
      { label: "Location", value: location },
      { label: "Job Type", value: jobType },
      { label: "Business", value: businessName },
    ])}

    ${paragraph("Review the full listing and approve or reject it from your dashboard.")}

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

// 12. Job submitted → confirmation to recruiter
const sendJobSubmittedConfirmation = async (email, name, jobTitle, businessName) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`Your job listing <strong>"${jobTitle}"</strong> has been successfully submitted to <strong>${businessName}</strong> for review.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Pending Business Approval", "pending")}
    </div>

    ${infoBox([
      { label: "Job Title", value: jobTitle },
      { label: "Submitted To", value: businessName },
      { label: "Status", value: "Under Review" },
      { label: "Expected Review", value: "Within 24 hours" },
    ])}

    ${paragraph("You'll receive a notification once the business owner approves or rejects this listing.")}

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

// 13. Job approved by business owner → notify recruiter
const sendJobApprovedEmail = async (email, name, jobTitle, businessName) => {
  const html = baseTemplate(`
    ${greeting(name)}
    <p style="margin:0 0 20px;color:#0f172a;font-size:22px;font-weight:700;">🎉 Your job is now live!</p>

    ${paragraph(`<strong>${businessName}</strong> has approved your job listing. It's now publicly visible to thousands of job seekers on ${APP_NAME}.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Live & Active", "success")}
    </div>

    ${infoBox([
      { label: "Job Title", value: jobTitle },
      { label: "Approved By", value: businessName },
      { label: "Status", value: "Live ✓" },
    ])}

    ${paragraph("You can manage this listing — close it, edit it, or track applications — from your dashboard.")}

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

// 14. Job rejected by business owner → notify recruiter
const sendJobRejectedEmail = async (email, name, jobTitle, businessName, reason) => {
  const html = baseTemplate(`
    ${greeting(name)}
    ${paragraph(`Your job listing <strong>"${jobTitle}"</strong> has been reviewed by <strong>${businessName}</strong> and was not approved.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Listing Rejected", "danger")}
    </div>

    ${infoBox([
      { label: "Job Title", value: jobTitle },
      { label: "Reviewed By", value: businessName },
      { label: "Status", value: "Rejected" },
      ...(reason ? [{ label: "Reason", value: reason }] : []),
    ])}

    ${paragraph("You can edit the listing and resubmit it for review, or post a new job listing from your dashboard.")}

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

// 15. Restored jobs pending re-review → notify business owner
const sendRestoredJobsNotification = async (
  businessEmail, businessOwnerName, businessName,
  recruiterName, jobCount
) => {
  const html = baseTemplate(`
    ${greeting(businessOwnerName)}
    ${paragraph(`<strong>${recruiterName}</strong> has re-linked with <strong>${businessName}</strong>. Their previously revoked job listings have been automatically restored and are now pending your re-approval.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Jobs Awaiting Re-approval", "pending")}
    </div>

    ${infoBox([
      { label: "Recruiter", value: recruiterName },
      { label: "Jobs Restored", value: `${jobCount} listing(s) need your review` },
      { label: "Business", value: businessName },
    ])}

    ${paragraph("Please review each listing and approve or reject them before they go live again.")}

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

// 16. Notify admin — new business application received
const sendAdminNewBusinessAlert = async (adminEmail, businessName, ownerName, ownerEmail, category, address) => {
  const html = baseTemplate(`
    ${greeting("Admin")}
    ${paragraph(`A new business has submitted an application for listing on <strong>${APP_NAME}</strong> and is awaiting your review.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Requires Your Approval", "pending")}
    </div>

    ${infoBox([
      { label: "Business Name",  value: businessName },
      { label: "Owner Name",     value: ownerName },
      { label: "Owner Email",    value: ownerEmail },
      { label: "Category",       value: category || "—" },
      { label: "Address",        value: address  || "—" },
      { label: "Submitted At",   value: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) },
    ])}

    ${paragraph("Please log in to the admin dashboard to review the application and either approve or reject it.")}

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

// 17. Notify admin — a job is now live on the platform
const sendAdminJobLiveAlert = async (adminEmail, jobTitle, businessName, recruiterName, location, jobType) => {
  const html = baseTemplate(`
    ${greeting("Admin")}
    ${paragraph(`A new job listing has been approved by <strong>${businessName}</strong> and is now publicly live on <strong>${APP_NAME}</strong>.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Now Live on Platform", "success")}
    </div>

    ${infoBox([
      { label: "Job Title",      value: jobTitle },
      { label: "Business",       value: businessName },
      { label: "Posted By",      value: recruiterName },
      { label: "Location",       value: location },
      { label: "Job Type",       value: jobType },
      { label: "Went Live At",   value: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) },
    ])}

    ${paragraph("This is an automated notification for your records. No action is required unless you need to moderate this listing.")}

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

// 18. Business owner confirmation — they removed a recruiter
const sendBusinessRecruiterRemovedConfirmation = async (businessEmail, businessOwnerName, businessName, recruiterName) => {
  const html = baseTemplate(`
    ${greeting(businessOwnerName)}
    ${paragraph(`This is a confirmation that you have successfully removed <strong>${recruiterName}</strong> from <strong>${businessName}</strong>.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Recruiter Removed", "info")}
    </div>

    ${infoBox([
      { label: "Removed Recruiter", value: recruiterName },
      { label: "Business",          value: businessName },
      { label: "Action",            value: "Recruiter unlinked & jobs paused" },
    ])}

    ${paragraph("Their active job listings under your business have been paused. They will need to request access again if they wish to re-join.")}

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
//   APPLICATION WORKFLOW EMAILS
// ════════════════════════════════════════════════════════════

// 19. Jobseeker — application submitted confirmation
const sendApplicationConfirmation = async (email, applicantName, jobTitle, companyName) => {
  const html = baseTemplate(`
    ${greeting(applicantName)}
    ${paragraph(`Your application has been successfully submitted. The recruiter will review it and get back to you soon.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Application Received", "info")}
    </div>

    ${infoBox([
      { label: "Role Applied For", value: jobTitle },
      { label: "Company",          value: companyName },
      { label: "Status",           value: "Under Review" },
      { label: "Submitted At",     value: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) },
    ])}

    ${paragraph("You can track the live status of your application anytime from your dashboard under <strong>My Applications</strong>.")}
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

// 20. Recruiter — new application alert
const sendNewApplicationAlert = async (email, recruiterName, jobTitle, applicantName, applicantEmail) => {
  const html = baseTemplate(`
    ${greeting(recruiterName)}
    ${paragraph(`You have received a new application for one of your active job listings.`)}

    <div style="margin:20px 0;">
      ${statusBadge("New Application", "info")}
    </div>

    ${infoBox([
      { label: "Applicant Name",  value: applicantName },
      { label: "Applicant Email", value: applicantEmail },
      { label: "Applied For",     value: jobTitle },
      { label: "Received At",     value: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) },
    ])}

    ${paragraph("Log into your dashboard to review their profile, read the cover letter, view their resume, and take action.")}

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

// 21. Jobseeker — shortlisted notification
const sendShortlistEmail = async (email, applicantName, jobTitle, companyName, firstRoundName, note) => {
  const html = baseTemplate(`
    ${greeting(applicantName)}
    <p style="margin:0 0 20px;color:#0f172a;font-size:22px;font-weight:700;">🎉 You've been shortlisted!</p>

    ${paragraph(`Exciting news — you have been <strong>shortlisted</strong> for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Shortlisted ✓", "success")}
    </div>

    ${infoBox([
      { label: "Role",        value: jobTitle },
      { label: "Company",     value: companyName },
      { label: "Status",      value: "Shortlisted" },
      ...(firstRoundName ? [{ label: "First Round", value: firstRoundName }] : []),
    ])}

    ${note ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border:1px solid #fde047;border-radius:8px;margin:20px 0;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px;color:#92400e;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Message from Recruiter</p>
          <p style="margin:0;color:#78350f;font-size:14px;line-height:1.6;">${note}</p>
        </td></tr>
      </table>
    ` : ""}

    ${paragraph("The recruiter will reach out with further details. Keep an eye on your dashboard for real-time round updates.")}
    ${paragraph("Best of luck with the next steps! 💪")}

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

// 22. Jobseeker — round passed, advancing to next round
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

    ${note ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border:1px solid #fde047;border-radius:8px;margin:20px 0;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px;color:#92400e;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Message from Recruiter</p>
          <p style="margin:0;color:#78350f;font-size:14px;line-height:1.6;">${note}</p>
        </td></tr>
      </table>
    ` : ""}

    ${paragraph("Stay prepared and keep up the great work. You're getting closer! 🚀")}

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

// 23. Jobseeker — rejected at a specific round
const sendRoundRejectedEmail = async (email, applicantName, jobTitle, companyName, roundName, note) => {
  const html = baseTemplate(`
    ${greeting(applicantName)}
    ${paragraph(`Thank you for your time and effort during the hiring process for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Not Selected at This Stage", "danger")}
    </div>

    ${infoBox([
      { label: "Role",         value: jobTitle },
      { label: "Company",      value: companyName },
      { label: "Stage",        value: roundName },
      { label: "Decision",     value: "Not selected to proceed further" },
    ])}

    ${note ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin:20px 0;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Feedback from Recruiter</p>
          <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">${note}</p>
        </td></tr>
      </table>
    ` : ""}

    ${paragraph("We encourage you to keep applying — the right opportunity is out there. Every interview is a learning experience!")}

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

// 24. Jobseeker — outright rejection (before or without rounds)
const sendRejectionEmail = async (email, applicantName, jobTitle, companyName, reason) => {
  const html = baseTemplate(`
    ${greeting(applicantName)}
    ${paragraph(`Thank you for your interest in the <strong>${jobTitle}</strong> role at <strong>${companyName}</strong> and for taking the time to apply.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Application Not Selected", "danger")}
    </div>

    ${infoBox([
      { label: "Role",    value: jobTitle },
      { label: "Company", value: companyName },
      { label: "Status",  value: "Not Selected" },
      ...(reason ? [{ label: "Reason", value: reason }] : []),
    ])}

    ${paragraph("After careful consideration, we have decided not to move forward with your application at this time. This was a competitive process and we appreciate your effort.")}
    ${paragraph("Don't be discouraged — keep exploring other opportunities on our platform. We wish you all the best! 🌟")}

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

// 25. Jobseeker — hired / offer extended
const sendHiredEmail = async (email, applicantName, jobTitle, companyName, note) => {
  const html = baseTemplate(`
    ${greeting(applicantName)}
    <p style="margin:0 0 20px;color:#0f172a;font-size:22px;font-weight:700;">🎊 Congratulations — You've Been Selected!</p>

    ${paragraph(`We are absolutely thrilled to inform you that you have been <strong>selected</strong> for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>!`)}

    <div style="margin:20px 0;">
      ${statusBadge("Offer Extended 🏆", "success")}
    </div>

    ${infoBox([
      { label: "Role",    value: jobTitle },
      { label: "Company", value: companyName },
      { label: "Status",  value: "Offer Extended ✓" },
    ])}

    ${note ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border:1px solid #fde047;border-radius:8px;margin:20px 0;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px;color:#92400e;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Message from the Team</p>
          <p style="margin:0;color:#78350f;font-size:14px;line-height:1.6;">${note}</p>
        </td></tr>
      </table>
    ` : ""}

    ${paragraph("The recruiter will be in touch shortly with the formal offer letter and onboarding details. Welcome aboard! 🚀")}

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

// 26. Recruiter — applicant withdrew their application
const sendApplicationWithdrawnNotice = async (email, recruiterName, jobTitle, applicantName) => {
  const html = baseTemplate(`
    ${greeting(recruiterName)}
    ${paragraph(`An applicant has withdrawn their application for <strong>${jobTitle}</strong>.`)}

    <div style="margin:20px 0;">
      ${statusBadge("Application Withdrawn", "info")}
    </div>

    ${infoBox([
      { label: "Applicant",   value: applicantName },
      { label: "Role",        value: jobTitle },
      { label: "Withdrawn At", value: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) },
    ])}

    ${paragraph("No action is required from your end. The application has been automatically marked as withdrawn in your dashboard.")}

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

  // Recruiter ↔ Business
  sendRecruiterRequestToBusiness,
  sendRecruiterRequestConfirmation,
  sendRecruiterApprovedEmail,
  sendRecruiterRejectedEmail,
  sendRecruiterRemovedEmail,
  sendRecruiterJobsRevokedEmail,

  // Jobs
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