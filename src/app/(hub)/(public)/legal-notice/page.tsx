import { generateLegalMetadata } from '@components/legal/legal-metadata';
import { LegalPage } from '@components/legal/legal-page';
import { LegalDocument } from '@constants/legal';

export const generateMetadata = generateLegalMetadata(
  LegalDocument.LegalNotice,
);

const Page: React.FC = () => <LegalPage document={LegalDocument.LegalNotice} />;

export default Page;
