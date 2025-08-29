import { Metadata } from "next";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import fetchNotes from "@/lib/api";
import { tagOptions, Tag } from "@/types/note";
import NotesClient from "./Notes.client";

type Props = { params: { slug?: string[] } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const maybeTag = slug?.[0];
  const tag: Tag | "All" = tagOptions.includes(maybeTag as Tag)
    ? (maybeTag as Tag)
    : "All";

  const title = tag === "All" ? "All Notes" : `Notes tag ${tag}`;
  const description =
    tag === "All"
      ? "Browse all notes in NoteHub. Organize, search, and manage your thoughts easily."
      : `Browse notes filtered by ${tag} in NoteHub. Organize, search, and manage your thoughts easily.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url:
        tag === "All"
          ? "https://08-zustand-omega-one.vercel.app/notes/filter/all"
          : `https://08-zustand-omega-one.vercel.app/notes/filter/${tag}`,
      images: ["https://ac.goit.global/fullstack/react/notehub-og-meta.jpg"],
    },
  };
}

export default async function NotesPage({ params }: Props) {
  const { slug } = params;
  const maybeTag = slug?.[0];
  const tag: Tag | undefined = tagOptions.includes(maybeTag as Tag)
    ? (maybeTag as Tag)
    : undefined;

  const queryClient = new QueryClient();

  // Початковий стан сторінки = 1, пошук = "" (щоб гідратити перший запит)
  await queryClient.prefetchQuery({
    queryKey: ["notes", { page: 1, q: "", tag: tag ?? null }],
    queryFn: () => fetchNotes({ page: 1, search: "", ...(tag ? { tag } : {}) }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient selectedTag={tag} />
    </HydrationBoundary>
  );
}
