import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";
import RedirectIfAuth from "../../components/auth/RedirectIfAuth";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="React.js SignUp Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js SignUp Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <RedirectIfAuth>
        <AuthLayout>
          <SignUpForm />
        </AuthLayout>
      </RedirectIfAuth>
    </>
  );
}
