import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicePage } from "@/src/demos/meridian/components/services/ServicePage";
import { getService, serviceSlugs } from "@/src/demos/meridian/data/services";
export function generateStaticParams() { return serviceSlugs.map((slug) => ({ slug })); }
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const service = getService(slug); return { title: service ? service.name : "Service not found", description: service?.summary }; }
export default async function Page({ params }: Props) { const { slug } = await params; const service = getService(slug); if (!service) notFound(); return <ServicePage service={service} />; }
