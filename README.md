# 🧹 EmailSweep
> A cloud-native email sanitizer built with Node.js and Google Cloud Platform.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-v24%2B-green)](https://nodejs.org)
---

## 📺 Project Demo
**[CLICK HERE TO WATCH THE DEMO VIDEO]** (coming soon) *In this video, I demonstrate the OAuth2 flow, the scanning algorithm identifying promotional emails, and the batch-processing "sweep" that clears them from the inbox.*

---

## 🚀 Overview
**EmailSweep** is a tool designed to help users regain control of their inboxes. By leveraging the **Gmail API**, it identifies high-volume senders and old promotional content, allowing users to archive or trash them in bulk.

### Key Features:
* **OAuth2 Authentication:** Secure login using Google's identity services.
* **Sensitive Scope Handling:** Efficiently manages `gmail.modify` permissions to clean without permanent data loss.
* **Batch Processing:** Avoids API rate limits by grouping "trash" requests.
* **Minimalist Dashboard:** Built for speed and clarity.

---

## 🏗️ Technical Stack
* **Backend:** Node.js, Express
* **Auth:** Google OAuth 2.0 (`google-auth-library`)
* **Cloud:** Google Cloud Platform (GCP)
* **API:** Gmail REST API

---

## 🔒 Security & Compliance Note
This project utilizes **Restricted Scopes** (`https://www.googleapis.com/auth/gmail.modify`). 

To comply with Google’s **CASA (Cloud App Security Assessment)** requirements without the overhead of a third-party audit, this application is currently in **Developer Testing Mode**. 

* **Public Access:** Restricted by Google.
* **How to Test:** If you are a recruiter or collaborator wishing to test the live environment, please reach out with your Gmail address to be added to the **Authorized Test Users** list in the GCP Console.

---

## ⚙️ Setup & Installation

1.  **Clone the repo:**
    ```bash
    git clone [https://github.com/kxtara/email-sweep.git](https://github.com/kxtara/email-sweep.git)
    cd emailsweep
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    GCP_PROJECT_ID=key-xxx-xxxx
    GCP_CLIENT_ID=your-client-id.apps.googleusercontent.com
    GCP_CLIENT_SECRET=your-client-secret
    GCP_REDIRECT_URI=http://localhost:3000/oauth2callback
    ```

4.  **Run the app:**
    ```bash
    npm start
    ```

---

## 🛠️ Lessons Learned
* **OAuth Lifecycle:** Navigating the complexities of refresh tokens vs. access tokens and maintaining session persistence.
* **API Optimization:** Implementing batching logic to handle Gmail API rate limits during large sweeps.
* **Security First:** Designing the app to use `modify` (Trash) instead of permanent `delete` to ensure user data remains recoverable for 30 days.

---

### 👨‍💻 Author
**Kiara Hoheb** [LinkedIn](https://www.linkedin.com/in/kiara-hoheb-641157244/)