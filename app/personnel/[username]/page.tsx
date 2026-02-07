import { use } from 'react';
import UserProfilePage from '@/src/components/personnel/UserProfile/UserProfilePage';

interface PageProps {
  params: Promise<{ username: string }>;
}

/**
 * User Profile Route - App Router wrapper
 * Deleguje logikę do UserProfilePage komponentu
 */
export default function Page({ params }: PageProps) {
  const { username } = use(params);
  return <UserProfilePage username={username} />;
}
