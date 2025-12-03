# How to Setup Google Authentication

To enable the "Continue with Google" button, you need to get a **Client ID** and **Client Secret** from Google and add them to Supabase.

## Step 1: Create a Project in Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Sign in with your Google account.
3. Click the dropdown menu at the top left (next to the Google Cloud logo) and select **"New Project"**.
4. Name your project (e.g., "SoulScript Diary") and click **Create**.
5. Select the project you just created.

## Step 2: Configure OAuth Consent Screen

1. In the left sidebar, go to **APIs & Services > OAuth consent screen**.
2. Select **External** (unless you are a Google Workspace user and want it internal) and click **Create**.
3. Fill in the required App Information:
   - **App Name**: SoulScript
   - **User Support Email**: Your email.
   - **Developer Contact Information**: Your email.
4. Click **Save and Continue** through the "Scopes" and "Test Users" sections (you can leave them default for now).
5. On the Summary page, click **Back to Dashboard**.

## Step 3: Create Credentials

1. In the left sidebar, click **Credentials**.
2. Click **+ CREATE CREDENTIALS** at the top and select **OAuth client ID**.
3. **Application Type**: Select **Web application**.
4. **Name**: Web Client 1 (or "SoulScript Web").
5. **Authorized Redirect URIs**:
   - You need to get this URL from your Supabase Dashboard.
   - Go to Supabase > Authentication > Providers > Google.
   - Copy the **Callback URL** (it looks like `https://<your-project-ref>.supabase.co/auth/v1/callback`).
   - Paste this URL into the "Authorized redirect URIs" field in Google Cloud.
6. Click **Create**.

## Step 4: Get Client ID and Secret

1. A popup will appear with your **Client ID** and **Client Secret**.
2. Copy these strings.

## Step 5: Add to Supabase

1. Go back to your **Supabase Dashboard**.
2. Navigate to **Authentication > Providers > Google**.
3. Paste the **Client ID** and **Client Secret** into the respective fields.
4. Toggle **Enable Sign in with Google** to ON.
5. Click **Save**.

🎉 **Done!** Your "Continue with Google" button should now work.
