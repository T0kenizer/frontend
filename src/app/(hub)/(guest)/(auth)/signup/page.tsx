import { SignUpForm } from '@components/auth/forms/signup-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create an Account',
};

const Page: React.FC = () => <SignUpForm />;

export default Page;
