import { User as FirebaseAuthUser } from "firebase/auth";

export async function onboardUser(user: FirebaseAuthUser) {
  const functionUrl = "https://onboardnewuser-afsh2nntka-uc.a.run.app";

  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user.toJSON()),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('User onboarding successful');
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn("Onboarding request timed out - continuing with authentication");
    } else {
      console.error("Error calling onboardUser function:", error);
    }
    // Don't throw - allow authentication to continue even if onboarding fails
  }
}
