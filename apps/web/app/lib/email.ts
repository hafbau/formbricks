import { getQuestionResponseMapping } from "@/app/lib/responses/questionResponseMapping";
import {
  MAIL_FROM,
  SMTP_HOST,
  SMTP_PASSWORD,
  SMTP_PORT,
  SMTP_SECURE_ENABLED,
  SMTP_USER,
  WEBAPP_URL,
} from "@fastform/lib/constants";
import { createInviteToken, createToken, createTokenForLinkForm } from "@fastform/lib/jwt";
import { TFormQuestion } from "@fastform/types/forms";
import { TResponse } from "@fastform/types/responses";
import { withEmailTemplate } from "./email-template";

const nodemailer = require("nodemailer");

interface sendEmailData {
  to: string;
  replyTo?: string;
  subject: string;
  text?: string;
  html: string;
}

export const sendEmail = async (emailData: sendEmailData) => {
  let transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE_ENABLED, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
    // logger: true,
    // debug: true,
  });
  const emailDefaults = {
    from: `Fastform <${MAIL_FROM || "noreply@fastform.com"}>`,
  };
  await transporter.sendMail({ ...emailDefaults, ...emailData });
};

export const sendVerificationEmail = async (user) => {
  const token = createToken(user.id, user.email, {
    expiresIn: "1d",
  });
  const verifyLink = `${WEBAPP_URL}/auth/verify?token=${encodeURIComponent(token)}`;
  const verificationRequestLink = `${WEBAPP_URL}/auth/verification-requested?email=${encodeURIComponent(
    user.email
  )}`;
  await sendEmail({
    to: user.email,
    subject: "Welcome to Fastform 🤍",
    html: withEmailTemplate(`<h1>Welcome!</h1>
    To start using Fastform please verify your email by clicking the button below:<br/><br/>
    <a class="button" href="${verifyLink}">Confirm email</a><br/>
    <br/>
    <strong>The link is valid for 24h.</strong><br/><br/>If it has expired please request a new token here:
    <a href="${verificationRequestLink}">Request new verification</a><br/>
    <br/>
    Your Fastform Team`),
  });
};

export const sendLinkFormToVerifiedEmail = async (data) => {
  const formId = data.formId;
  const email = data.email;
  const formData = data.formData;
  const token = createTokenForLinkForm(formId, email);
  const formLink = `${WEBAPP_URL}/s/${formId}?verify=${encodeURIComponent(token)}`;
  await sendEmail({
    to: data.email,
    subject: "Your Fastform Form",
    html: withEmailTemplate(`<h1>Hey 👋</h1>
    Thanks for validating your email. Here is your Form.<br/><br/>
    <strong>${formData.name}</strong>
    <p>${formData.subheading}</p>
    <a class="button" href="${formLink}">Take form</a><br/>
    <br/>
    All the best,<br/>
    Your Fastform Team 🤍`),
  });
};

export const sendForgotPasswordEmail = async (user) => {
  const token = createToken(user.id, user.email, {
    expiresIn: "1d",
  });
  const verifyLink = `${WEBAPP_URL}/auth/forgot-password/reset?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to: user.email,
    subject: "Reset your Fastform password",
    html: withEmailTemplate(`<h1>Change password</h1>
    You have requested a link to change your password. You can do this by clicking the link below:<br/><br/>
    <a class="button" href="${verifyLink}">Change password</a><br/>
    <br/>
    <strong>The link is valid for 24 hours.</strong><br/><br/>If you didn't request this, please ignore this email.<br/>
    Your Fastform Team`),
  });
};

export const sendPasswordResetNotifyEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: "Your Fastform password has been changed",
    html: withEmailTemplate(`<h1>Password changed</h1>
    Your password has been changed successfully.<br/>
    <br/>
    Your Fastform Team`),
  });
};

export const sendInviteMemberEmail = async (inviteId, inviterName, inviteeName, email) => {
  const token = createInviteToken(inviteId, email, {
    expiresIn: "7d",
  });
  const verifyLink = `${WEBAPP_URL}/invite?token=${encodeURIComponent(token)}`;

  await sendEmail({
    to: email,
    subject: `You're invited to collaborate on Fastform!`,
    html: withEmailTemplate(`Hey ${inviteeName},<br/><br/>
    Your colleague ${inviterName} invited you to join them at Fastform. To accept the invitation, please click the link below:<br/><br/>
    <a class="button" href="${verifyLink}">Join team</a><br/>
    <br/>
    Have a great day!<br/>
    The Fastform Team!`),
  });
};

export const sendInviteAcceptedEmail = async (inviterName, inviteeName, email) => {
  await sendEmail({
    to: email,
    subject: `You've got a new team member!`,
    html: withEmailTemplate(`Hey ${inviterName},
    <br/><br/>
    Just letting you know that ${inviteeName} accepted your invitation. Have fun collaborating!
    <br/><br/>
    Have a great day!<br/>
    The Fastform Team!`),
  });
};

export const sendResponseFinishedEmail = async (
  email: string,
  environmentId: string,
  form: { id: string; name: string; questions: TFormQuestion[] },
  response: TResponse
) => {
  const personEmail = response.person?.attributes["email"];
  await sendEmail({
    to: email,
    subject: personEmail
      ? `${personEmail} just completed your ${form.name} form ✅`
      : `A response for ${form.name} was completed ✅`,
    replyTo: personEmail?.toString() || MAIL_FROM,
    html: withEmailTemplate(`<h1>Hey 👋</h1>Someone just completed your form <strong>${
      form.name
    }</strong><br/>

    <hr/> 

    ${getQuestionResponseMapping(form, response)
      .map(
        (question) =>
          question.answer &&
          `<div style="margin-top:1em;">
          <p style="margin:0px;">${question.question}</p>
          <p style="font-weight: 500; margin:0px; white-space:pre-wrap">${question.answer}</p>  
        </div>`
      )
      .join("")} 
   
   
    <a class="button" href="${WEBAPP_URL}/environments/${environmentId}/forms/${
      form.id
    }/responses?utm_source=emailnotification&utm_medium=email&utm_content=ViewResponsesCTA">View all responses</a>

    <div class="tooltip">
    <p class='brandcolor'><strong>Start a conversation 💡</strong></p>
    ${
      personEmail
        ? `<p>Hit 'Reply' or reach out manually: ${personEmail}</p>`
        : "<p>If you set the email address as an attribute in in-app forms, you can reply directly to the respondent.</p>"
    }
    </div>
    `),
  });
};
