import { ForgotPassword } from '@components/auth/forgot-password';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Your Password',
};

const Page: React.FC = () => <ForgotPassword />;

export default Page;
