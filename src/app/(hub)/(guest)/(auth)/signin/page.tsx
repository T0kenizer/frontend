import { SignInForm } from '@components/auth/forms/signin-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
};

const Page: React.FC = () => <SignInForm />;

export default Page;
