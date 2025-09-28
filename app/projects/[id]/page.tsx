import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { getProjectServer } from '@/lib/project';
import { ProjectDetailClient } from './project-detail-client';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await getProjectServer(params.id);
  if (!project) {
    return notFound();
  }

  return (
    <>
      <Header />
      <ProjectDetailClient project={project} />
    </>
  );
}
