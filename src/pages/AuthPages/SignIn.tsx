import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import RedirectIfAuth from "../../components/auth/RedirectIfAuth";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In Admin Dashboard"
        description="Sign in to access your dashboard"
      />
      <RedirectIfAuth>
        <AuthLayout>
          <SignInForm />
        </AuthLayout>
      </RedirectIfAuth>
    </>
  );
}