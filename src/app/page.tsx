'use client';

import dynamic from 'next/dynamic';

const StoryboardCollabSystem = dynamic(
  () => import('@/components/StoryboardCollabSystem'),
  { ssr: false }
);

export default function Home() {
  return <StoryboardCollabSystem />;
}
