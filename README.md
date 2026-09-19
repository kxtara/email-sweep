# 🧹 Email Sweep
> A cloud-native email sanitizer built with Node.js, TypeScript, and Google Cloud Platform.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-v20%2B-green)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)

---

## 📺 Project Demo

[![ESweep Demo Video](https://img.youtube.com/vi/afSwU2n-84I/maxresdefault.jpg)](https://www.youtube.com/watch?v=afSwU2n-84I)

> 🎥 **[Watch the Live Demo Walkthrough on YouTube](https://www.youtube.com/watch?v=afSwU2n-84I)**  
> 
> **Key Walkthrough Highlights:**
> * **Option Selection & Filtering:** Configuring sweep options to target specific promotional categories, stale senders, and high-frequency newsletters.
> * **Batch Execution:** Making the sweep request to safely process and trash target emails via the Gmail REST API.
> * **Storage Reclaimed Metric:** Real-time calculation showing total storage space saved (MB) after cleaning the inbox.

---

## 🚀 Overview
**Email Sweep** is a high-performance web tool designed to help users regain control of overcrowded inboxes. By leveraging the **Gmail REST API**, Email Sweep identifies high-volume senders, newsletters, and stale promotional emails, empowering users to review and batch-trash them in seconds.

### Key Features:
* **OAuth2 Authentication:** Secure sign-in leveraging Google's official identity services.
* **Smart Inbox Scanning:** Detects high-frequency promotional senders and subscriptions.
* **Sensitive Scope Handling:** Safely operates using `gmail.modify` permissions to clean inboxes without permanent data loss.
* **Batch Processing:** Uses batched API requests to clean thousands of emails while staying strictly within Google Cloud rate limits.
* **Access Request System:** Built-in email notification system powered by **Resend** to manage beta access requests seamlessly.

---

## 🏗️ Technical Stack
* **Language & Runtime:** TypeScript, Node.js (v20+)
* **Backend Framework:** Express.js
* **Validation:** Zod schema validation
* **Authentication:** Google OAuth 2.0 (`google-auth-library`)
* **Email Delivery:** Resend API
* **Cloud Hosting:** Render (Web Service)
* **API:** Gmail REST API

---

## 🔒 Security & Compliance Note
This project utilizes Google **Restricted Scopes** (`https://www.googleapis.com/auth/gmail.modify`). 

To comply with Google’s **CASA (Cloud App Security Assessment)** standards while in active development, Email Sweep is currently operating in **Developer Testing Mode**.

* **Public Access:** Restricted by Google OAuth consent guidelines.
* **How to Test:** If you are a recruiter, reviewer, or collaborator wishing to test the live application, submit your email address via the **Request Access** button on the landing page or contact the admin directly to be added to the GCP Authorized Test Users list.

---

## ⚙️ Setup & Installation

1. **Clone the repository:**
   git clone https://github.com/kxtara/email-sweep.git
   cd email-sweep

2. **Install dependencies:**
   npm install

3. **Environment Variables:**
   Create a `.env` file in the `backend` directory:
   PORT=3000
   NODE_ENV=development

   # Google Cloud Credentials
   GCP_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GCP_CLIENT_SECRET=your-client-secret
   GCP_REDIRECT_URI=http://localhost:3000/auth/callback

   # Notification Settings
   EMAIL=admin@Email Sweep.app
   RESEND_API_KEY=re_123456789_abcdefg...

4. **Build and Run:**
   # Development mode with hot reloading
   npm run dev

   # Production build
   npm run build
   npm start

---

## 🛠️ Lessons Learned

* **Pivoting from Raw SMTP to HTTP APIs in Cloud Environments:** Hosted platforms like Render block raw TCP outbound ports (`25`, `465`, `587`) to prevent spam abuse. Attempting to use traditional Nodemailer SMTP transports caused `ETIMEDOUT` crashes in production. Migrating to an HTTP-based transactional mailer (**Resend**) resolved network blocks completely since requests travel over standard HTTPS (`443`).
* **Managing Gmail API Rate Limits & Quotas:** Executing hundreds of individual delete/trash requests triggers `429 Too Many Requests` status codes. Implementing batch request bundling and exponential backoff ensured smooth operation across large inboxes.
* **Handling Strict OAuth Consent Controls:** Navigating Google Cloud's OAuth verification lifecycle required building a custom access request pipeline for unapproved test users, ensuring secure, controlled testing prior to CASA assessment.

### 👨‍💻 Author
**Kiara Hoheb** [LinkedIn](https://www.linkedin.com/in/kiara-hoheb-641157244/)
